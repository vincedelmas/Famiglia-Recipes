import * as z from "zod";
import {createEnv} from "@t3-oss/env-core";


export const serverEnv = createEnv({
    server: {
        // Database
        DATABASE_URL: z.string().default("./instance/site.db"),

        // Image Managements
        UPLOADS_DIR_NAME: z.string().default("static"),
        BASE_UPLOADS_LOCATION: z.string().default("./public/static/recipe-images"),

        // Register Keys/Secrets
        REGISTER_KEY: z.string(),
        REGISTER_KEY_SALT: z.string(),
        REGISTER_KEY_HASH: z.string(),

        // Better-Auth
        BETTER_AUTH_SECRET: z.string().min(20),

        // Admin Secrets
        ADMIN_MAIL_USERNAME: z.email(),
        ADMIN_MAIL_PASSWORD: z.string().min(8),

        // OPEN ROUTER
        OPEN_ROUTER_API_KEY: z.string(),
        OPEN_ROUTER_MODEL_ID: z.string(),
    },
    runtimeEnv: process.env,
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
