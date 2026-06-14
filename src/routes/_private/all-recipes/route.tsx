import React from "react";
import {Search, X} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Input} from "~/lib/client/components/ui/input";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {Button} from "~/lib/client/components/ui/button";
import {allRecipesOptions} from "~/lib/client/react-query";
import {Separator} from "~/lib/client/components/ui/separator";
import {MutedText} from "~/lib/client/components/app/MutedText";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {Pagination} from "~/lib/client/components/app/Pagination";
import {RecipeCard} from "~/lib/client/components/app/RecipeCard";
import {FilterGroup} from "~/lib/client/components/all-recipes/FilterGroup";
import {AllRecipesParams, allRecipesParamsSchema} from "~/lib/schemas/recipes.schema";


export const Route = createFileRoute("/_private/all-recipes")({
    validateSearch: (search) => allRecipesParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context: { queryClient }, deps: { search } }) => {
        return queryClient.ensureQueryData(allRecipesOptions(search));
    },
    component: AllRecipesPage,
});


function AllRecipesPage() {
    const { t } = useTranslation();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const apiData = useSuspenseQuery(allRecipesOptions(search)).data;

    const selectedLabels = new Set(search.labels);
    const selectedAuthors = new Set(search.authors);
    const hasFilters = search.q || search.labels.length > 0 || search.authors.length > 0;
    const availableAuthors = apiData.authors.filter((author) => !selectedAuthors.has(author.id));
    const selectedAuthorItems = apiData.authors.filter((author) => selectedAuthors.has(author.id));
    const availableLabels = apiData.labels.filter((label) => !selectedLabels.has(label.id));
    const selectedLabelItems = apiData.labels.filter((label) => selectedLabels.has(label.id));

    const updateSearch = (nextSearch: AllRecipesParams) => {
        void navigate({ search: nextSearch });
    };

    const onSearchSubmit = (ev: React.SubmitEvent<HTMLFormElement>) => {
        ev.preventDefault();
        const formData = new FormData(ev.currentTarget);
        const q = String(formData.get("q") ?? "").trim();

        updateSearch({ ...search, q, page: 1 });
    };

    const toggleFilter = (key: "labels" | "authors", id: number) => {
        const activeValues = search[key];
        const nextValues = activeValues.includes(id)
            ? activeValues.filter((value) => value !== id)
            : [...activeValues, id];

        updateSearch({ ...search, [key]: nextValues, page: 1 });
    };

    const clearFilters = () => {
        updateSearch({ q: "", page: 1, labels: [], authors: [] });
    };

    const goToPage = (page: number) => {
        updateSearch({ ...search, page });
    };

    return (
        <PageTitle title={t("all-recipes", { count: apiData.pagination.total })} subtitle={t("all-recipes-subtitle")}>
            <section className="mt-6 space-y-6">
                <div className="flex flex-wrap items-end gap-3">
                    <form onSubmit={onSearchSubmit} className="flex w-90 max-w-full items-center gap-2">
                        <div className="flex min-w-0 flex-1 items-center rounded-md border border-neutral-500 pl-2.5">
                            <Search className="h-4 w-4 text-neutral-500"/>
                            <Input
                                name="q"
                                key={search.q}
                                defaultValue={search.q}
                                placeholder={t("search-recipes")}
                                className="border-none focus-visible:ring-0"
                            />
                        </div>
                        <Button type="submit" size="icon" aria-label={t("apply-search")}>
                            <Search/>
                        </Button>
                    </form>
                    {hasFilters &&
                        <Button type="button" variant="outline" onClick={clearFilters}>
                            <X/>
                            {t("clear-filters")}
                        </Button>
                    }
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <FilterGroup
                        items={availableLabels}
                        title={t("available-labels")}
                        emptyText={t("no-available-labels")}
                        onToggle={(id) => toggleFilter("labels", id)}
                    />
                    <FilterGroup
                        items={selectedLabelItems}
                        title={t("selected-labels")}
                        emptyText={t("s-no-labels")}
                        onToggle={(id) => toggleFilter("labels", id)}
                    />
                    <FilterGroup
                        items={availableAuthors}
                        title={t("available-authors")}
                        emptyText={t("no-available-authors")}
                        onToggle={(id) => toggleFilter("authors", id)}
                    />
                    <FilterGroup
                        items={selectedAuthorItems}
                        title={t("selected-authors")}
                        emptyText={t("s-no-authors")}
                        onToggle={(id) => toggleFilter("authors", id)}
                    />
                </div>
            </section>

            <section className="recipes mt-9">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-medium">{t("all-recipes-results")}</h2>
                    <Pagination
                        onPageChange={goToPage}
                        page={apiData.pagination.page}
                        totalPages={apiData.pagination.totalPages}
                    />
                </div>
                <Separator className="mt-1 mb-4"/>
                {apiData.recipes.length === 0 ?
                    <MutedText>{t("no-recipes-found")}</MutedText>
                    :
                    <div className="grid max-sm:grid-cols-1 max-lg:grid-cols-3 grid-cols-4 gap-6 max-lg:gap-4">
                        {apiData.recipes.map((recipe) =>
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                            />
                        )}
                    </div>
                }
                {apiData.recipes.length > 0 &&
                    <div className="mt-6 flex justify-end">
                        <Pagination
                            onPageChange={goToPage}
                            page={apiData.pagination.page}
                            totalPages={apiData.pagination.totalPages}
                        />
                    </div>
                }
            </section>
        </PageTitle>
    );
}



