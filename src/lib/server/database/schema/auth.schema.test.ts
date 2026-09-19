import Database from "bun:sqlite";
import {expect, test} from "bun:test";
import * as schema from "./auth.schema";
import {betterAuth} from "better-auth/minimal";
import {drizzle} from "drizzle-orm/bun-sqlite";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {checkWerkzeugPassword, generatePasswordHash} from "../../core/security";


test("existing numeric credential accounts can sign in and create a session", async () => {
    const sqlite = new Database(":memory:");

    try {
        sqlite.run(await Bun.file(new URL("../../../../../drizzle/0000_overrated_adam_warlock.sql", import.meta.url)).text());

        const now = Math.floor(Date.now() / 1000);
        sqlite.run("INSERT INTO user (id, name, email, email_verified, created_at, updated_at) VALUES (1, 'Test', 'test@example.com', 1, ?, ?)", [now, now]);
        sqlite.run("INSERT INTO account (account_id, provider_id, user_id, password, created_at, updated_at) VALUES (1, 'credential', 1, ?, ?, ?)", [generatePasswordHash("local-test-password"), now, now]);

        sqlite.run(await Bun.file(new URL("../../../../../drizzle/0002_credential_account_id_text.sql", import.meta.url)).text());

        expect(sqlite.query("SELECT typeof(account_id) AS type FROM account").get()).toEqual({ type: "text" });

        const auth = betterAuth({
            baseURL: "http://localhost:3000",
            secret: "isolated-auth-regression-test-secret-123456",
            database: drizzleAdapter(drizzle(sqlite, { schema }), { provider: "sqlite" }),
            advanced: { database: { generateId: false } },
            emailAndPassword: {
                enabled: true,
                requireEmailVerification: true,
                password: {
                    hash: async (password) => generatePasswordHash(password),
                    verify: async ({ hash, password }) => checkWerkzeugPassword(password, hash),
                },
            },
        });
        const response = await auth.handler(new Request("http://localhost:3000/api/auth/sign-in/email", {
            method: "POST",
            headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
            body: JSON.stringify({ email: "test@example.com", password: "local-test-password" }),
        }));
        expect(response.status).toBe(200);
        expect(sqlite.query("SELECT count(*) AS count FROM session").get()).toEqual({ count: 1 });
        const cookie = response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
        const sessionResponse = await auth.handler(new Request("http://localhost:3000/api/auth/get-session", {
            headers: { cookie },
        }));
        expect((await sessionResponse.json()).user.id).toBe("1");

        const rejected = await auth.handler(new Request("http://localhost:3000/api/auth/sign-in/email", {
            method: "POST",
            headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
            body: JSON.stringify({ email: "test@example.com", password: "wrong-password" }),
        }));
        expect(rejected.status).toBe(401);
    }
    finally {
        sqlite.close();
    }
});
