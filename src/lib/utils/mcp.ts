import {clientEnv} from "@/env/client";


export const MCP_READ_SCOPE = "famiglia:read";

export const MCP_WRITE_SCOPE = "famiglia:write";

export const MCP_OFFLINE_ACCESS_SCOPE = "offline_access";

export const MCP_SCOPES = [MCP_READ_SCOPE, MCP_WRITE_SCOPE, MCP_OFFLINE_ACCESS_SCOPE];

export const MCP_RESOURCE = new URL("/api/mcp", clientEnv.VITE_BASE_URL).href;
