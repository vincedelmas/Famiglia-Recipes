import {Link} from "@tanstack/react-router";
import {ChefHat, Clock} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Badge} from "~/lib/client/components/ui/badge";
import {dashboardOptions} from "~/lib/client/react-query";
import {Avatar, AvatarFallback} from "~/lib/client/components/ui/avatar";
import {Card, CardContent, CardFooter, CardHeader} from "~/lib/client/components/ui/card";


type Recipe = Awaited<ReturnType<NonNullable<typeof dashboardOptions["queryFn"]>>>["favoriteRecipes"][0];


export const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    const { t } = useTranslation();

    return (
        <Link to="/details/$recipeId" params={{ recipeId: recipe.id.toString() }}>
            <Card className="w-full group h-full pt-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img
                        alt={recipe.title}
                        src={recipe.image || ""}
                        className="object-cover bg-slate-700 transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <CardHeader className="space-y-2 mt-3 px-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-amber-600"/>
                            <span>Prep: {recipe.prepTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ChefHat className="h-4 w-4 text-amber-600"/>
                            <span>{t("cook")}: {recipe.cookingTime} min</span>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-2xl font-bold tracking-tight line-clamp-2" title={recipe.title}>
                            {recipe.title}
                        </h2>
                    </div>
                </CardHeader>
                <CardContent className="px-4 mt-3 mb-5">
                    <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{recipe.submitter.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{recipe.submitter.name}</span>
                            <span className="text-xs text-muted-foreground">{t("submit-date", { date: recipe.submittedDate })}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 mt-auto">
                    {recipe.labels.map((label) =>
                        <Badge key={label.id} variant="inactive" color={label.color}>
                            {label.name}
                        </Badge>
                    )}
                </CardFooter>
            </Card>
        </Link>
    );
};
