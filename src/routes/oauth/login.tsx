import {PageTitle} from "@/lib/client/components/app/PageTitle";
import {createFileRoute} from "@tanstack/react-router";
import {LoginForm} from "@/lib/client/components/app/LoginForm";


export const Route = createFileRoute("/oauth/login")({
    component: OauthLogin,
});


function OauthLogin() {
    return (
        <PageTitle title="Connect your account" onlyHelmet>
            <section className="mx-auto w-full max-w-sm px-5 py-16">
                <p className="mb-6 text-muted-foreground">
                    Sign in to connect your Famiglia account.
                </p>
                <LoginForm
                    oauth={true}
                />
            </section>
        </PageTitle>
    )
}
