import z from "zod";
import {auth} from "@/lib/server/core/auth";
import {createServerFn} from "@tanstack/react-start";
import {getRequest} from "@tanstack/react-start/server";
import {authMiddleware} from "@/lib/server/middleware/auth-guard";
import {getMcpConnections, revokeMcpConnection} from "@/lib/server/core/mcp/connections";


export const getConnectedApps = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(({ context: { currentUser } }) => {
        return getMcpConnections(currentUser.id);
    });


export const disconnectApp = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(z.object({ clientId: z.string().min(1) }))
    .handler(({ data, context: { currentUser } }) => {
        return revokeMcpConnection(currentUser.id, data.clientId);
    });


export const getMcpConsentRequest = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(z.object({ oauthQuery: z.string().min(1).max(16384) }))
    .handler(async ({ data }) => {
        const query = new URLSearchParams(data.oauthQuery);

        // Endpoint verifies signed authorization query before returning client metadata
        const client = await auth.api.getOAuthClientPublicPrelogin({
            headers: getRequest().headers,
            body: {
                oauth_query: data.oauthQuery,
                client_id: query.get("client_id") ?? "",
            },
        });

        return {
            name: client.client_name || "Unnamed assistant",
            callbackOrigin: new URL(query.get("redirect_uri")!).origin,
            scopes: (query.get("scope") ?? "").split(" ").filter(Boolean),
        };
    });
