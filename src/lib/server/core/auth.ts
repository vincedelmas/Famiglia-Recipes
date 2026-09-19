import {clientEnv} from "~/env/client";
import {serverEnv} from "~/env/server";
import {db} from "~/lib/server/database/db";
import {betterAuth} from "better-auth/minimal";
import {sendEmail} from "~/lib/utils/mail-sender";
import {scryptSync, timingSafeEqual} from "node:crypto";
import {createServerOnlyFn} from "@tanstack/react-start";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {APIError, createAuthMiddleware} from "better-auth/api";
import {tanstackStartCookies} from "better-auth/tanstack-start";
import {checkWerkzeugPassword, generatePasswordHash} from "~/lib/server/core/security";


const getAuthConfig = createServerOnlyFn(() => betterAuth({
    appName: "Famiglia-Recipes",
    baseURL: clientEnv.VITE_BASE_URL,
    secret: serverEnv.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
    user: {
        additionalFields: {
            role: {
                input: false,
                type: "string",
                returned: true,
                defaultValue: "user",
            }
        }
    },
    hooks: {
        before: createAuthMiddleware(async ctx => {
            if (ctx.path !== "/sign-up/email") return;

            const registrationKey = ctx.headers?.get("x-registration-key");

            if (
                !registrationKey ||
                !timingSafeEqual(
                    scryptSync(registrationKey, serverEnv.REGISTER_KEY_SALT, 64),
                    Buffer.from(serverEnv.REGISTER_KEY_HASH, "hex"),
                )
            ) {
                throw new APIError("BAD_REQUEST", {
                    code: "INVALID_REGISTRATION_KEY",
                    message: "Invalid registration key",
                });
            }
        }),
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        requireEmailVerification: true,
        resetPasswordTokenExpiresIn: 3600,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                link: url,
                to: user.email,
                username: user.name,
                template: "resetPassword",
                subject: "Famiglia-Recipes - Reset your password",
            });
        },
        password: {
            hash: async (password: string) => {
                return generatePasswordHash(password);
            },
            verify: async ({ hash, password }) => {
                return checkWerkzeugPassword(password, hash);
            },
        },
    },
    emailVerification: {
        expiresIn: 3600,
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            const verificationUrl = new URL(url);
            verificationUrl.searchParams.set("callbackURL", new URL("/dashboard", clientEnv.VITE_BASE_URL).href);
            await sendEmail({
                to: user.email,
                link: verificationUrl.href,
                username: user.name,
                template: "register",
                subject: "Famiglia-Recipes - Verify your email address",
            });
        },
    },
    advanced: {
        cookiePrefix: "famiglia-recipes",
        database: {
            generateId: false,
        },
    },
    plugins: [
        tanstackStartCookies(),
    ]
}));


export const auth = getAuthConfig();
