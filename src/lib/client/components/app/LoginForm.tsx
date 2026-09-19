import {useForm} from "react-hook-form";
import {LoaderCircle} from "lucide-react";
import {useTranslation} from "react-i18next";
import authClient from "~/lib/utils/auth-client";
import {getRouteApi} from "@tanstack/react-router";
import {useQueryClient} from "@tanstack/react-query";
import {Input} from "~/lib/client/components/ui/input";
import {FormButton} from "~/lib/client/components/app/FormButton";
import {Link, useNavigate, useRouter} from "@tanstack/react-router";
import {Card, CardContent, CardHeader, CardTitle} from "~/lib/client/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/lib/client/components/ui/form";


interface FormValues {
    email: string;
    password: string;
}


export const LoginForm = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { authOptions } = getRouteApi("__root__").useRouteContext();
    const queryClient = useQueryClient();
    const form = useForm<FormValues>({
        shouldFocusError: false,
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (submitted: FormValues) => {
        await authClient.signIn.email({
            rememberMe: true,
            email: submitted.email,
            password: submitted.password,
        }, {
            onError: (ctx) => {
                if (ctx.error.status === 403) {
                    form.setError("root", {
                        type: "value",
                        message: "Please validate your email. A validation link has been sent.",
                    }, { shouldFocus: false });
                }
                else {
                    form.setError("root", { type: "value", message: ctx.error.message }, { shouldFocus: false });
                }
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: authOptions.queryKey });
                await router.invalidate();
                await navigate({ to: "/dashboard", replace: true });
            }
        });
    };


    return (
        <Card className="pt-4 pb-6">
            <CardHeader>
                <CardTitle className="flex justify-center text-lg mb-4">
                    {t("welcome-back")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <fieldset disabled={form.formState.isSubmitting}>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    rules={{ required: "Please enter a valid email" }}
                                    render={({ field }) =>
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="Email"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    rules={{ required: "This field is required" }}
                                    render={({ field }) =>
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>{t("password")}</FormLabel>
                                                <Link to="/forgot-password" className="text-sm underline" tabIndex={-1}>
                                                    {t("forgot-password")}
                                                </Link>
                                            </div>
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
                        {form.formState.errors.root &&
                            <FormMessage className="text-center">
                                {form.formState.errors.root.message}
                            </FormMessage>
                        }
                        <FormButton disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <LoaderCircle className="size-4 animate-spin"/>} {t("login")}
                        </FormButton>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
