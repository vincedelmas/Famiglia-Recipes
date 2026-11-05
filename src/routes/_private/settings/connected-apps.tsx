import {PageTitle} from "@/lib/client/components/app/PageTitle";
import {Empty, EmptyHeader, EmptyTitle} from "@/lib/client/components/ui/empty";
import {MCP_WRITE_SCOPE} from "@/lib/utils/mcp";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {Button} from "@/lib/client/components/ui/button";
import {connectedAppsOptions} from "@/lib/client/react-query/queryOptions";
import {useDisconnectAppMutation} from "@/lib/client/react-query/mutations";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/lib/client/components/ui/card";


export const Route = createFileRoute("/_private/settings/connected-apps")({
    context: () => ({
        connectedAppsOptions,
    }),
    loader: ({ context }) => {
        return context.queryClient.query({ ...context.connectedAppsOptions, staleTime: "static" });
    },
    component: ConnectedApps,
});


function ConnectedApps() {
    const disconnect = useDisconnectAppMutation();
    const { connectedAppsOptions } = Route.useRouteContext();
    const apiData = useSuspenseQuery(connectedAppsOptions).data;

    return (
        <PageTitle title="Connected apps" onlyHelmet>
            <section className="mx-auto w-full max-w-2xl px-5 py-16">
                <p className="mb-3 text-sm text-muted-foreground">
                    Settings
                </p>
                <h1 className="mb-8 font-heading text-4xl">
                    Connected apps
                </h1>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Your connections
                        </CardTitle>
                        <CardDescription>
                            Manage assistants connected to Famiglia. Disconnecting immediately removes their access.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        {apiData.length === 0 &&
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>No connected apps yet.</EmptyTitle>
                                </EmptyHeader>
                            </Empty>
                        }

                        {apiData.map((app) =>
                            <div key={app.clientId} className="flex items-center justify-between gap-4 border-b pb-5 last:border-0 last:pb-0">
                                <div className="flex flex-col gap-1">
                                    <p className="font-medium">
                                        {app.name || "Unnamed assistant"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {app.scopes.includes(MCP_WRITE_SCOPE) ? "Read and write access" : "Read access"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Connected {new Date(app.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button variant="outline" disabled={disconnect.isPending} onClick={() => disconnect.mutate(app.clientId)}>
                                    Disconnect
                                </Button>
                            </div>
                        )}

                        {disconnect.isError &&
                            <p role="alert" className="text-destructive">
                                Could not disconnect the app. Please try again.
                            </p>
                        }
                    </CardContent>
                </Card>
            </section>
        </PageTitle>
    );
}
