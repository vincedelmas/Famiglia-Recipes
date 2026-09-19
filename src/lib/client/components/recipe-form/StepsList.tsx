import React from "react";
import {useGT} from "gt-react";
import {Minus, Plus} from "lucide-react";
import {RecipeFormValues} from "~/lib/utils/schemas";
import {Control, useFieldArray} from "react-hook-form";
import {Button} from "~/lib/client/components/ui/button";
import {Textarea} from "~/lib/client/components/ui/textarea";
import {ReorderButtons} from "~/lib/client/components/recipe-form/ReorderButtons";
import {FormControl, FormField, FormItem, FormMessage} from "~/lib/client/components/ui/form";


interface DynamicStepListProps {
    control: Control<RecipeFormValues>;
}


export const DynamicStepList = ({ control }: DynamicStepListProps) => {
    const gt = useGT();
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
                    <ReorderButtons
                        index={idx}
                        onMove={move}
                        count={fields.length}
                        item={`${gt("Step")} ${idx + 1}`}
                    />

                    <FormField
                        control={control}
                        name={`steps.${idx}.content`}
                        render={({ field }) =>
                            <FormItem className="min-w-0 flex-1">
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        className="min-w-0 flex-1"
                                        aria-label={`${gt("Step")} ${idx + 1}`}
                                        placeholder={`${gt("Step")} ${idx + 1}`}
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
                        disabled={fields.length === 1}
                        onClick={() => removeStep(idx)}
                        aria-label={gt("Remove step {number}", { number: idx + 1 })}
                    >
                        <Minus/>
                    </Button>
                </div>
            )}
            <Button type="button" onClick={addStep} variant="outline" className="self-start">
                <Plus data-icon="inline-start"/> Add a step
            </Button>
        </div>
    );
};
