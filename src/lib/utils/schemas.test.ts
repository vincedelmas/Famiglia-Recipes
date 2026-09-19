import {expect, test} from "bun:test";
import {editRecipeSchema, recipeFormSchema} from "./schemas";

const recipe = {
    title: "Family soup", cooking: 10, preparation: 5, servings: 2,
    ingredients: [{quantity: 1, description: "onion"}],
    steps: [{content: "Chop the onion."}], labels: ["Plat"],
};

test("create and edit reject whitespace-only recipe fields", () => {
    for (const invalid of [
        {...recipe, title: "   "},
        {...recipe, ingredients: [{quantity: 1, description: " \t "}]},
        {...recipe, steps: [{content: " \n "}]},
    ]) {
        expect(recipeFormSchema.safeParse(invalid).success).toBe(false);
        expect(editRecipeSchema.safeParse({...invalid, id: "1"}).success).toBe(false);
    }
});

test("edit requires a positive integer recipe ID", () => {
    for (const id of ["", "0", "-1", "1abc", "1.5"]) {
        expect(editRecipeSchema.safeParse({...recipe, id}).success).toBe(false);
    }
    expect(editRecipeSchema.parse({...recipe, id: "12"}).id).toBe("12");
});
