import {toast} from "sonner";
import {useTranslation} from "react-i18next";
import {RecipeFormValues} from "~/lib/utils/schemas";
import {useAddRecipe} from "~/lib/client/react-query";
import {useSuspenseQuery} from "@tanstack/react-query";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {addRecipeOptions} from "~/lib/client/react-query/queryOptions";
import {RecipeForm} from "~/lib/client/components/recipe-form/RecipeForm";


export const Route = createFileRoute("/_private/add-recipe")({
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(addRecipeOptions),
    component: AddRecipePage,
});

function AddRecipePage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const addRecipe = useAddRecipe();
    const { data: labels } = useSuspenseQuery(addRecipeOptions);
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
            onSuccess: () => {
                toast.success("Recipe Successfully edited");
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
