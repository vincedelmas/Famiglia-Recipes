import {useGT} from "gt-react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {getRouteApi} from "@tanstack/react-router";
import {useQueryClient} from "@tanstack/react-query";
import {Button} from "~/lib/client/components/ui/button";
import {Textarea} from "~/lib/client/components/ui/textarea";
import {Comment} from "~/lib/client/components/details/CommentSection";
import {useAddComment, useEditComment} from "~/lib/client/react-query";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "~/lib/client/components/ui/form";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "~/lib/client/components/ui/dialog";


interface CommentDialogProps {
    open: boolean;
    recipeId: number;
    commentToEdit: Comment | null;
    setOpen: (open: boolean) => void;
}


export const CommentDialog = ({ open, setOpen, commentToEdit, recipeId }: CommentDialogProps) => {
    const gt = useGT();
    const isEditing = !!commentToEdit;
    const addComment = useAddComment();
    const editComment = useEditComment();
    const queryClient = useQueryClient();
    const [warning, setWarning] = useState(false);
    const { recipeCommentsOptions: commentsOptions } = getRouteApi("/_private/details/$recipeId").useRouteContext();
    const form = useForm<Comment>({
        defaultValues: {
            content: isEditing ? commentToEdit.content : "",
        }
    });

    function onSubmit(data: Comment) {
        if (!data.content.trim())
            return setWarning(true);

        if (commentToEdit?.id) {
            editComment.mutate({ commentId: commentToEdit.id, content: data.content }, {
                onSuccess: async () => {
                    form.reset();
                    setOpen(false);
                    await queryClient.invalidateQueries({ queryKey: commentsOptions.queryKey });
                },
            });
        }
        else {
            addComment.mutate({ recipeId, content: data.content }, {
                onSuccess: async () => {
                    form.reset();
                    setOpen(false);
                    await queryClient.invalidateQueries({ queryKey: commentsOptions.queryKey });
                },
            });
        }
    }

    const title = isEditing ? <>Edit comment</> : <>Add a comment</>;
    const subtitle = isEditing ? <>Edit your comment for this recipe</> : <>Add a new comment to this recipe</>;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{subtitle}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <FormField
                            name="content"
                            control={form.control}
                            render={({ field }) =>
                                <FormItem>
                                    <FormLabel className="sr-only">Comment</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            className="h-37.5"
                                            placeholder={gt("Add your comment here")}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {warning ? <span className="text-destructive">The comment cannot be empty</span> : <>Add a tip or feedback about this recipe.</>}
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            }
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={addComment.isPending || editComment.isPending}>
                                {(addComment.isPending || editComment.isPending)
                                    ? <>Submitting...</>
                                    : <>Save</>
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
