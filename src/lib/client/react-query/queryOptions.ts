import {queryOptions} from "@tanstack/react-query";
import {getCurrentUser} from "~/lib/server/functions/user";
import {getLabels} from "~/lib/server/functions/add-recipe";
import {getDashboard} from "~/lib/server/functions/dashboard";
import {getEditRecipe} from "~/lib/server/functions/edit-recipe";
import {getAllRecipes} from "~/lib/server/functions/all-recipes";
import {getComments, getDetails} from "~/lib/server/functions/recipe-details";


type AllRecipesParams = {
    q: string;
    page: number;
    labels: number[];
    authors: number[];
};


export const authOptions = queryOptions({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
    staleTime: 10 * 60 * 1000,
});


export const dashboardOptions = queryOptions({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
});

export const allRecipesOptions = (params: AllRecipesParams = { q: "", page: 1, labels: [], authors: [] }) => queryOptions({
    queryKey: ["allRecipes", params],
    queryFn: () => getAllRecipes({ data: params }),
});


export const recipeDetailsOptions = (recipeId: number) => queryOptions({
    queryKey: ["recipeDetails", recipeId.toString()],
    queryFn: () => getDetails({ data: recipeId.toString() }),
});


export const recipeCommentsOptions = (recipeId: number) => queryOptions({
    queryKey: ["comments", recipeId.toString()],
    queryFn: () => getComments({ data: recipeId.toString() }),
    placeholderData: [],
});


export const addRecipeOptions = queryOptions({
    queryKey: ["addRecipe"],
    queryFn: () => getLabels(),
});


export const editRecipeOptions = (recipeId: number) => queryOptions({
    queryKey: ["editRecipe", recipeId.toString()],
    queryFn: () => getEditRecipe({ data: recipeId.toString() }),
});
