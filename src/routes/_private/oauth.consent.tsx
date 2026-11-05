import {PageTitle} from "@/lib/client/components/app/PageTitle";
import {useState} from "react";
import {useSuspenseQuery} from "@tanstack/react-query";
import {Button} from "@/lib/client/components/ui/button";
import {Checkbox} from "@/lib/client/components/ui/checkbox";
import {createFileRoute, Link} from "@tanstack/react-router";
import {MCP_OFFLINE_ACCESS_SCOPE, MCP_READ_SCOPE, MCP_WRITE_SCOPE} from "@/lib/utils/mcp";
import {Field, FieldLabel} from "@/lib/client/components/ui/field";
import {useMcpConsentMutation} from "@/lib/client/react-query/mutations";
import {mcpConsentRequestOptions} from "@/lib/client/react-query/queryOptions";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/lib/client/components/ui/card";


export const Route = createFileRoute("/_private/oauth/consent")({
    beforeLoad: () => {
        const oauthQuery = window.location.search.slice(1);

        return {
            oauthQuery,
            consentOptions: mcpConsentRequestOptions(oauthQuery),
        };
    },
    loader: ({ context }) => {
        return context.queryClient.query({ ...context.consentOptions, staleTime: "static" });
    },
    component: Consent,
});


function Consent() {
    const { oauthQuery, consentOptions } = Route.useRouteContext();

    const apiData = useSuspenseQuery(consentOptions).data;
    const [readOnly, setReadOnly] = useState(false);
    const mutation = useMcpConsentMutation({ oauthQuery, scopes: apiData.scopes, readOnly });

    return (
        <PageTitle title="Authorize connection" onlyHelmet>
            <section className="mx-auto w-full max-w-lg px-5 py-16">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Connect {apiData.name} to Famiglia?
                        </CardTitle>
                        <CardDescription>
                            Review the access requested for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        {apiData.scopes.includes(MCP_READ_SCOPE) &&
                            <p>Read recipes available to your account.</p>
                        }

                        {apiData.scopes.includes(MCP_WRITE_SCOPE) &&
                            <>
                                <p>Add recipes to the shared family cookbook.</p>
                                <Field orientation="horizontal">
                                    <Checkbox
                                        id="mcp-read-only"
                                        checked={readOnly}
                                        disabled={mutation.isPending}
                                        onCheckedChange={checked => setReadOnly(checked)}
                                    />
                                    <FieldLabel htmlFor="mcp-read-only">
                                        Allow reading only
                                    </FieldLabel>
                                </Field>
                            </>
                        }

                        <p className="text-sm text-muted-foreground">
                            Disconnect any time in{" "}
                            <Link to="/settings/connected-apps" className="underline">
                                Connected apps
                            </Link>.
                        </p>

                        {apiData.scopes.includes(MCP_OFFLINE_ACCESS_SCOPE) &&
                            <p className="text-sm text-muted-foreground">
                                This connection can stay signed in between conversations.
                            </p>
                        }

                        <p className="break-all text-xs text-muted-foreground">
                            Return address: {apiData.callbackOrigin}. The requesting app provides its name.
                        </p>

                        {mutation.isError &&
                            <p role="alert" className="text-sm text-destructive">
                                {mutation.error.message}
                            </p>
                        }
                    </CardContent>
                    <CardFooter className="justify-end gap-3">
                        <Button variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate(false)}>
                            Cancel
                        </Button>
                        <Button disabled={mutation.isPending} onClick={() => mutation.mutate(true)}>
                            Allow connection
                        </Button>
                    </CardFooter>
                </Card>
            </section>
        </PageTitle>
    );
}
