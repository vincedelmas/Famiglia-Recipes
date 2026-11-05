import {FormattedError} from "@/lib/utils/error-classes";
import {z} from "zod";
import {expect, mock, test} from "bun:test";
import {notFound} from "@tanstack/react-router";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {InMemoryTransport} from "@modelcontextprotocol/sdk/inMemory.js";
import {MCP_READ_SCOPE, MCP_WRITE_SCOPE} from "@/lib/utils/mcp";


mock.module("@/env/client", () => ({ clientEnv: { VITE_BASE_URL: "http://localhost:3000" } }));
const logError = mock(() => {});
mock.module("@/lib/server/core/pino-logger", () => ({ default: { error: logError } }));

const {createToolContext, mcpRequestContext} = await import("./tool-context");
const details = { servings: 2, prepTime: 10, cookingTime: 20, labels: [{ name: "Plat" }], id: 1, title: "Pasta al pesto", ingredients: [{ proportion: 200, ingredient: "g pasta" }], steps: [{ description: "Cook the pasta." }] };
const getDetails = mock(async ({ data }: { data: string }) => {
    expect(mcpRequestContext.getStore()?.userId).toBe(1);
    if (data === "999") throw notFound();
    return { ...details, id: Number(data) };
});
const getAllRecipes = mock(async (_options: unknown) => ({
    recipes: [{ id: 1, title: details.title, submitter: { name: "User 2" } }],
    pagination: { total: 1 },
}));

mock.module("@/lib/server/functions/recipe-details", () => ({ getDetails }));
mock.module("@/lib/server/functions/all-recipes", () => ({ getAllRecipes }));
const getLabels = mock(async () => [{ id: 1, name: "Plat", color: "green", order: 0 }]);
const postAddRecipe = mock(async (_options: { data: FormData }) => ({ id: 42, title: "Pasta al pesto" }));
mock.module("@/lib/server/functions/add-recipe", () => ({ getLabels, postAddRecipe }));
const postEditRecipe = mock(async (_options: { data: FormData }) => {});
mock.module("@/lib/server/functions/edit-recipe", () => ({ postEditRecipe }));
const {registerRecipeTools} = await import("./recipe-tools");


test("recipe tools call shared server functions with request identity and centralized results", async () => {
    const access = { userId: 1, username: "User 1", scopes: new Set([MCP_READ_SCOPE]) };
    const server = new McpServer({ name: "test", version: "1.0.0" });
    const context = createToolContext(server, access);
    registerRecipeTools(context);
    context.register("write_test", { write: true, description: "Write", inputSchema: z.object({}) }, () => {});
    context.register("unexpected_error", { description: "Error", inputSchema: z.object({}) }, () => {
        throw new Error("private database details");
    });

    const client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    try {
        await server.connect(serverTransport);
        await client.connect(clientTransport);

        const { tools } = await client.listTools();
        expect(tools.map(tool => tool.name)).toEqual(["get_recipe", "get_recipe_labels", "unexpected_error"]);
        expect(tools[0]?.annotations?.readOnlyHint).toBe(true);

        await mcpRequestContext.run(access, async () => {
            const found = await client.callTool({ name: "get_recipe", arguments: { title: " Pasta al pesto " } });
            expect(getAllRecipes).toHaveBeenLastCalledWith({ data: { q: "Pasta al pesto", page: 1, labels: [], authors: [] } });
            expect(getDetails).toHaveBeenLastCalledWith({ data: "1" });
            expect(found.structuredContent).toMatchObject({ result: {
                status: "found",
                recipe: { ...details, url: "http://localhost:3000/details/1" },
            } });

            getAllRecipes.mockResolvedValueOnce({
                recipes: Array.from({ length: 11 }, (_, index) => ({ id: index + 1, title: `Pasta ${index}`, submitter: { name: "User 2" } })),
                pagination: { total: 11 },
            });
            getDetails.mockClear();
            const ambiguous = await client.callTool({ name: "get_recipe", arguments: { title: "pasta" } });
            expect(ambiguous.structuredContent).toMatchObject({ result: { status: "multiple_matches", hasMore: true } });
            expect(ambiguous.structuredContent).toHaveProperty("result.matches.length", 10);
            expect(getDetails).not.toHaveBeenCalled();

            await client.callTool({ name: "get_recipe", arguments: { recipeId: 2 } });
            expect(getDetails).toHaveBeenLastCalledWith({ data: "2" });

            getAllRecipes.mockResolvedValueOnce({ recipes: [], pagination: { total: 0 } });
            const missingTitle = await client.callTool({ name: "get_recipe", arguments: { title: "missing" } });
            expect(missingTitle.isError).toBe(true);

            const missingId = await client.callTool({ name: "get_recipe", arguments: { recipeId: 999 } });
            expect(missingId).toMatchObject({ isError: true, content: [{ type: "text", text: "Recette introuvable." }] });

            for (const args of [{}, { title: " " }, { recipeId: -1 }, { title: "pasta", recipeId: 1 }, { recipeId: 1, extra: true }]) {
                const result = await client.callTool({ name: "get_recipe", arguments: args });
                expect(result.isError).toBe(true);
            }

            const unexpected = await client.callTool({ name: "unexpected_error", arguments: {} });
            expect(unexpected.isError).toBe(true);
            expect(JSON.stringify(unexpected)).not.toContain("private database details");
            expect(logError).toHaveBeenCalled();
        });

        expect(mcpRequestContext.getStore()).toBeUndefined();
    }
    finally {
        await client.close();
        await server.close();
    }
});



