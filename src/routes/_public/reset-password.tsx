import {toast} from "~/lib/client/components/ui/toast";
import {useForm} from "react-hook-form";
import {LoaderCircle} from "lucide-react";
import {useTranslation} from "react-i18next";
import authClient from "~/lib/utils/auth-client";
import {Input} from "~/lib/client/components/ui/input";
import {Button} from "~/lib/client/components/ui/button";
import {FieldGroup} from "~/lib/client/components/ui/field";
import {ArrowLeft} from "lucide-react";
import {Link} from "@tanstack/react-router";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/lib/client/components/ui/form";


export const Route = createFileRoute("/_public/reset-password")({
    validateSearch: (search) => search as { token: string },
    loaderDeps: ({ search }) => ({ search }),
    component: ResetPasswordPage,
});


type FormValues = {
    newPassword: string,
    confirmPassword: string,
}


function ResetPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token } = Route.useSearch();
    const form = useForm<FormValues>({
        defaultValues: {
            newPassword: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async (submitted: FormValues) => {
        if (!token) {
            toast.add({ type: "error", title: t("invalid-token") });
            return navigate({ to: "/", replace: true });
        }

        await authClient.resetPassword({
            token: token,
            newPassword: submitted.newPassword,
        }, {
            onError: () => {
                toast.add({ type: "error", title: t("unexpected-error") });
            },
            onSuccess: async () => {
                form.reset();
                toast.add({ type: "success", title: t("success-pass-modified") });
                await navigate({ to: "/", replace: true });
            }
        });
    };

    return (
        <PageTitle title={t("rp-title")} subtitle={t("rp-subtitle")}>
            <div className="max-w-lg rounded-2xl border bg-card p-6 sm:p-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}><FieldGroup>
                        <fieldset disabled={form.formState.isSubmitting}>
                            <div className="flex flex-col gap-5">
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    rules={{
                                        required: "The password is required.",
                                        minLength: { value: 8, message: "The password must have at least 8 characters." },
                                    }}
                                    render={({ field }) =>
                                        <FormItem>
                                            <FormLabel>{t("password")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    placeholder="********"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    rules={{
                                        required: "The password confirmation is required.",
                                        validate: (val) => {
                                            if (form.watch("newPassword") !== val) return "The passwords do not match.";
                                        }
                                    }}
                                    render={({ field }) =>
                                        <FormItem>
                                            <FormLabel>{t("confirm-password")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    placeholder="********"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                            </div>
                        </fieldset>
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <LoaderCircle className="size-4 animate-spin"/>} {t("submit")}
                        </Button>
                    </FieldGroup></form>
                </Form>
            </div>
            <Link to="/" className="text-link mt-6"><ArrowLeft className="size-4"/>{t("take-me-home")}</Link>
        </PageTitle>
    );
}
