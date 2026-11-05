import {expect, mock, test} from "bun:test";
import {isRedirect} from "@tanstack/react-router";
import {MCP_READ_SCOPE, MCP_WRITE_SCOPE} from "@/lib/utils/mcp";
import {mcpRequestContext} from "../core/mcp/tool-context";


mock.module("@/lib/server/core/auth", () => ({ auth: { api: { getSession: mock(async () => null) } } }));
const {recipeReadMiddleware, recipeWriteMiddleware} = await import("./auth-guard");

type ReadAuth = (options: {
    context: { currentUser?: { id: number; role: string }; mcpAccess?: unknown };
    next: (options: unknown) => unknown;
}) => unknown;

const read = recipeReadMiddleware.options.server as unknown as ReadAuth;
const next = (options: unknown) => options;


test("recipe auth preserves browser identity and rejects client-supplied MCP identity", () => {
    const currentUser = { id: 2, role: "manager" };
    expect(read({ next, context: { currentUser } })).toEqual({ context: { currentUser } });

    try {
        read({ next, context: { mcpAccess: { userId: 99 } } });
        throw new Error("Expected an authentication redirect");
    }
    catch (error) {
        expect(isRedirect(error)).toBe(true);
    }
});


test("recipe auth prefers verified MCP identity without granting manager privileges", () => {
    const access = { userId: 1, username: "User 1", scopes: new Set([MCP_READ_SCOPE]) };
    const result = mcpRequestContext.run(access, () => read({ next, context: { currentUser: { id: 2, role: "manager" } } }));
    expect(result).toEqual({ context: { currentUser: { id: 1, role: "user" } } });
    expect(() => mcpRequestContext.run({ ...access, scopes: new Set() }, () => read({ next, context: {} }))).toThrow("permission to read");
});


test("recipe auth isolates concurrent MCP requests", async () => {
    const results = await Promise.all([1, 2].map(userId => mcpRequestContext.run({
        userId, username: `User ${userId}`, scopes: new Set([MCP_READ_SCOPE]),
    }, async () => {
        await Promise.resolve();
        return read({ next, context: {} });
    })));

    expect(results).toEqual([1, 2].map(id => ({ context: { currentUser: { id, role: "user" } } })));
    expect(mcpRequestContext.getStore()).toBeUndefined();
});



test("recipe writes require write scope independently of tool registration", () => {
    const write = recipeWriteMiddleware.options.server as unknown as (options: { next: () => unknown }) => unknown;
    const next = () => "allowed";
    const access = { userId: 1, username: "User 1", scopes: new Set([MCP_READ_SCOPE]) };

    expect(() => mcpRequestContext.run(access, () => write({ next }))).toThrow("permission to add or modify");
    expect(mcpRequestContext.run({ ...access, scopes: new Set([MCP_READ_SCOPE, MCP_WRITE_SCOPE]) }, () => write({ next }))).toBe("allowed");
    expect(write({ next })).toBe("allowed");
});
