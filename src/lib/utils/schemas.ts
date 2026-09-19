import {z} from "zod";
import {MAX_IMPORT_FILE_SIZE, MAX_IMPORT_TEXT_LENGTH, RECIPE_IMPORT_FILE_TYPES} from "./constants";


const ingredientSchema = z.object({
    quantity: z.number("Quantity is required").nonnegative(),
    description: z.string().trim().min(1, "Ingredient is required"),
});


const stepSchema = z.object({
    content: z.string().trim().min(1, "Step cannot be empty"),
});


export const recipeFormSchema = z.object({
    comment: z.string().optional(),
    title: z.string().trim().min(1, "Title is required"),
    servings: z.number().int().positive("Servings must be a positive number"),
    steps: z.array(stepSchema).min(1, "At least one step is required"),
    labels: z.array(z.string()).min(1, "At least one label is required"),
    cooking: z.number().int().nonnegative("Cooking time must be a positive number"),
    preparation: z.number().int().nonnegative("Preparation time must be a positive number"),
    ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
});


export const frontRecipeFormSchema = recipeFormSchema.extend({
    image: z.instanceof(File).optional(),
});


export const editRecipeSchema = recipeFormSchema.omit({ comment: true }).extend({
    id: z.string().regex(/^[1-9]\d*$/, "Invalid recipe ID"),
});


export const imageRecipeSchema = z.instanceof(File)
    .refine((file: File) => file.size <= 20 * 1024 * 1024, "Max image size is 20MB.")
    .optional()


export const recipeImportFileSchema = z.instanceof(File)
    .refine(file => file.size > 0, "error-file-empty")
    .refine(file => file.size <= MAX_IMPORT_FILE_SIZE, "error-file-size")
    .refine(file => RECIPE_IMPORT_FILE_TYPES[file.type]
        ?.some(extension => file.name.toLowerCase().endsWith(extension)), "error-file-type");

export const recipeImportTextSchema = z.string().max(MAX_IMPORT_TEXT_LENGTH).trim().min(1);

export const uploadRecipeSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("file"), content: recipeImportFileSchema }),
    z.object({ type: z.literal("text"), content: recipeImportTextSchema }),
]);


export type RecipeFormValues = z.infer<typeof frontRecipeFormSchema>;
