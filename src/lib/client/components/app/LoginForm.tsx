import {useForm} from "react-hook-form";
import {LoaderCircle} from "lucide-react";
import {useTranslation} from "react-i18next";
import authClient from "~/lib/utils/auth-client";
import {getRouteApi, Link, useNavigate, useRouter} from "@tanstack/react-router";
import {useQueryClient} from "@tanstack/react-query";
import {Input} from "~/lib/client/components/ui/input";
import {FieldGroup} from "~/lib/client/components/ui/field";
import {FormButton} from "~/lib/client/components/app/FormButton";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/lib/client/components/ui/form";


interface FormValues {
    email: string;
    password: string;
}


export const LoginForm = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { authOptions } = getRouteApi("__root__").useRouteContext();

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
        <div>
            <header className="mb-7">
                <h2 className="font-heading text-3xl tracking-tight">
                    {t("welcome-back")}
                </h2>
            </header>
            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <fieldset disabled={form.formState.isSubmitting} className="min-w-0">
                            <FieldGroup>
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
                                                    autoComplete="email"
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
                                                    autoComplete="current-password"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                            </FieldGroup>
                        </fieldset>
                        {form.formState.errors.root &&
                            <p role="alert" className="text-sm text-destructive">
                                {form.formState.errors.root.message}
                            </p>
                        }
                        <FormButton disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <LoaderCircle className="size-4 animate-spin"/>}{" "}
                            {t("login")}
                        </FormButton>
                    </form>
                </Form>
            </div>
        </div>
    );
};
