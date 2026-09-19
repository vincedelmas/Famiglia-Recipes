import {useForm} from "react-hook-form";
import {ArrowLeft, LoaderCircle} from "lucide-react";
import {useTranslation} from "react-i18next";
import authClient from "~/lib/utils/auth-client";
import {toast} from "~/lib/client/components/ui/toast";
import {Input} from "~/lib/client/components/ui/input";
import {FieldGroup} from "~/lib/client/components/ui/field";
import {createFileRoute, Link, useNavigate} from "@tanstack/react-router";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {FormButton} from "~/lib/client/components/app/FormButton";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/lib/client/components/ui/form";


export const Route = createFileRoute("/_public/forgot-password")({
    component: ForgotPasswordPage,
});


function ForgotPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const form = useForm<{ email: string }>({
        defaultValues: {
            email: "",
        }
    });

    const onSubmit = async (submitted: { email: string }) => {
        await authClient.requestPasswordReset({ email: submitted.email, redirectTo: "/reset-password" }, {
            onError: (ctx) => {
                toast.add({ type: "error", title: ctx.error.message });
            },
            onSuccess: async () => {
                toast.add({ type: "success", title: "An email was sent to reset your password." });
                await navigate({ to: "/", replace: true })
            }
        });
    };

    return (
        <PageTitle title={t("fp-title")} subtitle={t("fp-subtitle")}>
            <div className="max-w-lg rounded-2xl border bg-card p-6 sm:p-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <FormField
                                name="email"
                                control={form.control}
                                rules={{ required: "Email is required" }}
                                render={({ field }) =>
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="john.doe@example.com"
                                                disabled={form.formState.isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                }
                            />
                            <FormButton disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <LoaderCircle className="size-4 animate-spin"/>}
                                {t("submit")}
                            </FormButton>
                        </FieldGroup>
                    </form>
                </Form>
            </div>
            <Link to="/" className="text-link mt-6">
                <ArrowLeft className="size-4"/>
                {t("take-me-home")}
            </Link>
        </PageTitle>
    );
}