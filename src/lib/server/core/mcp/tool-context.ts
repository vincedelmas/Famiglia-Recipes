import z from "zod";
import {isNotFound} from "@tanstack/react-router";
import {AsyncLocalStorage} from "node:async_hooks";
import pinoLogger from "@/lib/server/core/pino-logger";
import {MCP_READ_SCOPE, MCP_WRITE_SCOPE} from "@/lib/utils/mcp";
import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {FormattedError, FormZodError} from "@/lib/utils/error-classes";
import type {CallToolResult, ToolAnnotations} from "@modelcontextprotocol/sdk/types.js";


export type McpAccess = {
    userId: number;
    username: string;
    scopes: Set<string>;
};


type RegisterOptions<T extends z.ZodObject> = {
    inputSchema: T;
    write?: boolean;
    description: string;
    annotations?: ToolAnnotations;
};


export const mcpRequestContext = new AsyncLocalStorage<McpAccess>();


const toolErrorMessage = (error: unknown) => {
    if (error instanceof z.ZodError || error instanceof FormZodError) {
        return error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    }

    if (error instanceof FormattedError) {
        return error.message;
    }

    if (isNotFound(error)) {
        return "Recette introuvable.";
    }
};


export const createToolContext = (server: McpServer, access: McpAccess) => {
    return {
        register<T extends z.ZodObject>(name: string, options: RegisterOptions<T>, action: (input: z.output<T>) => unknown) {
            const { write = false, annotations, inputSchema, description } = options;

            if (!access.scopes.has(write ? MCP_WRITE_SCOPE : MCP_READ_SCOPE)) {
                return;
            }

            const callTool = async (input: Record<string, unknown>): Promise<CallToolResult> => {
                try {
                    const data = {
                        result: (await action(input as z.output<T>)) ?? null,
                    };

                    return {
                        structuredContent: data,
                        content: [{ type: "text", text: JSON.stringify(data) }],
                    };
                }
                catch (error) {
                    const message = toolErrorMessage(error);
                    if (!message) {
                        pinoLogger.error({ err: error, userId: access.userId, tool: name }, "MCP tool failed");
                    }

                    return {
                        isError: true,
                        content: [{ type: "text", text: message ?? "Famiglia n’a pas pu effectuer cette opération. Réessayez plus tard." }],
                    };
                }
            };

            server.registerTool<z.ZodObject, z.ZodObject>(name, {
                description,
                inputSchema: inputSchema.strict(),
                annotations: {
                    readOnlyHint: !write,
                    idempotentHint: true,
                    openWorldHint: false,
                    destructiveHint: false,
                    ...annotations,
                },
            }, callTool);
        },
    };
};


export type ToolContext = ReturnType<typeof createToolContext>;
