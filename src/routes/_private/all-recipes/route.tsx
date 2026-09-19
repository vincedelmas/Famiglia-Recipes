import React, {useEffect, useRef, useState} from "react";
import {Search, X, SlidersHorizontal, ChevronDown} from "lucide-react";
import {useTranslation} from "react-i18next";
import {InputGroup, InputGroupAddon, InputGroupInput} from "~/lib/client/components/ui/input-group";
import {Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent} from "~/lib/client/components/ui/empty";
import {createFileRoute} from "@tanstack/react-router";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {Button} from "~/lib/client/components/ui/button";
import {allRecipesOptions} from "~/lib/client/react-query";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {Pagination} from "~/lib/client/components/app/Pagination";
import {DefaultLoader} from "~/lib/client/components/app/DefaultLoader";
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
    const {data: apiData, isFetching} = useQuery({...Route.useRouteContext().allRecipesOptions, placeholderData: keepPreviousData, throwOnError: true});

    const [query, setQuery] = useState(search.q);
    const submittedQuery = useRef(search.q);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => {
        if (search.q === submittedQuery.current) return;
        submittedQuery.current = search.q;
        clearTimeout(searchTimer.current);
        setQuery(search.q);
    }, [search.q]);
    useEffect(() => () => clearTimeout(searchTimer.current), []);

    const hasFilters = search.q || search.labels.length > 0 || search.authors.length > 0;

    const updateSearch = (nextSearch: AllRecipesParams, replace = false) => {
        clearTimeout(searchTimer.current);
        submittedQuery.current = nextSearch.q;
        setQuery(nextSearch.q);
        void navigate({ search: nextSearch, replace, resetScroll: false });
    };

    const onSearchSubmit = (ev: React.SubmitEvent<HTMLFormElement>) => {
        ev.preventDefault();
        updateSearch({ ...search, q: query.trim(), page: 1 });
    };

    const clearFilters = () => {
        updateSearch({ q: "", page: 1, labels: [], authors: [] });
    };

    const goToPage = (page: number) => {
        updateSearch({ ...search, page });
    };

    if (!apiData) return <DefaultLoader/>;

    return <PageTitle title={t("ui.collection-title")} subtitle={t("ui.collection-note")}>
        <section className="rounded-2xl border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={onSearchSubmit} className="flex min-w-0 flex-1 basis-72 gap-2">
                    <InputGroup className="h-12">
                        <InputGroupAddon><Search/></InputGroupAddon>
                        <InputGroupInput aria-label={t("search-recipes")} name="q" value={query} maxLength={120} onChange={event => {
                            const value = event.target.value;
                            setQuery(value);
                            clearTimeout(searchTimer.current);
                            searchTimer.current = setTimeout(() => updateSearch({...search, q:value.trim(), page:1}, true), 300);
                        }} placeholder={t("ui.search-placeholder")}/>
                    </InputGroup>
                </form>
                {hasFilters && <Button variant="ghost" onClick={clearFilters}><X data-icon="inline-start"/>{t("clear-filters")}</Button>}
            </div>
            <details className="group mt-4 border-t pt-4" open={search.labels.length > 0 || search.authors.length > 0 || undefined}>
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted-foreground [&::-webkit-details-marker]:hidden"><SlidersHorizontal className="size-4"/>{t("ui.filters")}<ChevronDown className="ml-auto size-4 transition-transform group-open:rotate-180"/></summary>
                <div className="mt-5 flex flex-col gap-6">
                    <FilterGroup items={apiData.labels} title={t("ui.categories")} selected={search.labels} onChange={labels => updateSearch({...search, q:query.trim(), labels, page:1})}/>
                    <FilterGroup items={apiData.authors} title={t("ui.cooks")} selected={search.authors} onChange={authors => updateSearch({...search, q:query.trim(), authors, page:1})}/>
                </div>
            </details>
        </section>
        <section className="mt-9" aria-busy={isFetching}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground" role="status">{t("ui.results", {count:apiData.pagination.total})}</p><Pagination onPageChange={goToPage} page={apiData.pagination.page} totalPages={apiData.pagination.totalPages}/></div>
            {apiData.recipes.length ? <div className="recipe-grid">{apiData.recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe}/>)}</div> : <Empty className="border py-16"><EmptyHeader><EmptyMedia variant="icon"><Search/></EmptyMedia><EmptyTitle>{t("no-recipes-found")}</EmptyTitle><EmptyDescription>{t("ui.no-results-note")}</EmptyDescription></EmptyHeader>{hasFilters && <EmptyContent><Button variant="outline" onClick={clearFilters}>{t("clear-filters")}</Button></EmptyContent>}</Empty>}
            {apiData.pagination.totalPages > 1 && <div className="mt-10 flex justify-center"><Pagination onPageChange={goToPage} page={apiData.pagination.page} totalPages={apiData.pagination.totalPages}/></div>}
        </section>
    </PageTitle>;
}
