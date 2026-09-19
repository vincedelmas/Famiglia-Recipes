import React, {useState} from "react";
import {useGT} from "gt-react";
import {useForm} from "react-hook-form";
import {Input} from "~/lib/client/components/ui/input";
import {toast} from "~/lib/client/components/ui/toast";
import {Button} from "~/lib/client/components/ui/button";
import {useUploadMutation} from "~/lib/client/react-query";
import {Textarea} from "~/lib/client/components/ui/textarea";
import {AlertCircle, FileText, Loader2, Upload} from "lucide-react";
import {Alert, AlertDescription} from "~/lib/client/components/ui/alert";
import {RecipeFormValues, recipeImportFileSchema} from "~/lib/utils/schemas";
import {Field, FieldGroup, FieldLabel} from "~/lib/client/components/ui/field";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/lib/client/components/ui/tabs";
import {MAX_IMPORT_TEXT_LENGTH as MAX_TEXT_LENGTH, RECIPE_IMPORT_FILE_TYPES} from "~/lib/utils/constants";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "~/lib/client/components/ui/dialog";


interface UploadDialogProps {
    form: ReturnType<typeof useForm<RecipeFormValues>>;
}


export default function UploadDialog({ form }: UploadDialogProps) {
    const gt = useGT();
    const uploadMutation = useUploadMutation();
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [textContent, setTextContent] = useState("");
    const [activeTab, setActiveTab] = useState("upload");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const file = ev.target.files?.[0];
        if (file) {
            const validation = recipeImportFileSchema.safeParse(file);
            const messages: Record<string, string> = {
                "error-file-empty": gt("The selected file is empty."),
                "error-file-size": gt("The file must be no larger than 20 MB."),
                "error-file-type": gt("Unsupported file type. Please upload PDF, DOCX, JPG, PNG, or WEBP files."),
            };
            const fileErrors = validation.success ? [] : validation.error.issues.map(issue => messages[issue.message]);

            if (fileErrors.length > 0) {
                setErrors(fileErrors);
                setSelectedFile(null);
            }
            else {
                setErrors([]);
                setSelectedFile(file);
            }
        }
    }

    const handleTextChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = ev.target.value;
        if (text.length <= MAX_TEXT_LENGTH) {
            setTextContent(text);
            setErrors([]);
        }
        else {
            setErrors([gt("Text must be less than {max} characters", { max: MAX_TEXT_LENGTH.toLocaleString() })]);
        }
    }

    const onOpenChange: React.ComponentProps<typeof Dialog>["onOpenChange"] = (value, details) => {
        if (!value && uploadMutation.isPending) {
            details.cancel();
            return;
        }
        setOpen(value);
        if (!value) resetForm();
    }

    const handleSubmit = () => {
        const formData = new FormData();
        if (activeTab === "upload" && selectedFile) {
            formData.append("type", "file");
            formData.append("content", selectedFile);
        }
        else if (activeTab === "text" && textContent.trim()) {
            formData.append("type", "text");
            formData.append("content", textContent as string);
        }

        uploadMutation.mutate(formData, {
            onError: (error) => {
                setErrors([error.message]);
            },
            onSuccess: (data) => {
                form.reset({ ...data, image: form.getValues("image") }, { keepDefaultValues: true });
                setOpen(false);

                resetForm();
                toast.add({ type: "success", title: gt("Review the imported recipe before saving.") });
            },
        })
    }

    const canSubmit = () => {
        if (activeTab === "upload") {
            return selectedFile && errors.length === 0;
        }
        else {
            return textContent.trim().length > 0 && errors.length === 0;
        }
    }

    const resetForm = () => {
        setErrors([]);
        setTextContent("");
        setSelectedFile(null);
        setActiveTab("upload");
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger render={<Button variant="outline"/>}>
                <Upload data-icon="inline-start"/> Import a recipe
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        Upload Content
                    </DialogTitle>
                    <DialogDescription>
                        Upload a file or paste your text content.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-5">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <Upload className="h-4 w-4"/> File Upload
                        </TabsTrigger>
                        <TabsTrigger value="text" className="flex items-center gap-2">
                            <FileText className="h-4 w-4"/> Text Input
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="flex flex-col gap-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="file-upload">
                                    Choose File
                                </FieldLabel>
                                <Input
                                    type="file"
                                    id="file-upload"
                                    onChange={handleFileChange}
                                    disabled={uploadMutation.isPending}
                                    accept={Object.values(RECIPE_IMPORT_FILE_TYPES).flat().join(",")}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Supported formats: PDF, DOCX, JPG, PNG, WEBP (max 20MB)
                                </p>
                                {selectedFile &&
                                    <div className="text-sm text-primary">
                                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </div>
                                }
                            </Field>
                        </FieldGroup>
                    </TabsContent>
                    <TabsContent value="text" className="flex flex-col gap-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="text-content">
                                    Text Content
                                </FieldLabel>
                                <Textarea
                                    id="text-content"
                                    value={textContent}
                                    onChange={handleTextChange}
                                    disabled={uploadMutation.isPending}
                                    placeholder={gt("Paste the recipe content here...")}
                                    className="min-h-50 max-h-125 overflow-y-auto"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Maximum 10,000 characters</span>
                                    <span className={textContent.length > MAX_TEXT_LENGTH ? "text-destructive" : ""}>
                                        {textContent.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
                                    </span>
                                </div>
                            </Field>
                        </FieldGroup>
                    </TabsContent>
                </Tabs>

                {errors.length > 0 &&
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertDescription>
                            <ul className="flex list-inside list-disc flex-col gap-1">
                                {errors.map((error, idx) =>
                                    <li key={idx}>
                                        {error}
                                    </li>
                                )}
                            </ul>
                        </AlertDescription>
                    </Alert>
                }

                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={uploadMutation.isPending}
                        onClick={() => {
                            setOpen(false);
                            resetForm();
                        }}
                    >
                        Cancel
                    </Button>

                    <Button onClick={handleSubmit} disabled={!canSubmit() || uploadMutation.isPending}>
                        {uploadMutation.isPending
                            ? <><Loader2 className="animate-spin"/> Uploading</>
                            : <>Upload</>
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
