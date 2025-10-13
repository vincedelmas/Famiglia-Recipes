import {toast} from "sonner";
import {useState} from "react";
import {cn} from "~/lib/utils/helpers";
import {addSeo} from "~/lib/utils/seo";
import {useTranslation} from "react-i18next";
import {useAuth} from "~/lib/client/hooks/use-auth";
import {Badge} from "~/lib/client/components/ui/badge";
import {Button} from "~/lib/client/components/ui/button";
import {Separator} from "~/lib/client/components/ui/separator";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {Card, CardContent} from "~/lib/client/components/ui/card";
import {Servings} from "~/lib/client/components/details/Servings";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute, Link, useNavigate} from "@tanstack/react-router";
import {recipeDetailsOptions} from "~/lib/client/react-query/queryOptions";
import {CommentSection} from "~/lib/client/components/details/CommentSection";
import {useDeleteRecipe, useFavoriteRecipe} from "~/lib/client/react-query/mutations";
import {ChefHat, CircleCheck, Clock, Heart, History, Pen, Trash2, Users} from "lucide-react";


export const Route = createFileRoute("/_private/details/$recipeId")({
    loader: ({ context: { queryClient }, params: { recipeId } }) => {
        return queryClient.ensureQueryData(recipeDetailsOptions(Number(recipeId)));
    },
    head: ({ loaderData }) => {
        return {
            meta: [
                ...addSeo({
                    description: "View this delicious recipe",
                    title: loaderData?.title || "Recipe Details",
                    image: loaderData?.coverImage || "logo512.png",
                }),
            ],
        }
    },
    component: RecipeDetailsPage,
})


function RecipeDetailsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const { recipeId } = Route.useParams();
    const updateFavorite = useFavoriteRecipe();
    const deleteRecipeMutation = useDeleteRecipe();
    const [multi, setMulti] = useState(1);
    const recipe = useSuspenseQuery(recipeDetailsOptions(Number(recipeId))).data;

    const onDeleteRecipe = async () => {
        if (!window.confirm("Do you really want to delete this recipe?")) return;

        deleteRecipeMutation.mutate({ recipeId }, {
            onSuccess: () => {
                toast.success(t("success-recipe-deleted"));
                return navigate({ to: "/dashboard" });
            }
        });
    };

    const handleUpdateFavorite = () => {
        updateFavorite.mutate({ recipeId }, {
            onSuccess: () => {
                queryClient.setQueryData(recipeDetailsOptions(Number(recipeId)).queryKey, (oldData) => {
                    if (!oldData) return;
                    toast.success((oldData.isFavorited ? t("removed-recipe-favorite") : t("added-recipe-favorite")));
                    return { ...oldData, isFavorited: !oldData.isFavorited };
                });
            },
        });
    };

    return (
        <PageTitle title={`${recipe.title}`} onlyHelmet>
            <div className="flex max-sm:flex-col max-w-6xl mx-auto mt-8 gap-8 max-lg:gap-5">
                <div className="w-2/3 max-sm:w-full max-lg:w-[65%]">
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {recipe.title}
                            <div className="text-muted-foreground text-sm mt-2 font-normal">
                                {t("added-by")} <b>{recipe.submitterName}</b> {t("the")} {t("submit-date", { date: recipe.submittedDate })}
                            </div>
                        </h1>
                        <div className="flex gap-3">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleUpdateFavorite} disabled={updateFavorite.isPending}>
                                <Heart className={cn("h-4 w-4", recipe.isFavorited && "text-red-600")}/>
                            </Button>
                            <Link to="/edit-recipe/$recipeId" params={{ recipeId }}>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Pen className="h-4 w-4"/>
                                </Button>
                            </Link>
                            {currentUser?.role !== "user" &&
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={onDeleteRecipe}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            }
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {recipe.labels.map((label) =>
                                <Badge key={label.name} variant="inactive" color={label.color}>
                                    {label.name}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center justify-between max-sm:flex-wrap max-sm:gap-5">
                            <div className="flex items-center justify-between gap-3">
                                <Clock className="w-6 h-6 text-amber-600"/>
                                <div>
                                    <div className="font-semibold">Prep.</div>
                                    <div>{recipe.prepTime} min</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <ChefHat className="w-6 h-6 text-amber-600"/>
                                <div>
                                    <div className="font-semibold">{t("cook-details")}</div>
                                    <div>{recipe.cookingTime} min</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <History className="w-6 h-6 text-amber-600"/>
                                <div>
                                    <div className="font-semibold">Total</div>
                                    <div>{recipe.prepTime + recipe.cookingTime} min</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <Users className="w-6 h-6 text-amber-600"/>
                                <div>
                                    <div className="font-semibold">{t("servings")}</div>
                                    <Servings
                                        multiSetter={setMulti}
                                        initServings={recipe.servings}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-7"/>
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Instructions</h2>
                        <ol className="space-y-4">
                            {recipe.steps.map((step, idx) =>
                                <li key={idx}>
                                    <div className="grid grid-cols-[80px_1fr] text-lg">
                                        <div className="flex items-center font-semibold text-cyan-500">{t("step")} {idx + 1}</div>
                                        <div>{step.description}</div>
                                    </div>
                                    <Separator className="mt-4"/>
                                </li>
                            )}
                        </ol>
                    </div>
                    <div className="mt-9">
                        <CommentSection
                            recipeId={recipe.id}
                            currentUserId={currentUser?.id}
                            recipeSubmitterId={recipe.submitterId}
                        />
                    </div>
                </div>
                <div className="w-1/3 max-sm:w-full max-lg:w-[35%]">
                    <div className="relative rounded-lg">
                        <img
                            alt={recipe.title}
                            src={recipe.coverImage!}
                            className="object-cover rounded-lg bg-slate-700"
                        />
                    </div>
                    <Card className="sticky top-24 mt-8">
                        <CardContent className="pt-3 pb-4">
                            <h2 className="text-2xl font-semibold tracking-tight mb-6">{t("ingredients")}</h2>
                            <ul className="space-y-3 text-lg">
                                {recipe.ingredients.map((data) =>
                                    <li key={data.ingredient} className="flex items-start">
                                        <CircleCheck className="w-4 h-4 mr-4 mt-1 flex-shrink-0 text-green-600"/>
                                        <span>{(data.proportion * multi).toFixed(1)} {data.ingredient}</span>
                                    </li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageTitle>
    );
}