test("recipe writes share server functions, support images and preserve omitted fields", async () => {
    const access = { userId: 1, username: "User 1", scopes: new Set([MCP_READ_SCOPE, MCP_WRITE_SCOPE]) };
    const server = new McpServer({ name: "test", version: "1.0.0" });
    registerRecipeTools(createToolContext(server, access));

    const client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const input = {
        title: "Pasta al pesto",
        servings: 2,
        preparation: 10,
        cooking: 20,
        ingredients: [{ quantity: 200, description: "g de pâtes" }],
        steps: [{ content: "Faites cuire les pâtes." }],
        labels: ["Plat"],
        comment: "Recette issue du PDF fourni.",
    };

    try {
        await server.connect(serverTransport);
        await client.connect(clientTransport);

        const { tools } = await client.listTools();
        expect(tools.find(tool => tool.name === "add_recipe")?.annotations).toMatchObject({ readOnlyHint: false, idempotentHint: false });

        await mcpRequestContext.run(access, async () => {
            const labels = await client.callTool({ name: "get_recipe_labels", arguments: {} });
            expect(labels.structuredContent).toMatchObject({ result: [{ name: "Plat" }] });

            const created = await client.callTool({ name: "add_recipe", arguments: input });
            expect(created.structuredContent).toMatchObject({ result: {
                status: "created", recipe: { id: 42, title: input.title, url: "http://localhost:3000/details/42" },
            } });
            const formData = postAddRecipe.mock.calls.at(-1)![0].data;
            expect(JSON.parse(String(formData.get("recipe")))).toEqual(input);
            expect(formData.has("image")).toBe(false);

            const image = { base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=", mimeType: "image/png" };
            await client.callTool({ name: "add_recipe", arguments: { ...input, image } });
            const uploaded = postAddRecipe.mock.calls.at(-1)![0].data.get("image") as File;
            expect(uploaded.type).toBe("image/png");
            expect(Buffer.from(await uploaded.arrayBuffer()).toString("base64")).toBe(image.base64);

            const edited = await client.callTool({ name: "edit_recipe", arguments: { recipeId: 1, title: "Nouveau titre" } });
            expect(edited.structuredContent).toMatchObject({ result: { status: "updated", recipe: { id: 1, title: "Nouveau titre" } } });
            const editForm = postEditRecipe.mock.calls.at(-1)![0].data;
            expect(editForm.has("image")).toBe(false);
            expect(JSON.parse(String(editForm.get("recipe")))).toEqual({
                id: "1", title: "Nouveau titre", servings: 2, preparation: 10, cooking: 20,
                ingredients: [{ quantity: 200, description: "g pasta" }],
                steps: [{ content: "Cook the pasta." }], labels: ["Plat"],
            });
            await client.callTool({ name: "edit_recipe", arguments: { recipeId: 1, image } });
            expect(Buffer.from(await (postEditRecipe.mock.calls.at(-1)![0].data.get("image") as File).arrayBuffer()).toString("base64")).toBe(image.base64);

            postEditRecipe.mockClear();
            for (const args of [{ recipeId: 1 }, { recipeId: 1, image: { ...image, base64: "invalid!" } }, { recipeId: 1, ingredients: [] }]) {
                expect((await client.callTool({ name: "edit_recipe", arguments: args })).isError).toBe(true);
            }
            expect(postEditRecipe).not.toHaveBeenCalled();

            postAddRecipe.mockClear();
            for (const invalid of [
                { ...input, title: " " },
                { ...input, ingredients: [] },
                { ...input, steps: [] },
                { ...input, labels: [] },
                { ...input, servings: 0 },
                { ...input, cooking: -1 },
                { ...input, url: "https://example.com/recipe" },
            ]) {
                const result = await client.callTool({ name: "add_recipe", arguments: invalid });
                expect(result.isError).toBe(true);
            }
            expect(postAddRecipe).not.toHaveBeenCalled();

            postAddRecipe.mockRejectedValueOnce(new FormattedError("Unknown recipe category"));
            const rejected = await client.callTool({ name: "add_recipe", arguments: { ...input, labels: ["Unknown"] } });
            expect(rejected).toMatchObject({ isError: true, content: [{ type: "text", text: "Unknown recipe category" }] });
        });
    }
    finally {
        await client.close();
        await server.close();
    }
});
