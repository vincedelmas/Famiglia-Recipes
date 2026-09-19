import {auth} from "~/lib/server/core/auth";
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
