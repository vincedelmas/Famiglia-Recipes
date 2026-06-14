import {db} from "~/lib/server/database/db";
import {createServerFn} from "@tanstack/react-start";
import {authMiddleware} from "~/lib/server/middleware/auth-guard";
import {AllRecipesParams, allRecipesParamsSchema} from "~/lib/schemas/recipes.schema";
import {favorites, label, recipe, recipeLabel, user} from "~/lib/server/database/schema";
import {and, asc, count, eq, getTableColumns, inArray, like, sql, type SQL} from "drizzle-orm";


const PAGE_SIZE = 25;
type Label = typeof label.$inferSelect;
type Author = Pick<typeof user.$inferSelect, "id" | "name">;


export const getAllRecipes = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(allRecipesParamsSchema)
    .handler(async ({ data, context: { currentUser } }) => {
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

        const conditions: SQL[] = [];
        if (data.q) conditions.push(like(recipe.title, `%${data.q}%`));
        if (data.authors.length > 0) conditions.push(inArray(recipe.submitterId, data.authors));

        if (data.labels.length > 0) {
            const matchingRecipeIds = db
                .select({ recipeId: recipeLabel.recipeId })
                .from(recipeLabel)
                .where(inArray(recipeLabel.labelId, data.labels))
                .groupBy(recipeLabel.recipeId)
                .having(sql`count(distinct ${recipeLabel.labelId}) = ${data.labels.length}`);

            conditions.push(inArray(recipe.id, matchingRecipeIds));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : sql`true`;

        const [{ total }] = await db
            .select({ total: count() })
            .from(recipe)
            .where(whereClause);

        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const page = Math.min(data.page, totalPages);
        const offset = (page - 1) * PAGE_SIZE;

        const allLabels = await db
            .select()
            .from(label)
            .orderBy(asc(label.order));

        const authors: Author[] = await db
            .select({
                id: user.id,
                name: user.name,
            })
            .from(user)
            .innerJoin(recipe, eq(recipe.submitterId, user.id))
            .groupBy(user.id)
            .orderBy(asc(user.name));

        const allRecipes = await db
            .select({
                ...getTableColumns(recipe),
                labels: sql<Label[]>`coalesce(${aggregatedLabels.labels}, '[]')`.mapWith(JSON.parse),
                isFavorited: sql<boolean>`CASE WHEN
                    ${favorites.recipeId} IS NOT NULL
                    THEN true
                    ELSE false
                    END`.mapWith(Boolean),
                submitter: {
                    id: user.id,
                    name: user.name,
                },
            })
            .from(recipe)
            .innerJoin(user, eq(recipe.submitterId, user.id))
            .leftJoin(aggregatedLabels, eq(recipe.id, aggregatedLabels.recipeId))
            .leftJoin(favorites, and(eq(favorites.recipeId, recipe.id), eq(favorites.userId, currentUser.id)))
            .where(whereClause)
            .orderBy(asc(recipe.title))
            .limit(PAGE_SIZE)
            .offset(offset);

        return {
            authors,
            labels: allLabels,
            recipes: allRecipes,
            pagination: {
                page,
                total,
                totalPages,
                pageSize: PAGE_SIZE,
            },
            search: data satisfies AllRecipesParams,
        };
    });
