import {useTranslation} from "react-i18next";
import {RecipeFormValues} from "~/lib/utils/schemas";
import {toast} from "~/lib/client/components/ui/toast";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {RecipeForm} from "~/lib/client/components/recipe-form/RecipeForm";
import {editRecipeOptions, useUpdateRecipe} from "~/lib/client/react-query";


export const Route = createFileRoute("/_private/edit-recipe/$recipeId")({
    context: ({ params: { recipeId } }) => {
        return { editRecipeOptions: editRecipeOptions(Number(recipeId)) };
    },
    component: EditRecipePage,
})


function EditRecipePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const { recipeId } = Route.useParams();
    const updateRecipeMutation = useUpdateRecipe();
    const apiData = useSuspenseQuery(Route.useRouteContext().editRecipeOptions).data;

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

        updateRecipeMutation.mutate({ formData: formData }, {
            onSuccess: async () => {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ["recipeDetails", recipeId] }),
                    queryClient.invalidateQueries({ queryKey: ["editRecipe", recipeId] }),
                    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
                    queryClient.invalidateQueries({ queryKey: ["allRecipes"] }),
                ]);
                toast.add({ type: "success", title: t("ui.recipe-updated") });
                return navigate({ to: "/details/$recipeId", params: { recipeId }, replace: true });
            }
        });
    };

    return (
        <PageTitle title={t("edit-recipe")} subtitle={t("edit-recipe-subtitle")}>
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
