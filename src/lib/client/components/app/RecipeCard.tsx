import {Link} from "@tanstack/react-router";
import {Badge} from "~/lib/client/components/ui/badge";
import {ArrowUpRight, Clock, Heart} from "lucide-react";
import type {dashboardOptions} from "~/lib/client/react-query";
import {RecipeImage} from "~/lib/client/components/app/RecipeImage";


type Recipe = Awaited<ReturnType<NonNullable<typeof dashboardOptions["queryFn"]>>>["favoriteRecipes"][0];


export const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    return (
        <Link
            to="/details/$recipeId"
            params={{ recipeId: String(recipe.id) }}
            className="group flex min-w-0 flex-col rounded-2xl outline-offset-4"
        >
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
                <RecipeImage
                    src={recipe.image}
                    alt={recipe.title}
                />

                {recipe.isFavorited &&
                    <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-card text-destructive">
                        <Heart className="size-3.5 fill-current"/>
                        <span className="sr-only">Your favorites</span>
                    </span>
                }
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-medium">
                    <Clock className="size-3"/>
                    {recipe.prepTime + recipe.cookingTime} min
                </span>
            </div>
            <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                <div className="mb-2 flex min-h-5 flex-wrap gap-1.5">
                    {recipe.labels.slice(0, 2).map(label =>
                        <Badge key={label.id} variant="secondary">
                            {label.name}
                        </Badge>
                    )}
                </div>

                <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-heading text-[23px] leading-snug tracking-[-0.03em] transition-colors group-hover:text-primary">
                        {recipe.title}
                    </h3>
                    <ArrowUpRight
                        className="mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5"
                    />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                    Added by {recipe.submitter.name}
                </p>
            </div>
        </Link>
    );
};
