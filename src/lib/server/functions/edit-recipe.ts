import {z} from "zod";
import {db} from "~/lib/server/database/db";
import {asc, eq, inArray} from "drizzle-orm";
import {notFound} from "@tanstack/react-router";
import {HEIGHT, WIDTH} from "~/lib/utils/constants";
import {createServerFn} from "@tanstack/react-start";
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
            .from(label)
            .orderBy(asc(label.order));

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

        const checkRecipe = db
            .select()
            .from(recipeTable)
            .where(eq(recipeTable.id, parseInt(recipeData.id)))
            .get();

        if (!checkRecipe) {
            throw new FormattedError("Recipe not found");
        }

        const labels = await db
            .select()
            .from(label)
            .where(inArray(label.name, recipeData.labels));

        if (labels.length !== new Set(recipeData.labels).size) {
            throw new FormattedError("Unknown recipe category");
        }

        const url = new URL(checkRecipe.image);
        let coverName = url.pathname.split("/").pop() as string;

        if (formDataImage) {
            coverName = await saveUploadedImage({
                file: formDataImage,
                resize: { width: WIDTH, height: HEIGHT },
            });
        }

        const steps = recipeData.steps.map((step) => ({ description: step.content }));

        const ingredients = recipeData.ingredients.map((ing) => ({
            proportion: ing.quantity,
            ingredient: ing.description,
        }));

        try {
            db.transaction((tx) => {
                tx.update(recipeTable)
                    .set({
                        steps,
                        ingredients,
                        image: coverName,
                        title: recipeData.title,
                        servings: recipeData.servings,
                        cookingTime: recipeData.cooking,
                        prepTime: recipeData.preparation,
                    })
                    .where(eq(recipeTable.id, checkRecipe.id))
                    .run();

                tx.delete(recipeLabel)
                    .where(eq(recipeLabel.recipeId, checkRecipe.id))
                    .run();

                if (labels.length) {
                    tx.insert(recipeLabel)
                        .values(labels.map(l => ({
                            labelId: l.id,
                            recipeId: checkRecipe.id,
                        })))
                        .run();
                }
            });
        }
        catch (error) {
            if (formDataImage) await deleteImage(coverName);
            throw error;
        }

        if (formDataImage) {
            await deleteImage(checkRecipe.image);
        }
    });
