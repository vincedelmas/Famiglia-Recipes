import * as React from "react";
import {cn} from "~/lib/utils/helpers";
import {useRender} from "@base-ui/react/use-render";
import {Label} from "~/lib/client/components/ui/label";
import {Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext, useFormState} from "react-hook-form";


const Form = FormProvider;


type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    name: TName
}


const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);


const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) => {

    const contextValue = React.useMemo(() => ({ name: props.name }), [props.name]);

    return (
        <FormFieldContext value={contextValue}>
            <Controller {...props}/>
        </FormFieldContext>
    );
}


const useFormField = () => {
    const { getFieldState } = useFormContext();
    const itemContext = React.use(FormItemContext);
    const fieldContext = React.use(FormFieldContext);
    const formState = useFormState({ name: fieldContext.name });
    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formMessageId: `${id}-form-item-message`,
        formDescriptionId: `${id}-form-item-description`,
        ...fieldState,
    }
}


type FormItemContextValue = {
    id: string;
}


const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);


function FormItem({ className, ...props }: React.ComponentProps<"div">) {
    const id = React.useId();

    const idMemo = React.useMemo(() => ({ id }), [id]);

    return (
        <FormItemContext value={idMemo}>
            <div
                data-slot="form-item"
                className={cn("grid gap-2", className)}
                {...props}
            />
        </FormItemContext>
    );
}


function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
    const { error, formItemId } = useFormField();

    return (
        <Label
            data-error={!!error}
            htmlFor={formItemId}
            data-slot="form-label"
            className={cn("data-[error=true]:text-destructive-foreground", className)}
            {...props}
        />
    );
}


function FormControl({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children: React.ReactElement }) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return useRender({
        render: children,
        props: {
            id: formItemId,
            "aria-invalid": !!error,
            "aria-describedby": error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId,
            ...props,
        },
        state: { slot: "form-control" },
    });
}


function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
    const { formDescriptionId } = useFormField();

    return (
        <p
            data-slot="form-description"
            id={formDescriptionId}
            className={cn("text-muted-foreground text-sm", className)}
            {...props}
        />
    )
}


function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? "") : props.children;

    if (!body) {
        return null;
    }

    return (
        <p
            data-slot="form-message"
            id={formMessageId}
            className={cn("text-destructive text-sm", className)}
            {...props}
        >
            {body}
        </p>
    );
}


export {
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
}
