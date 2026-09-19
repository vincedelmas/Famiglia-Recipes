import {useState} from "react";
import {cn} from "~/lib/utils/helpers";
import {useTranslation} from "react-i18next";
import {useAuth} from "~/lib/client/hooks/use-auth";
import {toast} from "~/lib/client/components/ui/toast";
import {Badge} from "~/lib/client/components/ui/badge";
import {Button} from "~/lib/client/components/ui/button";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from "~/lib/client/components/ui/card";
import {Avatar, AvatarFallback} from "~/lib/client/components/ui/avatar";
import {RecipeImage} from "~/lib/client/components/app/RecipeImage";
import {Servings} from "~/lib/client/components/details/Servings";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute, Link, useNavigate} from "@tanstack/react-router";
import {CommentSection} from "~/lib/client/components/details/CommentSection";
import {useDeleteRecipe, useFavoriteRecipe} from "~/lib/client/react-query/mutations";
import {ArrowLeft, Clock, CookingPot, Heart, Pen, Timer, Trash2} from "lucide-react";
import {recipeCommentsOptions, recipeDetailsOptions} from "~/lib/client/react-query/queryOptions";


export const Route = createFileRoute("/_private/details/$recipeId")({
    context: ({ params: { recipeId } }) => ({
        recipeDetailsOptions: recipeDetailsOptions(Number(recipeId)),
        recipeCommentsOptions: recipeCommentsOptions(Number(recipeId)),
    }),
    remountDeps: ({params}) => params.recipeId,
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
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

    const options = Route.useRouteContext().recipeDetailsOptions;
    const recipe = useSuspenseQuery(options).data;

    const onDeleteRecipe = async () => {
        if (!window.confirm(t("ui.delete-confirm"))) return;

        deleteRecipeMutation.mutate({ recipeId }, {
            onSuccess: () => {
                toast.add({ type: "success", title: t("success-recipe-deleted") });
                return navigate({ to: "/dashboard" });
            }
        });
    };

    const handleUpdateFavorite = () => {
        updateFavorite.mutate({ recipeId }, {
            onSuccess: () => {
                queryClient.setQueryData(options.queryKey, (oldData) => {
                    if (!oldData) return;

                    toast.add({
                        type: "success",
                        title: (
                            oldData.isFavorited
                                ? t("removed-recipe-favorite")
                                : t("added-recipe-favorite")
                        )
                    });

                    return {
                        ...oldData,
                        isFavorited: !oldData.isFavorited,
                    };
                });
            },
        });
    };

    return <PageTitle title={recipe.title} onlyHelmet>
        <meta name="description" content={recipe.title}/>
        <meta property="og:type" content="website"/>
        <meta property="og:title" content={recipe.title}/>
        <meta property="og:description" content={recipe.title}/>
        <meta name="twitter:title" content={recipe.title}/>
        <meta name="twitter:description" content={recipe.title}/>
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:image" content={recipe.coverImage || "/logo512.png"}/>
        <meta property="og:image" content={recipe.coverImage || "/logo512.png"}/>
        <div className="page-enter pb-5 pt-8 sm:pt-10">
            <Link to="/all-recipes" search={{q:"", page:1, labels:[], authors:[]}} className="text-link mb-7"><ArrowLeft className="size-4"/>{t("ui.back-recipes")}</Link>
            <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14">
                <div>
                    <div className="mb-5 flex flex-wrap gap-2">{recipe.labels.map(label => <Badge key={label.name} variant="secondary">{label.name}</Badge>)}</div>
                    <h1 className="page-heading text-[42px] sm:text-[58px]">{recipe.title}</h1>
                    <div className="mt-6 flex items-center gap-3"><Avatar><AvatarFallback>{recipe.submitterName.charAt(0).toUpperCase()}</AvatarFallback></Avatar><div><p className="text-sm font-medium">{t("ui.from-kitchen", {name:recipe.submitterName})}</p><p className="mt-0.5 text-xs text-muted-foreground">{t("submit-date", {date:recipe.submittedDate})}</p></div></div>
                    <div className="my-7 grid grid-cols-3 divide-x border-y py-5">
                        {[{icon:Clock, label:t("ui.prep"), value:recipe.prepTime}, {icon:CookingPot, label:t("cook-details"), value:recipe.cookingTime}, {icon:Timer, label:t("ui.total"), value:recipe.prepTime + recipe.cookingTime}].map(item => <div key={item.label} className="flex flex-col gap-1.5 px-3 first:pl-0"><item.icon className="mb-1 size-4 text-primary" strokeWidth={1.5}/><span className="text-xs text-muted-foreground">{item.label}</span><span className="text-sm font-medium">{item.value} {t("ui.min")}</span></div>)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant={recipe.isFavorited ? "secondary" : "outline"} onClick={handleUpdateFavorite} disabled={updateFavorite.isPending} aria-pressed={recipe.isFavorited}><Heart data-icon="inline-start" className={cn(recipe.isFavorited && "fill-current")}/>{t(recipe.isFavorited ? "ui.unfavorite" : "ui.favorite")}</Button>
                        <Button variant="ghost" nativeButton={false} render={<Link to="/edit-recipe/$recipeId" params={{recipeId}}/>}><Pen data-icon="inline-start"/>{t("edit")}</Button>
                        {currentUser?.role !== "user" && <Button variant="ghost" size="icon" disabled={deleteRecipeMutation.isPending} aria-label={t("ui.delete")} onClick={onDeleteRecipe}><Trash2/></Button>}
                    </div>
                </div>
                <div className="order-first aspect-[5/4] overflow-hidden rounded-[24px] bg-muted lg:order-last">
                    <RecipeImage src={recipe.coverImage} alt={recipe.title} priority/>
                </div>
            </div>
            <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-[340px_1fr] lg:gap-16">
                <aside className="lg:sticky lg:top-28">
                    <Card>
                        <CardHeader><CardTitle>{t("ingredients")}</CardTitle><CardDescription>{t("ui.servings-note")}</CardDescription></CardHeader>
                        <CardContent>
                            <div className="mb-5 flex items-center justify-between gap-3 border-b pb-5"><span className="text-sm">{t("servings")}</span><Servings servings={Math.round(recipe.servings * multi)} onChange={value => setMulti(value / recipe.servings)}/></div>
                            <ul className="flex flex-col gap-4">
                                {recipe.ingredients.map((ingredient, index) => <li key={index}><label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
                                    <input type="checkbox" className="mt-1 size-4 shrink-0 accent-primary" checked={checkedIngredients.has(index)} onChange={() => setCheckedIngredients(previous => { const next = new Set(previous); if (next.has(index)) next.delete(index); else next.add(index); return next; })}/>
                                    <span className={cn("transition-opacity", checkedIngredients.has(index) && "text-muted-foreground line-through opacity-60")}><strong className="font-semibold">{Number((ingredient.proportion * multi).toFixed(1))}</strong> {ingredient.ingredient}</span>
                                </label></li>)}
                            </ul>
                        </CardContent>
                        <CardFooter><span className="text-xs text-muted-foreground">{checkedIngredients.size} / {recipe.ingredients.length}</span></CardFooter>
                    </Card>
                </aside>
                <div>
                    <p className="eyebrow mb-3">{t("r-steps")}</p><h2 className="section-heading mb-8">{t("ui.instructions")}</h2>
                    <ol className="flex flex-col gap-8">
                        {recipe.steps.map((step, index) => <li key={index} className="flex items-start gap-5 border-b pb-8 last:border-0"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-lg text-accent-foreground">{index + 1}</span><p className="pt-1 text-[15px] leading-8 whitespace-pre-line">{step.description}</p></li>)}
                    </ol>
                    <section className="mt-10 border-t pt-9"><CommentSection recipeId={recipe.id} currentUserId={currentUser?.id} recipeSubmitterId={recipe.submitterId}/></section>
                </div>
            </div>
        </div>
    </PageTitle>;
}
