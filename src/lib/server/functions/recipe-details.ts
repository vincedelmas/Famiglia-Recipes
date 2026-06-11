import {z} from "zod";
import {db} from "~/lib/server/database/db";
import {and, desc, eq, sql} from "drizzle-orm";
import {notFound} from "@tanstack/react-router";
import {createServerFn} from "@tanstack/react-start";
import {tryOrNotFound} from "~/lib/utils/zod-errors";
import {deleteImage} from "~/lib/utils/image-handler";
import {FormattedError} from "~/lib/utils/error-classes";
import {authMiddleware} from "~/lib/server/middleware/auth-guard";
import {comment, favorites, recipe, recipe as recipeTable} from "~/lib/server/database/schema";


export const getDetails = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(data => tryOrNotFound(() => z.coerce.number().int().positive().parse(data)))
    .handler(async ({ data: recipeId, context: { currentUser } }) => {
        const recipeDetails = await db.query.recipe.findFirst({
            where: eq(recipeTable.id, recipeId),
            with: {
                submitter: true,
                recipeLabels: { with: { label: true } },
                favorites: {
                    where: (favorite) => eq(favorite.userId, currentUser.id),
                },
            },
        });

        if (!recipeDetails) {
            throw notFound();
        }

        return {
            id: recipeDetails.id,
            title: recipeDetails.title,
            steps: recipeDetails.steps,
            coverImage: recipeDetails.image,
            prepTime: recipeDetails.prepTime,
            servings: recipeDetails.servings,
            submitterId: recipeDetails.submitterId,
            cookingTime: recipeDetails.cookingTime,
            ingredients: recipeDetails.ingredients,
            submittedDate: recipeDetails.submittedDate,
            submitterName: recipeDetails.submitter.name,
            isFavorited: recipeDetails.favorites.length > 0,
            labels: recipeDetails.recipeLabels.map((recipeLabel) => recipeLabel.label),
        };
    });


export const deleteRecipe = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator((data) => z.coerce.number().int().positive().parse(data))
    .handler(async ({ data: recipeId, context: { currentUser } }) => {
        if (currentUser.role !== "manager") {
            throw new FormattedError("Unauthorized");
        }

        const recipeToDelete = await db
            .select({ image: recipe.image })
            .from(recipe)
            .where(eq(recipe.id, recipeId))
            .get();

        if (!recipeToDelete) {
            throw new FormattedError("Recipe not found");
        }

        await db
            .delete(recipe)
            .where(eq(recipe.id, recipeId));

        await deleteImage(recipeToDelete.image);
    });


export const favoriteRecipe = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator((data) => z.coerce.number().int().positive().parse(data))
    .handler(async ({ data: recipeId, context: { currentUser } }) => {
        const existingFavorite = await db
            .select()
            .from(favorites)
            .where(and(eq(favorites.userId, currentUser.id), eq(favorites.recipeId, recipeId)))
            .get()

        if (existingFavorite) {
            await db
                .delete(favorites)
                .where(and(eq(favorites.userId, currentUser.id), eq(favorites.recipeId, recipeId)));
        }
        else {
            await db
                .insert(favorites)
                .values({ userId: currentUser.id, recipeId });
        }
    });


export const getComments = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator((data) => tryOrNotFound(() => z.coerce.number().int().positive().parse(data)))
    .handler(async ({ data: recipeId }) => {
        return db.query.comment.findMany({
            where: eq(comment.recipeId, recipeId),
            with: { user: true },
            orderBy: desc(comment.createdAt),
        })
    });


export const addComment = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator((data) => z.object({ content: z.string().min(1), recipeId: z.number().int().positive() }).parse(data))
    .handler(async ({ data: { content, recipeId }, context: { currentUser } }) => {
        if (!content.trim()) {
            throw new FormattedError("Comment cannot be empty");
        }

        const recipeResults = await db
            .select()
            .from(recipeTable)
            .where(eq(recipeTable.id, recipeId))
            .get();

        if (!recipeResults) {
            throw new FormattedError("Recipe does not exist");
        }

        await db
            .insert(comment)
            .values({ content, recipeId, userId: currentUser.id });
    });


export const editComment = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator((data) => z.object({ content: z.string().min(1), commentId: z.number().int().positive() }).parse(data))
    .handler(async ({ data: { commentId, content }, context: { currentUser } }) => {
        const commentToUpdate = await db.query.comment.findFirst({
            where: (comment) => eq(comment.id, commentId),
        });

        if (!commentToUpdate) {
            throw new FormattedError("Comment not found");
        }

        if (currentUser.id !== commentToUpdate.userId) {
            throw new FormattedError("You can only edit your own comments");
        }

        if (!content.trim()) {
            throw new FormattedError("Comment cannot be empty");
        }

        await db
            .update(comment)
            .set({
                content,
                updatedAt: sql`datetime('now')`,
            })
            .where(eq(comment.id, commentId));
    });


export const deleteComment = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator((data) => z.coerce.number().int().positive().parse(data))
    .handler(async ({ data: commentId, context: { currentUser } }) => {
        const checkComment = await db
            .select()
            .from(comment)
            .where(eq(comment.id, commentId))
            .get();

        if (!checkComment) {
            throw new FormattedError("Comment not found");
        }

        if (checkComment.userId !== currentUser.id) {
            throw new FormattedError("You can only delete your own comments");
        }

        await db
            .delete(comment)
            .where(eq(comment.id, checkComment.id));
    });
