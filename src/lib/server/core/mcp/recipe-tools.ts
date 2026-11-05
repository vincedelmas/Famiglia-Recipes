import {clientEnv} from "@/env/client";
import {FormattedError} from "@/lib/utils/error-classes";
import {getDetails} from "@/lib/server/functions/recipe-details";
import {getAllRecipes} from "@/lib/server/functions/all-recipes";
import type {ToolContext} from "@/lib/server/core/mcp/tool-context";
import {getLabels, postAddRecipe} from "@/lib/server/functions/add-recipe";
import {addRecipeInputSchema, getRecipeInputSchema, recipeLabelsInputSchema} from "@/lib/schemas/tool-schemas";


const MAX_RECIPE_MATCHES = 10;


export const registerRecipeTools = ({ register }: ToolContext) => {
    register("get_recipe", {
        inputSchema: getRecipeInputSchema,
        description: "Read a recipe by ID or search by literal title text. Present the recipe in French. " +
            "A unique match returns the full recipe; for multiple matches, ask the user to choose, then call with recipeId. " +
            "Times are in minutes and ingredient quantities correspond to the returned servings.",
    }, async ({ title, recipeId }) => {
        if (title !== undefined) {
            const { recipes, pagination } = await getAllRecipes({ data: { q: title, page: 1, labels: [], authors: [] } });

            if (pagination.total > 1) {
                return {
                    status: "multiple_matches",
                    hasMore: pagination.total > MAX_RECIPE_MATCHES,
                    message: "Demandez à l’utilisateur de choisir une recette ou de préciser le titre si d’autres résultats existent.",
                    matches: recipes.slice(0, MAX_RECIPE_MATCHES).map(recipe => ({
                        id: recipe.id,
                        title: recipe.title,
                        submitterName: recipe.submitter.name,
                    })),
                };
            }

            recipeId = recipes[0]?.id;
        }

        if (recipeId === undefined) {
            throw new FormattedError("Recette introuvable. Essayez un autre titre ou identifiant de recette.");
        }

        const details = await getDetails({ data: String(recipeId) });

        return {
            status: "found",
            recipe: {
                ...details,
                url: new URL(`/details/${details.id}`, clientEnv.VITE_BASE_URL).href,
            },
        };
    });

    register("get_recipe_labels", {
        inputSchema: recipeLabelsInputSchema,
        description: "List the available recipe categories. Use their exact names in add_recipe labels.",
    }, () => getLabels());

    register("add_recipe", {
        write: true,
        inputSchema: addRecipeInputSchema,
        annotations: { idempotentHint: false },
        description: "Create a recipe from structured data written in French. " +
            "Read the user's link, PDF, text or image with your own capabilities, then call get_recipe_labels for valid category names. " +
            "Ask for missing required details; do not invent them. Uses the default cover image. " +
            "Each successful call creates a new recipe: return its link and do not repeat the call.",
    }, async (data) => {
        const formData = new FormData();
        formData.set("recipe", JSON.stringify(data));

        const recipe = await postAddRecipe({ data: formData });

        return {
            status: "created",
            recipe: {
                ...recipe,
                url: new URL(`/details/${recipe.id}`, clientEnv.VITE_BASE_URL).href,
            },
        };
    });
};
