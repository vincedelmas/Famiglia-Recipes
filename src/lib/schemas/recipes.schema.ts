import {z} from "zod";


export type AllRecipesParams = z.infer<typeof allRecipesParamsSchema>;


const numberArraySchema = z.preprocess((value) => {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null || value === "") return [];
    return [value];
}, z.array(z.coerce.number().int().positive()).catch([]))
    .transform((values) => Array.from(new Set(values)));


export const allRecipesParamsSchema = z.object({
    labels: numberArraySchema,
    authors: numberArraySchema,
    q: z.string().trim().max(120).catch(""),
    page: z.coerce.number().int().positive().catch(1),
});
