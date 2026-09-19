import React from "react";
import {Minus, Plus} from "lucide-react";
import {useTranslation} from "react-i18next";
import {RecipeFormValues} from "~/lib/utils/schemas";
import {Input} from "~/lib/client/components/ui/input";
import {Control, useFieldArray} from "react-hook-form";
import {Button} from "~/lib/client/components/ui/button";
import {FormControl, FormField, FormItem, FormMessage} from "~/lib/client/components/ui/form";


interface DynIngListProps {
    control: Control<RecipeFormValues>;
}


export const DynamicIngredientList = ({ control }: DynIngListProps) => {
    const { t } = useTranslation();
    const { fields, append, remove } = useFieldArray({ control, name: "ingredients" });

    const addIngredient = (ev: React.MouseEvent | React.KeyboardEvent) => {
        ev.preventDefault();
        append({ quantity: 0, description: "" });
    };

    const removeIngredient = (ev: React.MouseEvent, idx: number) => {
        ev.preventDefault();
        remove(idx);
    };

    const handleOnEnter = (ev: React.KeyboardEvent) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            addIngredient(ev);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {fields.map((field, idx) =>
                <div key={field.id} className="flex items-start gap-2">
                    <FormField
                        control={control}
                        name={`ingredients.${idx}.quantity`}
                        render={({ field }) => (
                            <FormItem className="w-20 shrink-0 sm:w-24">
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        className="w-20 sm:w-24"
                                        onKeyDown={handleOnEnter}
                                        aria-label={`${t("quantity")} ${idx + 1}`}
                                        placeholder={t("quantity")}
                                        min={0}
                                        step="any"
                                        onChange={(ev) => {
                                            const value = Number(ev.target.value);
                                            field.onChange(isNaN(value) ? "" : value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`ingredients.${idx}.description`}
                        render={({ field }) => (
                            <FormItem className="min-w-0 flex-1">
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="min-w-0 flex-1"
                                        onKeyDown={handleOnEnter}
                                        aria-label={`${t("ingredient")} ${idx + 1}`}
                                        placeholder={t("ingredient")}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        className="shrink-0"
                        aria-label={t("ui.remove-ingredient", {number:idx + 1})}
                        disabled={fields.length === 1}
                        onClick={(ev) => removeIngredient(ev, idx)}
                    >
                        <Minus/>
                    </Button>
                </div>
            )}
            <Button type="button" onClick={addIngredient} variant="outline" className="self-start">
                <Plus data-icon="inline-start"/> {t("ui.add-ingredient")}
            </Button>
        </div>
    );
};
