import {z} from "zod";
import {eq, inArray} from "drizzle-orm";
import {db} from "~/lib/server/database/db";
import {notFound} from "@tanstack/react-router";
import {createServerFn} from "@tanstack/react-start";
import {HEIGHT, WIDTH} from "~/lib/utils/constants";
import {FormattedError} from "~/lib/utils/error-classes";
import {authMiddleware} from "~/lib/server/middleware/auth-guard";
import {tryFormZodError, tryOrNotFound} from "~/lib/utils/zod-errors";
import {editRecipeSchema, imageRecipeSchema} from "~/lib/utils/schemas";
import {deleteImage, saveUploadedImage} from "~/lib/utils/image-handler";
import {label, recipe as recipeTable, recipe, recipeLabel} from "~/lib/server/database/schema";


export const getEditRecipe = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator((data) => tryOrNotFound(() => z.coerce.number().int().positive().parse(data)))
    .handler(async ({ data: recipeId }) => {
        const singleRecipe = await db.query.recipe.findFirst({
            where: eq(recipe.id, recipeId),
            with: { recipeLabels: { with: { label: true } } }
        });
        if (!singleRecipe) {
            throw notFound();
        }

        const allLabelsResult = await db
            .select()
            .from(label);

        const recipeResult = {
            ...singleRecipe,
            recipeLabels: singleRecipe.recipeLabels.map((item) => item.label),
        }

        return {
            recipe: recipeResult,
            labels: allLabelsResult,
        };
    })


export const postEditRecipe = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator((data: FormData) => {
        if (!(data instanceof FormData)) throw new Error("Invalid FormData");
        return data;
    })
    .handler(async ({ data }) => {
        const formDataImage = data.get("image") as File;
        const formDataRecipe: string = data.get("recipe") as string;

        const recipeData = tryFormZodError(() => editRecipeSchema.parse(JSON.parse(formDataRecipe)));
        if (formDataImage) {
            tryFormZodError(() => imageRecipeSchema.parse(formDataImage));
        }

        const checkRecipe = await db
            .select()
            .from(recipeTable)
            .where(eq(recipeTable.id, parseInt(recipeData.id)))
            .get();

        if (!checkRecipe) {
            throw new FormattedError("Recipe not found");
        }

        const url = new URL(checkRecipe.image);
        let coverName = url.pathname.split("/").pop() as string;
        if (formDataImage) {
            coverName = await saveUploadedImage({
                file: formDataImage,
                resize: { width: WIDTH, height: HEIGHT },
            });

            await deleteImage(checkRecipe.image);
        }

        const steps = recipeData.steps.map((step) => ({ description: step.content }));

        const labels = await db
            .select()
            .from(label)
            .where(inArray(label.name, recipeData.labels))

        const ingredients = recipeData.ingredients.map((ing) => ({
            proportion: ing.quantity,
            ingredient: ing.description,
        }));

        await db
            .update(recipeTable)
            .set({
                steps: steps,
                image: coverName,
                title: recipeData.title,
                ingredients: ingredients,
                servings: recipeData.servings,
                cookingTime: recipeData.cooking,
                prepTime: recipeData.preparation,
            })
            .where(eq(recipeTable.id, checkRecipe.id));

        await db
            .delete(recipeLabel)
            .where(eq(recipeLabel.recipeId, checkRecipe.id));

        await db
            .insert(recipeLabel)
            .values(labels.map((l) => ({ recipeId: checkRecipe.id, labelId: l.id })));
    });
