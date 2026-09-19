import React from "react";
import {ReorderButtons} from "~/lib/client/components/recipe-form/ReorderButtons";
import {Minus, Plus} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Button} from "~/lib/client/components/ui/button";
import {Textarea} from "~/lib/client/components/ui/textarea";
import {Control, useFieldArray} from "react-hook-form";
import {RecipeFormValues} from "~/lib/utils/schemas";
import {FormControl, FormField, FormItem, FormMessage} from "~/lib/client/components/ui/form";


interface DynamicStepListProps {
    control: Control<RecipeFormValues>;
}


export const DynamicStepList = ({ control }: DynamicStepListProps) => {
    const { t } = useTranslation();
    const { fields, append, remove, move } = useFieldArray({ control, name: "steps" });

    const addStep = (ev: React.MouseEvent) => {
        ev.preventDefault();
        append({ content: "" });
    };

    const removeStep = (idx: number) => {
        remove(idx);
    };

    return (
        <div className="flex flex-col gap-3">
            {fields.map((field, idx) =>
                <div key={field.id} className="flex items-start gap-3">
                    <ReorderButtons index={idx} count={fields.length} item={`${t("step")} ${idx + 1}`} onMove={move}/>
                    <FormField
                        control={control}
                        name={`steps.${idx}.content`}
                        render={({ field }) =>
                            <FormItem className="min-w-0 flex-1">
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        className="min-w-0 flex-1"
                                        aria-label={`${t("step")} ${idx + 1}`}
                                        placeholder={`${t("step")} ${idx + 1}`}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        }
                    />
                    <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        className="shrink-0"
                        aria-label={t("ui.remove-step", {number:idx + 1})}
                        disabled={fields.length === 1}
                        onClick={() => removeStep(idx)}
                    >
                        <Minus/>
                    </Button>
                </div>
            )}
            <Button type="button" onClick={addStep} variant="outline" className="self-start">
                <Plus data-icon="inline-start"/> {t("ui.add-step")}
            </Button>
        </div>
    );
};