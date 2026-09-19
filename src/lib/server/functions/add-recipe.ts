import {asc, inArray} from "drizzle-orm";
import {db} from "~/lib/server/database/db";
import {HEIGHT, WIDTH} from "~/lib/utils/constants";
import {createServerFn} from "@tanstack/react-start";
import {callGeminiModel} from "~/lib/utils/LLM-call";
import {tryFormZodError} from "~/lib/utils/zod-errors";
import {FormattedError} from "~/lib/utils/error-classes";
import {authMiddleware} from "~/lib/server/middleware/auth-guard";
import {deleteImage, saveUploadedImage} from "~/lib/utils/image-handler";
import {comment, label, recipe, recipeLabel} from "~/lib/server/database/schema";
import {imageRecipeSchema, recipeFormSchema, recipeImportTextSchema, uploadRecipeSchema} from "~/lib/utils/schemas";


export const getLabels = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async () => {
        return db
            .select()
            .from(label)
            .orderBy(asc(label.order));
    });


export const postAddRecipe = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator((data: FormData) => {
        if (!(data instanceof FormData)) throw new Error("Invalid FormData");
        return data;
    })
    .handler(async ({ data, context: { currentUser } }) => {
        const formDataImage = data.get("image") as File;
        const formDataRecipe: string = data.get("recipe") as string;

        if (formDataImage) tryFormZodError(() => imageRecipeSchema.parse(formDataImage))
        const recipeData = tryFormZodError(() => recipeFormSchema.parse(JSON.parse(formDataRecipe)));

        const matchingLabels = await db
            .select()
            .from(label)
            .where(inArray(label.name, recipeData.labels));

        if (matchingLabels.length !== new Set(recipeData.labels).size) {
            throw new FormattedError("Unknown recipe category");
        }

        let coverName = "default.png";
        if (formDataImage) {
            coverName = await saveUploadedImage({
                file: formDataImage,
                resize: { width: WIDTH, height: HEIGHT },
            });
        }

        const steps = recipeData.steps.map(step => ({ description: step.content }));
        const ingredients = recipeData.ingredients.map((ing) => ({
            proportion: ing.quantity,
            ingredient: ing.description,
        }));

        try {
            db.transaction((tx) => {
                const newRecipe = tx
                    .insert(recipe)
                    .values({
                        steps: steps,
                        image: coverName,
                        title: recipeData.title,
                        ingredients: ingredients,
                        submitterId: currentUser.id,
                        servings: recipeData.servings,
                        cookingTime: recipeData.cooking,
                        prepTime: recipeData.preparation,
                    })
                    .returning()
                    .get();

                if (matchingLabels.length) {
                    tx.insert(recipeLabel)
                        .values(matchingLabels.map(l => ({ recipeId: newRecipe.id, labelId: l.id })))
                        .run();
                }

                if (recipeData.comment) {
                    tx.insert(comment)
                        .values({
                            userId: currentUser.id,
                            recipeId: newRecipe.id,
                            content: recipeData.comment,
                        }).run();
                }
            });
        }
        catch (error) {
            if (formDataImage) await deleteImage(coverName);
            throw error;
        }
    });


export const uploadRecipeForParsing = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator((data: FormData) => {
        if (!(data instanceof FormData)) throw new Error("Invalid FormData");
        return data;
    })
    .handler(async ({ data }) => {
        let fileForAI: File | null = null;
        let textContent: string | null = null;

        const validatedData = tryFormZodError(() => uploadRecipeSchema.parse({
            type: data.get("type"),
            content: data.get("content"),
        }));

        if (validatedData.type === "text") {
            textContent = validatedData.content;
        }
        else {
            const file = validatedData.content;
            if (file.name.toLowerCase().endsWith(".docx")) {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const { default: mammoth } = await import("mammoth");
                    const result = await mammoth.extractRawText({ buffer: buffer });
                    textContent = tryFormZodError(() => recipeImportTextSchema.parse(result.value));
                }
                catch {
                    throw new FormattedError("Failed to extract text. Try another one.");
                }
            }
            else {
                fileForAI = file;
            }
        }

        return callGeminiModel(textContent, fileForAI);
    })
