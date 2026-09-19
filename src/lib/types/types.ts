export type LabelType = {
    id: number;
    name: string;
    color: string;
};


// --- OPEN ROUTER AI TYPES -------------------------------------------------------------


export type Request = {
    prompt?: string;
    messages?: Message[];
    model?: string;
    response_format?: {
        type: "json_schema",
        json_schema: {
            name: string,
            strict: boolean,
            schema: Record<string, any>,
        }
    };
    stop?: string | string[];
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
    tools?: Tool[];
    tool_choice?: ToolChoice;
    seed?: number;
    top_p?: number;
    top_k?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    repetition_penalty?: number;
    logit_bias?: { [key: number]: number };
    top_logprobs?: number;
    min_p?: number;
    top_a?: number;
    prediction?: { type: "content"; content: string };
    transforms?: string[];
    models?: string[];
    route?: "fallback";
    provider?: any;
    user?: string;
    plugins?: {
        id: "file-parser";
        pdf: {
            engine: "pdf-text" | "mistral-ocr" | "native";
        }
    }[],
};


type TextContent = {
    type: "text";
    text: string;
};

type ImageContentPart = {
    type: "image_url";
    image_url: {
        url: string;
        detail?: string;
    };
};

type ContentPart = TextContent | ImageContentPart;

export type Message =
    | {
    name?: string;
    content: string | ContentPart[];
    role: "user" | "assistant" | "system";
}
    | {
    role: "tool";
    name?: string;
    content: string;
    tool_call_id: string;
};

type FunctionDescription = {
    name: string;
    parameters: object;
    description?: string;
};

type Tool = {
    type: "function";
    function: FunctionDescription;
};

type ToolChoice =
    | "none"
    | "auto"
    | {
    type: "function";
    function: {
        name: string;
    };
};
