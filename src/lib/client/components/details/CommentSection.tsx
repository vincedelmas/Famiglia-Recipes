import {useState} from "react";
import {useGT, useLocale} from "gt-react";
import {getRouteApi} from "@tanstack/react-router";
import {formatDateTime} from "~/lib/utils/helpers";
import {toast} from "~/lib/client/components/ui/toast";
import {Button} from "~/lib/client/components/ui/button";
import {Alert, AlertDescription} from "~/lib/client/components/ui/alert";
import {Avatar, AvatarFallback} from "~/lib/client/components/ui/avatar";
import {ChefHat, LoaderCircle, Pencil, Plus, Trash2} from "lucide-react";
import {CommentDialog} from "~/lib/client/components/details/CommentDialog";
import {Card, CardContent, CardHeader} from "~/lib/client/components/ui/card";
import {useIsMutating, useQuery, useQueryClient} from "@tanstack/react-query";
import {Empty, EmptyDescription, EmptyHeader} from "~/lib/client/components/ui/empty";
import {type recipeCommentsOptions, useDeleteComment} from "~/lib/client/react-query";


interface CommentSectionProps {
    recipeId: number;
    currentUserId?: number;
    recipeSubmitterId: number;
}


export type Comment = Awaited<ReturnType<NonNullable<ReturnType<typeof recipeCommentsOptions>["queryFn"]>>>[0];


export const CommentSection = ({ recipeId, currentUserId, recipeSubmitterId }: CommentSectionProps) => {
    const { recipeCommentsOptions: commentsOptions } = getRouteApi("/_private/details/$recipeId").useRouteContext();

    const gt = useGT();
    const locale = useLocale();
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
                toast.add({ type: "success", title: gt("Comment deleted") });
            },
        });
    };

    if (isLoading) {
        return <LoaderCircle className="h-6 w-6 animate-spin"/>;
    }

    return <>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h2 className="section-heading">
                    Comments{" "}
                    <span className="font-sans text-sm text-muted-foreground">
                        ({comments?.length || 0})
                    </span>
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Tips and feedback about this recipe.
                </p>
            </div>

            <Button variant="outline" onClick={onAddComment} size="sm">
                <Plus data-icon="inline-start"/>
                Add a comment
            </Button>
        </div>

        {isError ?
            <Alert variant="destructive">
                <AlertDescription>
                    Couldn’t load the comments. Please try again.
                </AlertDescription>
            </Alert>
            : comments?.length ?
                <div className="flex flex-col gap-4">
                    {comments.map(comment =>
                        <Card key={comment.id}>
                            <CardHeader className="flex flex-row items-start gap-3">
                                <Avatar>
                                    <AvatarFallback>
                                        {comment.user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-2 text-sm font-medium">
                                        {comment.user.name}
                                        {comment.userId === recipeSubmitterId &&
                                            <ChefHat className="size-3.5 text-primary"/>
                                        }
                                    </p>
                                    <time className="text-xs text-muted-foreground">
                                        {formatDateTime(comment.updatedAt || comment.createdAt, locale, { includeTime: true })}
                                    </time>
                                </div>

                                {comment.user.id === currentUserId &&
                                    <div className="flex shrink-0">
                                        <Button
                                            variant="ghost" size="icon-sm"
                                            aria-label={gt("Edit comment")}
                                            disabled={!!isMutating || isFetching}
                                            onClick={() => onEditComment(comment)}
                                        >
                                            <Pencil/>
                                        </Button>
                                        <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            aria-label={gt("Delete")}
                                            disabled={!!isMutating || isFetching}
                                            onClick={() => onDeleteComment(comment)}
                                        >
                                            <Trash2/>
                                        </Button>
                                    </div>
                                }
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-7 whitespace-pre-line">
                                    {comment.content}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
                :
                <Empty className="border py-8">
                    <EmptyHeader>
                        <EmptyDescription>
                            No comments yet.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
        }

        {isOpen &&
            <CommentDialog
                open={isOpen}
                setOpen={setIsOpen}
                recipeId={recipeId}
                commentToEdit={commentToEdit}
            />
        }
    </>;
};
