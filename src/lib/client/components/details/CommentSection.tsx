import {useState} from "react";
import {useTranslation} from "react-i18next";
import {getRouteApi} from "@tanstack/react-router";
import {toast} from "~/lib/client/components/ui/toast";
import {Button} from "~/lib/client/components/ui/button";
import {Empty, EmptyHeader, EmptyDescription} from "~/lib/client/components/ui/empty";
import {Alert, AlertDescription} from "~/lib/client/components/ui/alert";
import {Avatar, AvatarFallback} from "~/lib/client/components/ui/avatar";
import {ChefHat, LoaderCircle, Pencil, Plus, Trash2} from "lucide-react";
import {CommentDialog} from "~/lib/client/components/details/CommentDialog";
import {Card, CardContent, CardHeader} from "~/lib/client/components/ui/card";
import {useIsMutating, useQuery, useQueryClient} from "@tanstack/react-query";
import {type recipeCommentsOptions, useDeleteComment} from "~/lib/client/react-query";


interface CommentSectionProps {
    recipeId: number;
    currentUserId?: number;
    recipeSubmitterId: number;
}


export type Comment = Awaited<ReturnType<NonNullable<ReturnType<typeof recipeCommentsOptions>["queryFn"]>>>[0];


export const CommentSection = ({ recipeId, currentUserId, recipeSubmitterId }: CommentSectionProps) => {
    const { recipeCommentsOptions: commentsOptions } = getRouteApi("/_private/details/$recipeId").useRouteContext();

    const { t } = useTranslation();
    const isMutating = useIsMutating();
    const queryClient = useQueryClient();
    const deleteCommentMutation = useDeleteComment();
    const [isOpen, setIsOpen] = useState(false);
    const [commentToEdit, setCommentToEdit] = useState<Comment | null>(null);
    const { data: comments, isLoading, isFetching, isError } = useQuery(commentsOptions);

    const onEditComment = (comment: Comment) => {
        setIsOpen(true);
        setCommentToEdit(comment);
    };

    const onAddComment = () => {
        setIsOpen(true);
        setCommentToEdit(null);
    };

    const onDeleteComment = (comment: Comment) => {
        deleteCommentMutation.mutate({ commentId: comment.id }, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: commentsOptions.queryKey });
                toast.add({ type: "success", title: t("success-comment-deleted") });
            },
        });
    };

    if (isLoading) {
        return <LoaderCircle className="h-6 w-6 animate-spin"/>;
    }

    return <>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="section-heading">{t("ui.recipe-notes")} <span className="font-sans text-sm text-muted-foreground">({comments?.length || 0})</span></h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("ui.notes-subtitle")}</p></div>
            <Button variant="outline" onClick={onAddComment}><Plus data-icon="inline-start"/>{t("add-comment")}</Button>
        </div>
        {isError ? <Alert variant="destructive"><AlertDescription>{t("ui.comments-error")}</AlertDescription></Alert> : comments?.length ? <div className="flex flex-col gap-4">
            {comments.map(comment => <Card key={comment.id}>
                <CardHeader className="flex flex-row items-start gap-3">
                    <Avatar><AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1"><p className="flex items-center gap-2 text-sm font-medium">{comment.user.name}{comment.userId === recipeSubmitterId && <ChefHat className="size-3.5 text-primary"/>}</p><time className="text-xs text-muted-foreground">{t("submit-date", {date:comment.updatedAt || comment.createdAt, includeTime:true})}</time></div>
                    {comment.user.id === currentUserId && <div className="flex shrink-0">
                        <Button variant="ghost" size="icon-sm" aria-label={t("edit-comment")} onClick={() => onEditComment(comment)} disabled={!!isMutating || isFetching}><Pencil/></Button>
                        <Button variant="ghost" size="icon-sm" aria-label={t("ui.delete")} onClick={() => onDeleteComment(comment)} disabled={!!isMutating || isFetching}><Trash2/></Button>
                    </div>}
                </CardHeader>
                <CardContent><p className="text-sm leading-7 whitespace-pre-line">{comment.content}</p></CardContent>
            </Card>)}
        </div> : <Empty className="border py-8"><EmptyHeader><EmptyDescription>{t("ui.no-comments")}</EmptyDescription></EmptyHeader></Empty>}
        {isOpen && <CommentDialog open={isOpen} setOpen={setIsOpen} recipeId={recipeId} commentToEdit={commentToEdit}/>}
    </>;
};
