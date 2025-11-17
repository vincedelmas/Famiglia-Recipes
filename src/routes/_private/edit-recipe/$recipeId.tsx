import {toast} from "sonner";
import {useTranslation} from "react-i18next";
import {RecipeFormValues} from "~/lib/utils/schemas";
import {useSuspenseQuery} from "@tanstack/react-query";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {RecipeForm} from "~/lib/client/components/recipe-form/RecipeForm";
import {editRecipeOptions, useUpdateRecipe} from "~/lib/client/react-query";


export const Route = createFileRoute("/_private/edit-recipe/$recipeId")({
    loader: ({ context: { queryClient }, params: { recipeId } }) =>
        queryClient.ensureQueryData(editRecipeOptions(Number(recipeId))),
    component: EditRecipePage,
})


function EditRecipePage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { recipeId } = Route.useParams();
    const updateRecipeMutation = useUpdateRecipe();
    const apiData = useSuspenseQuery(editRecipeOptions(Number(recipeId))).data;
    const initValues: RecipeFormValues = {
        title: apiData.recipe.title,
        servings: apiData.recipe.servings,
        cooking: apiData.recipe.cookingTime,
        preparation: apiData.recipe.prepTime,
        comment: apiData.recipe.comment || "",
        labels: apiData.recipe.recipeLabels.map((ing) => ing.name),
        steps: apiData.recipe.steps.map((ing) => ({ content: ing.description })),
        ingredients: apiData.recipe.ingredients.map(
            (ing) => ({ quantity: Number(ing.proportion), description: ing.ingredient })
        ),
    };
    
    const onSubmit = async (submittedData: RecipeFormValues) => {
        const formData = new FormData();

        formData.append("recipe", JSON.stringify({ id: recipeId, ...submittedData }));
        if (submittedData.image) {
            formData.append("image", submittedData.image);
        }

        updateRecipeMutation.mutate({ formData: formData }, {
            onSuccess: () => {
                toast.success("Recipe Successfully edited");
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
