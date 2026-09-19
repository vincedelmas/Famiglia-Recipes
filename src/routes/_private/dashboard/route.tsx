import {useGT} from "gt-react";
import {useAuth} from "~/lib/client/hooks/use-auth";
import {useSuspenseQuery} from "@tanstack/react-query";
import {Button} from "~/lib/client/components/ui/button";
import {createFileRoute, Link} from "@tanstack/react-router";
import {ArrowRight, BookOpen, Heart, Plus} from "lucide-react";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {RecipeCard} from "~/lib/client/components/app/RecipeCard";
import {dashboardOptions} from "~/lib/client/react-query/queryOptions";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "~/lib/client/components/ui/empty";


export const Route = createFileRoute("/_private/dashboard")({
    context: () => ({
        dashboardOptions,
    }),
    loader: ({ context }) => {
        return context.queryClient.query(context.dashboardOptions);
    },
    component: DashboardPage,
});


function DashboardPage() {
    const gt = useGT();
    const { currentUser } = useAuth();
    const { dashboardOptions } = Route.useRouteContext();
    const { data: apiData } = useSuspenseQuery(dashboardOptions);

    return (
        <PageTitle title={gt("Home")} onlyHelmet>
            <div className="page-enter pb-4 pt-9 sm:pt-12">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="eyebrow">
                        Hello, {currentUser?.name.split(" ")[0]}.
                    </p>
                    <span className="text-xs text-muted-foreground">
                        Family recipes
                    </span>
                </div>

                <section className="relative grid overflow-hidden rounded-[24px] bg-accent lg:grid-cols-[1.15fr_1fr]">
                    <div className="relative z-10 px-7 py-10 sm:px-11 sm:py-14">
                        <p className="eyebrow mb-4">
                            Family recipes
                        </p>

                        <h1 className="page-heading max-w-md text-accent-foreground sm:text-[58px]">
                            Find a recipe
                        </h1>

                        <p className="mb-7 mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
                            Browse the collection or add a recipe to share.
                        </p>

                        <Button nativeButton={false} render={<Link to="/all-recipes" search={{ q: "", page: 1, labels: [], authors: [] }}/>}>
                            Browse recipes
                            <ArrowRight data-icon="inline-end"/>
                        </Button>
                    </div>
                    <div className="relative h-52 sm:h-64 lg:h-full"><img src="/images/family-table.png" alt="" fetchPriority="high"
                                                                          className="size-full object-cover object-[70%_center]"/></div>
                </section>

                <section className="recipe-section">
                    <div className="section-top">
                        <div>
                            <p className="eyebrow mb-2">
                                Family recipes
                            </p>
                            <h2 className="section-heading">
                                Latest recipes
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Recently added recipes.
                            </p>
                        </div>

                        <Link to="/all-recipes" search={{ q: "", page: 1, labels: [], authors: [] }} className="text-link">
                            All recipes
                            <ArrowRight className="size-4"/>
                        </Link>
                    </div>

                    {apiData.lastRecipes.length ?
                        <div className="recipe-grid">
                            {apiData.lastRecipes.map(recipe =>
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                />
                            )}
                        </div>
                        :
                        <Empty className="border py-12">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <BookOpen/>
                                </EmptyMedia>
                                <EmptyTitle>
                                    No recipes yet
                                </EmptyTitle>
                                <EmptyDescription>
                                    Add the first recipe to get started.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button nativeButton={false} render={<Link to="/add-recipe"/>}>
                                    <Plus data-icon="inline-start"/>
                                    Add a recipe
                                </Button>
                            </EmptyContent>
                        </Empty>
                    }
                </section>

                <section className="recipe-section border-t pt-10">
                    <div className="section-top">
                        <div>
                            <p className="eyebrow mb-2">
                                Saved recipes
                            </p>
                            <h2 className="section-heading">
                                Your favorites
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Recipes you’ve saved for later.
                            </p>
                        </div>

                        <Heart
                            strokeWidth={1.5}
                            className="size-5 text-primary"
                        />
                    </div>
                    {apiData.favoriteRecipes.length ?
                        <div className="recipe-grid">
                            {apiData.favoriteRecipes.map(recipe =>
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                />
                            )}
                        </div>
                        :
                        <Empty className="border py-12">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Heart/>
                                </EmptyMedia>
                                <EmptyTitle>
                                    No favorites yet
                                </EmptyTitle>
                                <EmptyDescription>
                                    Use the heart button to save a recipe here.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    }
                </section>
            </div>
        </PageTitle>
    );
}
