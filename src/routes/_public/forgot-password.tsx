import {toast} from "sonner";
import {useForm} from "react-hook-form";
import {LoaderCircle} from "lucide-react";
import {useTranslation} from "react-i18next";
import authClient from "~/lib/utils/auth-client";
import {Input} from "~/lib/client/components/ui/input";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {FormButton} from "~/lib/client/components/app/FormButton";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
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
        await authClient.requestPasswordReset({
            email: submitted.email,
            redirectTo: "/reset-password",
        }, {
            onError: (ctx) => {
                toast.error(ctx.error.message);
            },
            onSuccess: async () => {
                toast.success("An email was send to reset your password.")
                await navigate({ to: "/", replace: true })
            }
        });
    };

    return (
        <PageTitle title={t("fp-title")} subtitle={t("fp-subtitle")}>
            <div className="mt-4 max-w-75">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            {form.formState.isSubmitting && <LoaderCircle className="size-4 animate-spin"/>} {t("submit")}
                        </FormButton>
                    </form>
                </Form>
            </div>
        </PageTitle>
    );
}