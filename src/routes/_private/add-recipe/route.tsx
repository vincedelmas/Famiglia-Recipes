import {toast} from "~/lib/client/components/ui/toast";
import {useTranslation} from "react-i18next";
import {RecipeFormValues} from "~/lib/utils/schemas";
import {useAddRecipe} from "~/lib/client/react-query";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {addRecipeOptions} from "~/lib/client/react-query/queryOptions";
import {RecipeForm} from "~/lib/client/components/recipe-form/RecipeForm";


export const Route = createFileRoute("/_private/add-recipe")({
    context: () => ({ addRecipeOptions }),
    component: AddRecipePage,
});

function AddRecipePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const addRecipe = useAddRecipe();
    const { data: labels } = useSuspenseQuery(Route.useRouteContext().addRecipeOptions);
    const initValues: RecipeFormValues = {
        title: "",
        labels: [],
        servings: 2,
        cooking: 30,
        comment: "",
        preparation: 30,
        steps: [{ content: "" }],
        ingredients: [{ quantity: 0, description: "" }],
    };

    const onSubmit = async (submittedData: RecipeFormValues) => {
        const formData = new FormData();

        formData.append("recipe", JSON.stringify(submittedData));
        if (submittedData.image) {
            formData.append("image", submittedData.image);
        }

        addRecipe.mutate({ data: formData }, {
            onSuccess: async () => {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
                    queryClient.invalidateQueries({ queryKey: ["allRecipes"] }),
                ]);
                toast.add({ type: "success", title: t("ui.recipe-created") });
                return navigate({ to: "/dashboard" });
            }
        });
    };

    return (
        <PageTitle title={t("add-recipe")} subtitle={t("ar-subtitle")}>
            <RecipeForm
                labels={labels}
                type="Creation"
                onSubmit={onSubmit}
                initValues={initValues}
                pendingState={addRecipe.isPending}
            />
        </PageTitle>
    );
}
