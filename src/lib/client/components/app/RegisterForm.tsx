import {toast} from "~/lib/client/components/ui/toast";
import {useForm} from "react-hook-form";
import {LoaderCircle} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Input} from "~/lib/client/components/ui/input";
import authClient from "~/lib/utils/auth-client";
import {validateKey} from "~/lib/server/functions/user";
import {FormButton} from "~/lib/client/components/app/FormButton";
import {Card, CardContent, CardHeader, CardTitle} from "~/lib/client/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/lib/client/components/ui/form";


interface FormValues {
    email: string;
    username: string;
    password: string;
    registerKey: string;
    confirmPassword: string;
}


export const RegisterForm = () => {
    const { t } = useTranslation();
    const form = useForm<FormValues>({
        shouldFocusError: false,
        defaultValues: {
            email: "",
            username: "",
            password: "",
            registerKey: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (submitted: FormValues) => {
        const isKeyValid = await validateKey({ data: submitted.registerKey });

        if (!isKeyValid) {
            form.setError("registerKey", { type: "value", message: t("invalid-register-key") }, { shouldFocus: false });
            return;
        }

        await authClient.signUp.email({
            email: submitted.email,
            name: submitted.username,
            password: submitted.password,
        }, {
            onError: (ctx) => {
                form.setError("root", { type: "value", message: ctx.error.message }, { shouldFocus: false });
            },
            onSuccess: () => {
                form.reset();
                toast.add({ type: "success", title: t("email-sent") });
            },
        });
    };

    return (
        <Card className="pt-4 pb-6">
            <CardHeader>
                <CardTitle className="flex justify-center text-lg mb-4">
                    {t("create-account")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <fieldset disabled={form.formState.isSubmitting}>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    rules={{
                                        required: "A username is required",
                                        minLength: { value: 3, message: "The username is too short (3 min)" },
                                        maxLength: { value: 15, message: "The username is too long (15 max)" },
                                    }}
                                    render={({ field }) =>
                                        <FormItem>
                                            <FormLabel>{t("username")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Username"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    rules={{ required: "An email is required" }}
                                    render={({ field }) =>
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="john.doe@example.com"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    rules={{
                                        required: "A password is required",
                                        minLength: { value: 8, message: "The password must have at least 8 characters" },
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
                                        validate: (val) => {
                                            if (form.watch("password") !== val) {
                                                return "The passwords do not match";
                                            }
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
                                <FormField
                                    control={form.control}
                                    name="registerKey"
                                    rules={{ required: "The register key is required" }}
                                    render={({ field }) =>
                                        <FormItem>
                                            <FormLabel>{t("register-key")}</FormLabel>
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
                            <FormMessage className="text-center -mt-1.5">
                                {form.formState.errors.root.message}
                            </FormMessage>
                        }
                        <FormButton disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <LoaderCircle className="size-4 animate-spin"/>} {t("register")}
                        </FormButton>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
