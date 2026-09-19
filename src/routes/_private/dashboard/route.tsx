import {useTranslation} from "react-i18next";
import {useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute} from "@tanstack/react-router";
import {Separator} from "~/lib/client/components/ui/separator";
import {MutedText} from "~/lib/client/components/app/MutedText";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {RecipeCard} from "~/lib/client/components/app/RecipeCard";
import {dashboardOptions} from "~/lib/client/react-query/queryOptions";


export const Route = createFileRoute("/_private/dashboard")({
    context: () => ({ dashboardOptions }),
    component: DashboardPage,
});


function DashboardPage() {
    const { t } = useTranslation();
    const apiData = useSuspenseQuery(Route.useRouteContext().dashboardOptions).data;

    return (
        <PageTitle title={t("da-title")} subtitle={t("da-subtitle")}>
            <section className="last recipes mt-9">
                <h2 className="text-xl font-medium">
                    {t("fav-recipes")}
                </h2>
                <Separator className="mt-1 mb-4"/>
                {apiData.favoriteRecipes.length === 0 ?
                    <MutedText>{t("no-fav-recipes")}</MutedText>
                    :
                    <div className="grid max-sm:grid-cols-1 max-lg:grid-cols-3 grid-cols-4 gap-6 max-lg:gap-4">
                        {apiData.favoriteRecipes.map((recipe) =>
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                            />
                        )}
                    </div>
                }
            </section>
            <section className="random recipes mt-9">
                <h2 className="text-xl font-medium">{t("last-recipes")}</h2>
                <Separator className="mt-1 mb-4"/>
                {apiData.lastRecipes.length === 0 ?
                    <MutedText>{t("no-last-recipes")}</MutedText>
                    :
                    <div className="grid max-sm:grid-cols-1 max-lg:grid-cols-3 grid-cols-4 gap-6 max-lg:gap-4">
                        {apiData.lastRecipes.map(recipe =>
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                            />
                        )}
                    </div>
                }
            </section>
        </PageTitle>
    );
}
