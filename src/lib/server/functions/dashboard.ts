import {db} from "@/lib/server/database/db";
import {createServerFn} from "@tanstack/react-start";
import {and, desc, eq, getTableColumns, sql} from "drizzle-orm";
import {authMiddleware} from "@/lib/server/middleware/auth-guard";
import {favorites, label, recipe, recipeLabel, user} from "@/lib/server/database/schema";


type Label = typeof label.$inferSelect;
type FullRecipe = typeof recipe.$inferSelect & {
    submitter: {
        id: number;
        name: string;
    };
    labels: Label[];
    isFavorited: boolean;
};


export const getDashboard = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async ({ context: { currentUser } }) => {
        const aggregatedLabels = db
            .select({
                recipeId: recipeLabel.recipeId,
                labels: sql<string>`json_group_array(json_object(
                    'id', ${label.id}, 
                    'name', ${label.name}, 
                    'color', ${label.color},
                    'order', ${label.order}
                ))`.as("labels"),
            })
            .from(recipeLabel)
            .innerJoin(label, eq(recipeLabel.labelId, label.id))
            .groupBy(recipeLabel.recipeId)
            .as("aggLabels");

        const lastRecipes: FullRecipe[] = await db
            .select({
                ...getTableColumns(recipe),
                labels: sql<Label[]>`coalesce(${aggregatedLabels.labels}, '[]')`.mapWith(JSON.parse),
                isFavorited: sql<boolean>`CASE WHEN ${favorites.recipeId} IS NOT NULL THEN true ELSE false END`.mapWith(Boolean),
                submitter: {
                    id: user.id,
                    name: user.name,
                },
            })
            .from(recipe)
            .innerJoin(user, eq(recipe.submitterId, user.id))
            .leftJoin(aggregatedLabels, eq(recipe.id, aggregatedLabels.recipeId))
            .leftJoin(favorites, and(eq(favorites.recipeId, recipe.id), eq(favorites.userId, currentUser.id)))
            .orderBy(desc(recipe.submittedDate))
            .limit(8);

        const favoriteRecipes: FullRecipe[] = await db
            .select({
                ...getTableColumns(recipe),
                isFavorited: sql<boolean>`true`.mapWith(Boolean),
                labels: sql<Label[]>`coalesce(${aggregatedLabels.labels}, '[]')`.mapWith(JSON.parse),
                submitter: {
                    id: user.id,
                    name: user.name,
                },
            })
            .from(favorites)
            .innerJoin(recipe, eq(favorites.recipeId, recipe.id))
            .innerJoin(user, eq(recipe.submitterId, user.id))
            .leftJoin(aggregatedLabels, eq(recipe.id, aggregatedLabels.recipeId))
            .where(eq(favorites.userId, currentUser.id));

        return {
            lastRecipes,
            favoriteRecipes,
        };
    });
