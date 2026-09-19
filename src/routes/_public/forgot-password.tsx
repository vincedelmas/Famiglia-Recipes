import {useGT} from "gt-react";
import {useForm} from "react-hook-form";
import authClient from "~/lib/utils/auth-client";
import {ArrowLeft, LoaderCircle} from "lucide-react";
import {toast} from "~/lib/client/components/ui/toast";
import {Input} from "~/lib/client/components/ui/input";
import {FieldGroup} from "~/lib/client/components/ui/field";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {FormButton} from "~/lib/client/components/app/FormButton";
import {createFileRoute, Link, useNavigate} from "@tanstack/react-router";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/lib/client/components/ui/form";


export const Route = createFileRoute("/_public/forgot-password")({
    component: ForgotPasswordPage,
});


function ForgotPasswordPage() {
    const gt = useGT();
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
        <PageTitle title={gt("Forgot password")} subtitle={<>We’ll send you a link to reset your password.</>}>
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
                                Submit
                            </FormButton>
                        </FieldGroup>
                    </form>
                </Form>
            </div>
            <Link to="/" className="text-link mt-6">
                <ArrowLeft className="size-4"/>
                Back to home
            </Link>
        </PageTitle>
    );
}
