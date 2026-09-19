import {expect, test} from "bun:test";
import {editRecipeSchema, recipeFormSchema, uploadRecipeSchema} from "./schemas";

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

test("recipe import rejects mismatched payloads and oversized or empty text", () => {
    const file = new File(["image"], "recipe.png", {type: "image/png"});
    for (const input of [
        {type: "file", content: "not a file"},
        {type: "text", content: file},
        {type: "text", content: "   "},
        {type: "text", content: "x".repeat(10_001)},
        {type: "file", content: new File([], "recipe.png", {type: "image/png"})},
        {type: "file", content: new File(["doc"], "recipe.doc", {type: "application/msword"})},
        {type: "file", content: new File(["png"], "recipe.pdf", {type: "image/png"})},
    ]) expect(uploadRecipeSchema.safeParse(input).success).toBe(false);
    expect(uploadRecipeSchema.safeParse({type: "file", content: file}).success).toBe(true);
    expect(uploadRecipeSchema.parse({type: "text", content: " Family soup "}).content).toBe("Family soup");
});
