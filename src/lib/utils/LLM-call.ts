import {z} from "zod";
import {serverEnv} from "~/env/server";
import {Message, Request} from "~/lib/types/types";
import {recipeFormSchema} from "~/lib/utils/schemas";
import {FormattedError} from "~/lib/utils/error-classes";
import {createServerOnlyFn} from "@tanstack/react-start";


const recipeInstructions = `Retourne cette recette en utilisant ce format JSON est aucun autre text. UTILISE LE FRANCAIS. Pour la description
    des étapes tu peux etre un peu plus court. Pour les labels tu a le choix entre (MAX 4) : Apéro, Plat, Dessert, Poisson,
    Viande rouge, Viande blanche, Végétarien, Végan, Fruit de mer, Fruit, Légumineuse, Four, Casserole, Friteuse, Cuisson vapeur,
    Micro-ondes, Grill, Entrée, Sauce, Cocotte-minute. JE REPETE RETOURNE LES DATA EN FRANCAIS.
    RESPECTE CE FORMAT POUR LES INGREDIENTS (VALEUR NUMERIQUE DANS "quantity" ET UNITE ET CONTENU DANS "description"), exemple:
    {
        quantity: 60,
        description: "cl. de jus de cuisson"
    },
    {
        quantity: 120,
        description: "gr. de Maizena"
    },
    {
        quantity: 100,
        description: "ml. de lait"
    },
    {
        quantity: 1,
        description: "pincée de poivre"
    },
    `.trim();


export const callGeminiModel = createServerOnlyFn(() => async (textContent: string | null, file: File | null) => {
    const messages: Message[] = [];

    if (textContent) {
        messages.push({
            role: "user",
            content: `Ceci est la recette : ${textContent}. ${recipeInstructions}`,
        });
    }
    else if (file) {
        const base64Content = Buffer.from(await file.arrayBuffer()).toString("base64");

        if (file.type === "application/pdf") {
            messages.push({
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Ce PDF contient la recette. ${recipeInstructions}`,
                    },
                    {
                        type: "file",
                        file: {
                            filename: "recipe.pdf",
                            file_data: `data:application/pdf;base64,${base64Content}`,
                        },
                    },
                ],
            });
        }
        else {
            messages.push({
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Cette image contient la recette. ${recipeInstructions}`,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${file.type};base64,${base64Content}`,
                        },
                    },
                ],
            });
        }
    }

    const requestBody: Request = {
        model: serverEnv.OPEN_ROUTER_MODEL_ID,
        max_tokens: 3000,
        messages: messages,
        response_format: {
            type: "json_schema",
            json_schema: {
                strict: true,
                name: "recipe",
                schema: z.toJSONSchema(recipeFormSchema),
            },
        },
        plugins: [
            {
                id: "file-parser",
                pdf: {
                    engine: "pdf-text",
                },
            },
        ],
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serverEnv.OPEN_ROUTER_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    const aiResponseData = await response.json();

    try {
        const jsonResponse = JSON.parse(aiResponseData.choices[0].message.content);
        return recipeFormSchema.parse(jsonResponse);
    }
    catch {
        throw new FormattedError("So... the AI bugged. Please try again later.", true);
    }
})();
