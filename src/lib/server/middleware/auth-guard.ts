import {auth} from "@/lib/server/core/auth";
import {redirect} from "@tanstack/react-router";
import {createMiddleware} from "@tanstack/react-start";
import {getRequest} from "@tanstack/react-start/server";
import {FormattedError} from "@/lib/utils/error-classes";
import {MCP_READ_SCOPE, MCP_WRITE_SCOPE} from "@/lib/utils/mcp";
import {mcpRequestContext} from "@/lib/server/core/mcp/tool-context";


const publicAuthMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
    const { headers } = getRequest();
    const session = await auth.api.getSession({ headers, query: { disableCookieCache: true } });

    return next({
        context: {
            currentUser: session?.user ? { ...session.user, id: Number(session.user.id) } : undefined
        }
    });
});


export const authMiddleware = createMiddleware({ type: "function" })
    .middleware([publicAuthMiddleware])
    .server(({ next, context: { currentUser } }) => {
        if (!currentUser) {
            throw redirect({ to: "/", search: { authExpired: true }, statusCode: 401 });
        }

        return next({ context: { currentUser } });
    });


// Only server functions using this middleware accept MCP
export const recipeReadMiddleware = createMiddleware({ type: "function" })
    .middleware([publicAuthMiddleware])
    .server(({ next, context }) => {
        const access = mcpRequestContext.getStore();

        if (access && !access.scopes.has(MCP_READ_SCOPE)) {
            throw new FormattedError("This connection does not have permission to read recipes.");
        }

        const currentUser = access
            ? { id: access.userId, role: "user" }
            : context.currentUser;

        if (!currentUser) {
            throw redirect({ to: "/", search: { authExpired: true }, statusCode: 401 });
        }

        return next({ context: { currentUser } });
    });


export const recipeWriteMiddleware = createMiddleware({ type: "function" })
    .middleware([recipeReadMiddleware])
    .server(({ next }) => {
        const access = mcpRequestContext.getStore();

        if (access && !access.scopes.has(MCP_WRITE_SCOPE)) {
            throw new FormattedError("This connection does not have permission to add or modify recipes.");
        }

        return next();
    });
