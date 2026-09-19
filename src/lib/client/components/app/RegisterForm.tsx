import {useGT} from "gt-react";
import {useForm} from "react-hook-form";
import {LoaderCircle} from "lucide-react";
import authClient from "~/lib/utils/auth-client";
import {toast} from "~/lib/client/components/ui/toast";
import {Input} from "~/lib/client/components/ui/input";
import {FieldGroup} from "~/lib/client/components/ui/field";
import {FormButton} from "~/lib/client/components/app/FormButton";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/lib/client/components/ui/form";


interface FormValues {
    email: string;
    username: string;
    password: string;
    registerKey: string;
    confirmPassword: string;
}


export const RegisterForm = () => {
    const gt = useGT();
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
        await authClient.signUp.email({
            email: submitted.email,
            name: submitted.username,
            password: submitted.password,
        }, {
            headers: {
                "x-registration-key": submitted.registerKey,
            },
            onError: (ctx) => {
                const invalidKey = ctx.error.code === "INVALID_REGISTRATION_KEY";

                form.setError(invalidKey ? "registerKey" : "root", {
                    type: "value",
                    message: invalidKey
                        ? gt("Invalid invitation key")
                        : ctx.error.message,
                }, { shouldFocus: false });
            },
            onSuccess: () => {
                form.reset();
                toast.add({ type: "success", title: gt("An email was sent to confirm your account.") });
            },
        });
    };

    return (
        <div>
            <header className="mb-7">
                <h2 className="font-heading text-3xl tracking-tight">
                    Create an account
                </h2>
            </header>
            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <fieldset disabled={form.formState.isSubmitting} className="min-w-0">
                            <FieldGroup>
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
                                            <FormLabel>Your name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    autoComplete="name"
                                                    placeholder={gt("Your name")}
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
                                                    autoComplete="email"
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
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    autoComplete="new-password"
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
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    autoComplete="new-password"
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
                                            <FormLabel>Invitation key</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    autoComplete="new-password"
                                                    placeholder="********"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                            </FieldGroup>
                        </fieldset>

                        {form.formState.errors.root &&
                            <p role="alert" className="text-center -mt-1.5">
                                {form.formState.errors.root.message}
                            </p>
                        }

                        <FormButton disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <LoaderCircle className="size-4 animate-spin"/>}{" "}
                            Create an account
                        </FormButton>
                    </form>
                </Form>
            </div>
        </div>
    );
};
