import {useGT} from "gt-react";
import {RecipeFormValues} from "~/lib/utils/schemas";
import {toast} from "~/lib/client/components/ui/toast";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {RecipeForm} from "~/lib/client/components/recipe-form/RecipeForm";
import {editRecipeOptions, useUpdateRecipe} from "~/lib/client/react-query";


export const Route = createFileRoute("/_private/edit-recipe/$recipeId")({
    context: ({ params: { recipeId } }) => ({
        editRecipeOptions: editRecipeOptions(Number(recipeId)),
    }),
    loader: ({ context }) => {
        return context.queryClient.query(context.editRecipeOptions);
    },
    component: EditRecipePage,
})


function EditRecipePage() {
    const gt = useGT();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { recipeId } = Route.useParams();
    const updateRecipeMutation = useUpdateRecipe();
    const { editRecipeOptions } = Route.useRouteContext();
    const { data: apiData } = useSuspenseQuery(editRecipeOptions);

    const initValues: RecipeFormValues = {
        title: apiData.recipe.title,
        servings: apiData.recipe.servings,
        cooking: apiData.recipe.cookingTime,
        preparation: apiData.recipe.prepTime,
        comment: apiData.recipe.comment || "",
        labels: apiData.recipe.recipeLabels.map((ing) => ing.name),
        steps: apiData.recipe.steps.map((ing) => ({ content: ing.description })),
        ingredients: apiData.recipe.ingredients.map(ing => ({
            description: ing.ingredient,
            quantity: Number(ing.proportion),
        })),
    };

    const onSubmit = async (submittedData: RecipeFormValues) => {
        const formData = new FormData();

        formData.append("recipe", JSON.stringify({ id: recipeId, ...submittedData }));
        if (submittedData.image) {
            formData.append("image", submittedData.image);
        }

        await updateRecipeMutation.mutateAsync({ formData });

        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
            queryClient.invalidateQueries({ queryKey: ["allRecipes"] }),
            queryClient.invalidateQueries({ queryKey: ["editRecipe", recipeId] }),
            queryClient.invalidateQueries({ queryKey: ["recipeDetails", recipeId] }),
        ]);

        toast.add({ type: "success", title: gt("Recipe changes saved") });

        return navigate({ to: "/details/$recipeId", params: { recipeId }, replace: true });
    };

    return (
        <PageTitle title={gt("Edit recipe")} subtitle={<>Update the recipe details, ingredients, or steps.</>}>
            <RecipeForm
                type="Edition"
                onSubmit={onSubmit}
                labels={apiData.labels}
                initValues={initValues}
                pendingState={updateRecipeMutation.isPending}
            />
        </PageTitle>
    );
}
