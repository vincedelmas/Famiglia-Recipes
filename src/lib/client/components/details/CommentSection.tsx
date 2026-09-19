import {useState} from "react";
import {useTranslation} from "react-i18next";
import {bgSelector} from "~/lib/utils/helpers";
import {getRouteApi} from "@tanstack/react-router";
import {toast} from "~/lib/client/components/ui/toast";
import {Button} from "~/lib/client/components/ui/button";
import {MutedText} from "~/lib/client/components/app/MutedText";
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

    return (
        <>
            <h2 className="text-2xl flex justify-between items-center font-semibold tracking-tight mb-6">
                <div>
                    {t("comments")}
                    <span className="text-muted-foreground text-sm font-normal ml-2">
                        ({!!comments && comments?.length || 0})
                    </span>
                </div>
                <Button variant="secondary" onClick={onAddComment}>
                    <Plus className="h-5 w-5"/> {t("add-comment")}
                </Button>
            </h2>
            {isError ? <MutedText>The comments could not be loaded.</MutedText> : null}
            {comments && comments.length > 0 ?
                comments.map(comment =>
                    <div key={comment.id}>
                        <Card className="relative bg-zinc-900 text-gray-100 mb-4">
                            <CardHeader className="flex flex-row items-center gap-4 py-3 px-4">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className={bgSelector(comment.user.name)}>
                                        {comment.user.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{comment.user.name}</span>
                                        {comment.userId === recipeSubmitterId &&
                                            <ChefHat className="w-4 h-4 text-amber-500"/>
                                        }
                                    </div>
                                    <time className="text-sm text-gray-400">
                                        {t("submit-date", {
                                            date: comment.updatedAt ? comment.updatedAt : comment.createdAt,
                                            includeTime: true,
                                        })}
                                    </time>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-3 mt-1">
                                <div className="text-gray-300">{comment.content}</div>
                            </CardContent>
                            {comment.user.id === currentUserId &&
                                <div className="absolute right-1 top-1">
                                    <Button variant="ghost" size="icon" onClick={() => onEditComment(comment)}
                                            disabled={(!!isMutating || isFetching)}>
                                        <Pencil className="w-4 h-4 opacity-50"/>
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        disabled={(!!isMutating || isFetching)}
                                        onClick={() => onDeleteComment(comment)}
                                    >
                                        <Trash2 className="w-4 h-4 opacity-50"/>
                                    </Button>
                                </div>
                            }
                        </Card>
                    </div>
                )
                :
                <MutedText className="text-base -mt-2">
                    No comments added yet
                </MutedText>
            }
            {isOpen &&
                <CommentDialog
                    open={isOpen}
                    setOpen={setIsOpen}
                    recipeId={recipeId}
                    commentToEdit={commentToEdit}
                />
            }
        </>
    );
};