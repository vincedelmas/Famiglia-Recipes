import React from "react";
import {Search, X, SlidersHorizontal, ChevronDown} from "lucide-react";
import {useTranslation} from "react-i18next";
import {InputGroup, InputGroupAddon, InputGroupInput} from "~/lib/client/components/ui/input-group";
import {Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent} from "~/lib/client/components/ui/empty";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {Button} from "~/lib/client/components/ui/button";
import {allRecipesOptions} from "~/lib/client/react-query";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {Pagination} from "~/lib/client/components/app/Pagination";
import {RecipeCard} from "~/lib/client/components/app/RecipeCard";
import {FilterGroup} from "~/lib/client/components/all-recipes/FilterGroup";
import {AllRecipesParams, allRecipesParamsSchema} from "~/lib/schemas/recipes.schema";


export const Route = createFileRoute("/_private/all-recipes")({
    validateSearch: (search) => allRecipesParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    context: ({ deps: { search } }) => ({ allRecipesOptions: allRecipesOptions(search) }),
    component: AllRecipesPage,
});


function AllRecipesPage() {
    const { t } = useTranslation();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const apiData = useSuspenseQuery(Route.useRouteContext().allRecipesOptions).data;

    const hasFilters = search.q || search.labels.length > 0 || search.authors.length > 0;

    const updateSearch = (nextSearch: AllRecipesParams) => {
        void navigate({ search: nextSearch });
    };

    const onSearchSubmit = (ev: React.SubmitEvent<HTMLFormElement>) => {
        ev.preventDefault();
        const formData = new FormData(ev.currentTarget);
        const q = String(formData.get("q") ?? "").trim();

        updateSearch({ ...search, q, page: 1 });
    };

    const clearFilters = () => {
        updateSearch({ q: "", page: 1, labels: [], authors: [] });
    };

    const goToPage = (page: number) => {
        updateSearch({ ...search, page });
    };

    return <PageTitle title={t("ui.collection-title")} subtitle={t("ui.collection-note")}>
        <section className="rounded-2xl border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={onSearchSubmit} className="flex min-w-0 flex-1 basis-72 gap-2">
                    <InputGroup className="h-12">
                        <InputGroupAddon><Search/></InputGroupAddon>
                        <InputGroupInput aria-label={t("search-recipes")} name="q" key={search.q} defaultValue={search.q} placeholder={t("ui.search-placeholder")}/>
                    </InputGroup>
                    <Button type="submit" className="h-12" aria-label={t("apply-search")}><Search/><span className="hidden sm:inline">{t("apply-search")}</span></Button>
                </form>
                {hasFilters && <Button variant="ghost" onClick={clearFilters}><X data-icon="inline-start"/>{t("clear-filters")}</Button>}
            </div>
            <details className="group mt-4 border-t pt-4" open={search.labels.length > 0 || search.authors.length > 0 || undefined}>
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted-foreground [&::-webkit-details-marker]:hidden"><SlidersHorizontal className="size-4"/>{t("ui.filters")}<ChevronDown className="ml-auto size-4 transition-transform group-open:rotate-180"/></summary>
                <div className="mt-5 flex flex-col gap-6">
                    <FilterGroup items={apiData.labels} title={t("ui.categories")} selected={search.labels} onChange={labels => updateSearch({...search, labels, page:1})}/>
                    <FilterGroup items={apiData.authors} title={t("ui.cooks")} selected={search.authors} onChange={authors => updateSearch({...search, authors, page:1})}/>
                </div>
            </details>
        </section>
        <section className="mt-9">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground" role="status">{t("ui.results", {count:apiData.pagination.total})}</p><Pagination onPageChange={goToPage} page={apiData.pagination.page} totalPages={apiData.pagination.totalPages}/></div>
            {apiData.recipes.length ? <div className="recipe-grid">{apiData.recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe}/>)}</div> : <Empty className="border py-16"><EmptyHeader><EmptyMedia variant="icon"><Search/></EmptyMedia><EmptyTitle>{t("no-recipes-found")}</EmptyTitle><EmptyDescription>{t("ui.no-results-note")}</EmptyDescription></EmptyHeader>{hasFilters && <EmptyContent><Button variant="outline" onClick={clearFilters}>{t("clear-filters")}</Button></EmptyContent>}</Empty>}
            {apiData.pagination.totalPages > 1 && <div className="mt-10 flex justify-center"><Pagination onPageChange={goToPage} page={apiData.pagination.page} totalPages={apiData.pagination.totalPages}/></div>}
        </section>
    </PageTitle>;
}
