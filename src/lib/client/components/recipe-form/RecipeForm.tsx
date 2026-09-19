import {useRef} from "react";
import {useForm} from "react-hook-form";
import {RATIO} from "~/lib/utils/constants";
import {LabelType} from "~/lib/types/types";
import {useTranslation} from "react-i18next";
import {useBlocker} from "@tanstack/react-router";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "~/lib/client/components/ui/input";
import {Button} from "~/lib/client/components/ui/button";
import {BookOpen, Leaf, LoaderCircle} from "lucide-react";
import {Textarea} from "~/lib/client/components/ui/textarea";
import {ImageCropper} from "~/lib/client/components/app/ImageCropper";
import {frontRecipeFormSchema, RecipeFormValues} from "~/lib/utils/schemas";
import UploadDialog from "~/lib/client/components/recipe-form/UploadDialog";
import {DynamicStepList} from "~/lib/client/components/recipe-form/StepsList";
import {LabelSelector} from "~/lib/client/components/recipe-form/LabelSelector";
import {FieldGroup, FieldLegend, FieldSet} from "~/lib/client/components/ui/field";
import {DynamicIngredientList} from "~/lib/client/components/recipe-form/IngredientList";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/lib/client/components/ui/form";


interface RecipeFormProps {
    labels: LabelType[];
    pendingState: boolean;
    type: "Creation" | "Edition";
    initValues: RecipeFormValues;
    onSubmit: (data: RecipeFormValues) => Promise<void>;
}


