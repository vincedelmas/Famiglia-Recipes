import {serverEnv} from "~/env/server";
import {auth} from "~/lib/server/core/auth";
import {scryptSync, timingSafeEqual} from "crypto";
import {createServerFn} from "@tanstack/react-start";
import {getRequest} from "@tanstack/react-start/server";


export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
    const { headers } = getRequest();
    const session = await auth.api.getSession({ headers, query: { disableCookieCache: true } });

    if (!session?.user) {
        return null;
    }

    return {
        ...session.user,
        id: Number(session.user.id),
    };
});


export const validateKey = createServerFn({ method: "GET" })
    .validator((data: string) => data)
    .handler(async ({ data: submittedKey }) => {
        const salt = serverEnv.REGISTER_KEY_SALT;
        const keyHash = serverEnv.REGISTER_KEY_HASH;

        const submittedKeyHash = scryptSync(submittedKey, salt, 64);
        const storedKeyHash = Buffer.from(keyHash, "hex");

        return timingSafeEqual(submittedKeyHash, storedKeyHash);
    });
