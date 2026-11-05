import type {z} from "zod";
import {imageRecipeSchema} from "@/lib/utils/schemas";
import type {addRecipeInputSchema} from "@/lib/schemas/tool-schemas";


export const recipeToolFormData = ({ image, ...recipe }: z.infer<typeof addRecipeInputSchema> & { id?: string }) => {
    const formData = new FormData();
    formData.set("recipe", JSON.stringify(recipe));

    if (image) {
        const file = new File([Buffer.from(image.base64, "base64")], "cover", { type: image.mimeType });
        imageRecipeSchema.parse(file);
        formData.set("image", file);
    }

    return formData;
};