export const RecipeForm = ({ initValues, onSubmit, labels, pendingState, type }: RecipeFormProps) => {
    const { t } = useTranslation();
    const submitting = useRef(false);
    const form = useForm<RecipeFormValues>({
        defaultValues: initValues,
        resolver: zodResolver(frontRecipeFormSchema),
    });

    const { isDirty } = form.formState;

    useBlocker({
        shouldBlockFn: () => {
            if (submitting.current) return false;
            if (!isDirty) return false;
            return !confirm(t("block-confirm"));
        },
    });

    const onSubmitHandler = async (submittedData: RecipeFormValues) => {
        submitting.current = true;

        try {
            await onSubmit(submittedData);
        }
        catch {
            form.setError("root", { message: t("unexpected-error") });
        }
        finally {
            submitting.current = false;
        }
    }

    return (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_280px] lg:gap-10">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmitHandler)}
                    className="flex min-w-0 flex-col gap-6"
                >
                    <FieldSet className="recipe-form-section">
                        <FieldLegend>{t("ui.basics")}</FieldLegend>
                        <FieldGroup>
                            <FormField
                                name="image"
                                control={form.control}
                                render={({ field }) =>
                                    <FormItem>
                                        <FormLabel>{t("r-image")}</FormLabel>
                                        <FormControl>
                                            <ImageCropper
                                                aspect={RATIO}
                                                cropShape="rect"
                                                fileName={field.name}
                                                onCropApplied={field.onChange}
                                                resultClassName="max-h-64 w-full rounded-xl object-cover"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                }
                            />
                            <FormField
                                name="title"
                                control={form.control}
                                render={({ field }) =>
                                    <FormItem>
                                        <FormLabel>{t("r-title")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder={t("r-title")}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                }
                            />
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    name="preparation"
                                    control={form.control}
                                    render={({ field }) =>
                                        <FormItem>
                                            <FormLabel>
                                                {t("ui.prep-minutes")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type={"number"}
                                                    onChange={(ev) => {
                                                        const value = parseInt(ev.target.value, 10);
                                                        field.onChange(isNaN(value) ? "" : value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                                <FormField
                                    name="cooking"
                                    control={form.control}
                                    render={({ field }) =>
                                        <FormItem>
                                            <FormLabel>
                                                {t("ui.cooking-minutes")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type={"number"}
                                                    onChange={(ev) => {
                                                        const value = parseInt(ev.target.value, 10);
                                                        field.onChange(isNaN(value) ? "" : value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                                <FormField
                                    name="servings"
                                    control={form.control}
                                    render={({ field }) =>
                                        <FormItem>
                                            <FormLabel>{t("r-servings")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type={"number"}
                                                    onChange={(ev) => {
                                                        const value = parseInt(ev.target.value, 10);
                                                        field.onChange(isNaN(value) ? "" : value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                            </div>
                        </FieldGroup>
                    </FieldSet>
                    <FieldSet className="recipe-form-section">
                        <FieldLegend>{t("ingredients")}</FieldLegend>
                        <p className="mb-5 text-sm text-muted-foreground">{t("ui.ingredients-note")}</p>
                        <FieldGroup>
                            <FormField
                                name="ingredients"
                                control={form.control}
                                render={() =>
                                    <FormItem>
                                        <FormLabel className="sr-only">{t("ingredients")}</FormLabel>
                                        <FormControl>
                                            <DynamicIngredientList
                                                control={form.control}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                }
                            />
                        </FieldGroup>
                    </FieldSet>
                    <FieldSet className="recipe-form-section">
                        <FieldLegend>{t("ui.instructions")}</FieldLegend>
                        <p className="mb-5 text-sm text-muted-foreground">{t("ui.steps-note")}</p>
                        <FieldGroup>
                            <FormField
                                name="steps"
                                control={form.control}
                                render={() =>
                                    <FormItem>
                                        <FormLabel className="sr-only">{t("r-steps")}</FormLabel>
                                        <FormControl>
                                            <DynamicStepList
                                                control={form.control}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                }
                            />
                        </FieldGroup>
                    </FieldSet>
                    <FieldSet className="recipe-form-section">
                        <FieldLegend>{t("ui.finishing-touches")}</FieldLegend>
                        <FieldGroup>
                            <FormField
                                name="labels"
                                control={form.control}
                                render={({ field }) =>
                                    <FormItem>
                                        <FormLabel>{t("ui.labels")}</FormLabel>
                                        <FormControl>
                                            <LabelSelector
                                                labelsList={labels}
                                                selectedLabels={field.value}
                                                setSelectedLabels={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                }
                            />
                            {type === "Creation" &&
                                <FormField
                                    name="comment"
                                    control={form.control}
                                    render={({ field }) =>
                                        <FormItem>
                                            <FormLabel>{t("comment")}</FormLabel>
                                            <FormControl>
                                                <Textarea {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    }
                                />
                            }
                        </FieldGroup>
                    </FieldSet>
                    {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
                    <Button
                        type="submit"
                        className="w-full sm:w-fit"
                        size="lg"
                        disabled={pendingState || form.formState.isSubmitting}
                    >
                        {pendingState ? <LoaderCircle data-icon="inline-start" className="animate-spin"/> : <BookOpen data-icon="inline-start"/>}
                        {type === "Creation" ? t("r-add") : t("r-edit")}
                    </Button>
                </form>
            </Form>
            <aside className="order-first flex flex-col gap-6 lg:sticky lg:top-28 lg:order-last">
                {type === "Creation" && <div className="rounded-2xl border border-primary/15 bg-accent/50 p-6">
                    <BookOpen className="mb-4 size-6 text-primary" strokeWidth={1.5}/>
                    <h2 className="font-heading text-xl tracking-tight">{t("ui.import-title")}</h2>
                    <p className="mb-5 mt-2 text-sm leading-6 text-muted-foreground">{t("ui.import-note")}</p>
                    <UploadDialog form={form}/>
                </div>}
                <div className="hidden px-3 lg:block"><Leaf className="mb-3 size-5 text-primary" strokeWidth={1.5}/><p
                    className="font-heading text-xl leading-relaxed text-muted-foreground italic">{t("ui.recipe-tip")}</p></div>
            </aside>
        </div>
    );
};
