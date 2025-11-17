import {useState} from "react";
import {cn} from "~/lib/utils/helpers";
import {useForm} from "react-hook-form";
import {RATIO} from "~/lib/utils/constants";
import {LabelType} from "~/lib/types/types";
import {useTranslation} from "react-i18next";
import {useBlocker} from "@tanstack/react-router";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "~/lib/client/components/ui/input";
import {Button} from "~/lib/client/components/ui/button";
import {Textarea} from "~/lib/client/components/ui/textarea";
import {ImageCropper} from "~/lib/client/components/app/ImageCropper";
import {frontRecipeFormSchema, RecipeFormValues} from "~/lib/utils/schemas";
import UploadDialog from "~/lib/client/components/recipe-form/UploadDialog";
import {DynamicStepList} from "~/lib/client/components/recipe-form/StepsList";
import {LabelSelector} from "~/lib/client/components/recipe-form/LabelSelector";
import {DynamicIngredientList} from "~/lib/client/components/recipe-form/IngredientList";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/lib/client/components/ui/form";


interface RecipeFormProps {
    labels: LabelType[];
    pendingState: boolean;
    type: "Creation" | "Edition";
    initValues: RecipeFormValues;
    onSubmit: (data: RecipeFormValues) => void;
}


export const RecipeForm = ({ initValues, onSubmit, labels, pendingState, type }: RecipeFormProps) => {
    const { t } = useTranslation();
    const [blockerActive, setBlockerActive] = useState(true);
    const form = useForm<RecipeFormValues>({
        defaultValues: initValues,
        resolver: zodResolver(frontRecipeFormSchema),
    });

    useBlocker({
        shouldBlockFn: () => {
            if (!blockerActive) return false;
            if (!form.formState.isDirty) return false;
            return !confirm(t("block-confirm"));
        },
    });

    return (
        <div>
            {type === "Creation" &&
                <div className="mt-8 mb-7">
                    <div className="font-medium text-sm">
                        {t("ai-parsing")}
                    </div>
                    <UploadDialog form={form}/>
                </div>
            }
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn("space-y-7 w-[750px] max-sm:w-full", type === "Edition" && "mt-8")}
                >
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
                                        resultClassName="h-[150px]"
                                        onCropApplied={field.onChange}
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
                                    <FormLabel className="line-clamp-1">
                                        {t("r-preparation")}
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
                                    <FormLabel className="line-clamp-1">
                                        {t("r-cooking")}
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
                    <FormField
                        name="ingredients"
                        control={form.control}
                        render={() =>
                            <FormItem>
                                <FormLabel>{t("ingredients")}</FormLabel>
                                <FormControl>
                                    <DynamicIngredientList
                                        control={form.control}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        }
                    />
                    <FormField
                        name="steps"
                        control={form.control}
                        render={() =>
                            <FormItem>
                                <FormLabel>{t("r-steps")}</FormLabel>
                                <FormControl>
                                    <DynamicStepList
                                        control={form.control}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        }
                    />
                    <FormField
                        name="labels"
                        control={form.control}
                        render={({ field }) =>
                            <FormItem>
                                <FormLabel>Labels</FormLabel>
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
                    <Button
                        type="submit"
                        className="w-52"
                        onClick={() => setBlockerActive(false)}
                        disabled={pendingState || form.formState.isSubmitting}
                    >
                        {type === "Creation" ? t("r-add") : t("r-edit")}
                    </Button>
                </form>
            </Form>
        </div>
    );
};
