import {Plural, useGT} from "gt-react";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {Button} from "~/lib/client/components/ui/button";
import React, {useEffect, useRef, useState} from "react";
import {allRecipesOptions} from "~/lib/client/react-query";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {Pagination} from "~/lib/client/components/app/Pagination";
import {RecipeCard} from "~/lib/client/components/app/RecipeCard";
import {ChevronDown, Search, SlidersHorizontal, X} from "lucide-react";
import {FilterGroup} from "~/lib/client/components/all-recipes/FilterGroup";
import {AllRecipesParams, allRecipesParamsSchema} from "~/lib/schemas/recipes.schema";
import {InputGroup, InputGroupAddon, InputGroupInput} from "~/lib/client/components/ui/input-group";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "~/lib/client/components/ui/empty";


export const Route = createFileRoute("/_private/all-recipes")({
    validateSearch: (search) => allRecipesParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    context: ({ deps: { search } }) => ({
        allRecipesOptions: allRecipesOptions(search),
    }),
    loader: ({ context }) => {
        return context.queryClient.query(context.allRecipesOptions);
    },
    component: AllRecipesPage,
});


function AllRecipesPage() {
    const gt = useGT();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const submittedQuery = useRef(search.q);
    const [query, setQuery] = useState(search.q);
    const { allRecipesOptions } = Route.useRouteContext();
    const { data: apiData, isFetching } = useSuspenseQuery(allRecipesOptions);
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

    const onSearchChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = ev.target.value;

        setQuery(value);
        clearTimeout(searchTimer.current);

        searchTimer.current = setTimeout(() => updateSearch({ ...search, q: value.trim(), page: 1 }, true), 300);
    }

    const clearFilters = () => {
        updateSearch({ q: "", page: 1, labels: [], authors: [] });
    };

    const goToPage = (page: number) => {
        updateSearch({ ...search, page });
    };

    return (
        <PageTitle title={gt("The cookbook")} subtitle={<>Browse recipes or filter by category and author.</>}>
            <section className="rounded-2xl border bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={onSearchSubmit} className="flex min-w-0 flex-1 basis-72 gap-2">
                        <InputGroup className="h-12">
                            <InputGroupAddon>
                                <Search/>
                            </InputGroupAddon>
                            <InputGroupInput
                                name="q"
                                value={query}
                                maxLength={120}
                                onChange={onSearchChange}
                                aria-label={gt("Search by title")}
                                placeholder={gt("Search recipes…")}
                            />
                        </InputGroup>
                    </form>

                    {hasFilters &&
                        <Button variant="ghost" onClick={clearFilters}>
                            <X data-icon="inline-start"/>
                            Clear filters
                        </Button>
                    }
                </div>
                <details className="group mt-4 border-t pt-4" open={search.labels.length > 0 || search.authors.length > 0 || undefined}>
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
                        <SlidersHorizontal className="size-4"/>
                        Refine your search
                        <ChevronDown className="ml-auto size-4 transition-transform group-open:rotate-180"/>
                    </summary>

                    <div className="mt-5 flex flex-col gap-6">
                        <FilterGroup
                            items={apiData.labels}
                            selected={search.labels}
                            title={gt("Categories")}
                            onChange={(labels) => updateSearch({ ...search, q: query.trim(), labels, page: 1 })}
                        />
                        <FilterGroup
                            items={apiData.authors}
                            selected={search.authors}
                            title={gt("Added by")}
                            onChange={(authors) => updateSearch({ ...search, q: query.trim(), authors, page: 1 })}
                        />
                    </div>
                </details>
            </section>

            <section className="mt-9" aria-busy={isFetching}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground" role="status">

                        <Plural
                            n={apiData.pagination.total}
                            one={<>{apiData.pagination.total} recipe</>}
                            other={<>{apiData.pagination.total} recipes</>}
                        />

                    </p>

                    <Pagination
                        onPageChange={goToPage}
                        page={apiData.pagination.page}
                        totalPages={apiData.pagination.totalPages}
                    />
                </div>
                {apiData.recipes.length ?
                    <div className="recipe-grid">
                        {apiData.recipes.map(recipe =>
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                            />
                        )}
                    </div>
                    :
                    <Empty className="border py-16">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Search/>
                            </EmptyMedia>
                            <EmptyTitle>
                                No recipes found
                            </EmptyTitle>
                            <EmptyDescription>
                                Try another title or clear a few filters.
                            </EmptyDescription>
                        </EmptyHeader>
                        
                        {hasFilters &&
                            <EmptyContent>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear filters
                                </Button>
                            </EmptyContent>
                        }
                    </Empty>
                }

                {apiData.pagination.totalPages > 1 &&
                    <div className="mt-10 flex justify-center">
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
