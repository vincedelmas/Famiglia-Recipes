import {z} from "zod";


const ingredientSchema = z.object({
    quantity: z.number("Quantity is required").nonnegative(),
    description: z.string().min(1, "Ingredient is required").trim(),
});


const stepSchema = z.object({
    content: z.string().min(1, "Step cannot be empty").trim(),
});


export const recipeFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    cooking: z.number().int().nonnegative("Cooking time must be a positive number"),
    preparation: z.number().int().nonnegative("Preparation time must be a positive number"),
    servings: z.number().int().positive("Servings must be a positive number"),
    ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
    steps: z.array(stepSchema).min(1, "At least one step is required"),
    labels: z.array(z.string()).min(1, "At least one label is required"),
    comment: z.string().optional(),
});


export const frontRecipeFormSchema = recipeFormSchema.extend({
    comment: z.string().optional(),
    image: z.instanceof(File).optional(),
});


export const editRecipeSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required"),
    cooking: z.number().int().nonnegative("Cooking time must be a positive number"),
    preparation: z.number().int().nonnegative("Preparation time must be a positive number"),
    servings: z.number().int().positive("Servings must be a positive number"),
    ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
    steps: z.array(stepSchema).min(1, "At least one step is required"),
    labels: z.array(z.string()).min(1, "At least one label is required"),
});


export const imageRecipeSchema = z.instanceof(File)
    .refine((file: File) => file.size <= 20 * 1024 * 1024, "Max image size is 20MB.")
    .optional()


export const uploadRecipeSchema = z.object({
    type: z.enum(["file", "text"]),
    content: z.union([
        z.instanceof(File).refine((file: File) => file.size <= 20 * 1024 * 1024, `File size should be less than 20MB.`),
        z.string(),
    ]),
});


export type RecipeFormValues = z.infer<typeof frontRecipeFormSchema>;
