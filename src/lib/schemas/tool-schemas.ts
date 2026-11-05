import {z} from "zod";
import {recipeFormSchema} from "@/lib/utils/schemas";


export const getRecipeInputSchema = z.object({
    recipeId: z.number().int().positive().optional()
        .describe("Recipe ID from a previous result or a Famiglia recipe link."),
    title: z.string().trim().min(1).max(120).optional()
        .describe("Recipe title or part of it, treated as literal text."),
}).refine(input => (input.title !== undefined) !== (input.recipeId !== undefined), {
    message: "Provide exactly one of title or recipeId.",
});


export const recipeLabelsInputSchema = z.object({});


export const addRecipeInputSchema = recipeFormSchema.extend({
    title: recipeFormSchema.shape.title.describe("Recipe title in French."),
    comment: recipeFormSchema.shape.comment.describe("Optional recipe comment in French."),
    cooking: recipeFormSchema.shape.cooking.describe("Cooking time in minutes."),
    preparation: recipeFormSchema.shape.preparation.describe("Preparation time in minutes."),
    labels: recipeFormSchema.shape.labels.describe("Exact category names returned by get_recipe_labels."),
    steps: recipeFormSchema.shape.steps.describe("Recipe steps written in French, in preparation order."),
    ingredients: recipeFormSchema.shape.ingredients.describe(
        "Quantities for the given servings. Write the unit and ingredient name in French in description, e.g. quantity: 200, description: 'g de farine'.",
    ),
});
