import Database from "bun:sqlite";
import {expect, mock, test} from "bun:test";
import {drizzle} from "drizzle-orm/bun-sqlite";
import {migrate} from "drizzle-orm/bun-sqlite/migrator";

mock.module("@/env/client", () => ({clientEnv: {VITE_BASE_URL: "http://localhost:3000"}}));
const schema = await import("../../database/schema");
const sqlite = new Database(":memory:");
const db = drizzle(sqlite, {schema, casing: "snake_case"});
mock.module("@/lib/server/database/db", () => ({db}));
const {getMcpAccess, revokeMcpConnection, getMcpConnections} = await import("./connections");
const {MCP_RESOURCE, MCP_READ_SCOPE} = await import("../../../utils/mcp");

test("disconnect is user-scoped and old JWTs stay revoked after reconnecting", () => {
    migrate(db, {migrationsFolder: "./drizzle"});
    sqlite.run("PRAGMA foreign_keys = ON");
    const now = new Date();
    for (const id of [1, 2]) {
        db.insert(schema.user).values({id, name: `User ${id}`, email: `${id}@example.com`, emailVerified: true, createdAt: now, updatedAt: now}).run();
        db.insert(schema.session).values({id, userId: id, token: `session-${id}`, createdAt: now, updatedAt: now, expiresAt: new Date(Date.now() + 60000)}).run();
    }
    db.insert(schema.oauthClient).values({clientId: "assistant", redirectUris: ["https://example.com/callback"]}).run();
    const grant = {clientId: "assistant", scopes: [MCP_READ_SCOPE], resources: [MCP_RESOURCE], createdAt: now, updatedAt: now};
    for (const userId of [1, 2]) db.insert(schema.oauthConsent).values({...grant, userId}).run();
    const claims = {sub: "1", sid: "1", client_id: "assistant", scope: MCP_READ_SCOPE, famigliaIssuedAt: Date.now() - 1000};
    expect(getMcpAccess(claims)?.userId).toBe(1);
    expect(getMcpAccess({...claims, sid: "2"})).toBeNull();
    expect(getMcpAccess({...claims, sub: "invalid"})).toBeNull();
    revokeMcpConnection(1, "assistant");
    expect(getMcpAccess(claims)).toBeNull();
    expect(getMcpConnections(1)).toHaveLength(0);
    expect(getMcpConnections(2)).toHaveLength(1);
    db.insert(schema.oauthConsent).values({...grant, userId: 1}).run();
    expect(getMcpAccess(claims)).toBeNull();
    expect(getMcpAccess({...claims, famigliaIssuedAt: Date.now() + 1})?.userId).toBe(1);
    sqlite.close();
});
