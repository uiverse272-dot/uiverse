import { callTool, TOOL_DEFS } from "@/lib/mcp";

/**
 * Remote MCP server over Streamable HTTP — stateless, JSON responses, no sessions.
 * Every tool is a read of public data, so there is nothing to keep between requests.
 *
 *   claude mcp add --transport http uiverse https://<host>/api/mcp
 *
 * Spec: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
 */

const SUPPORTED = ["2025-06-18", "2025-03-26", "2024-11-05"];

const INSTRUCTIONS =
  "Uiverse indexes real, live-captured web interfaces (many Arabic / right-to-left) and the components cropped from them, " +
  "each with measured colours, type, spacing and responsive behaviour. Typical flow: search_interfaces → get_screenshot to look → " +
  "get_interface_spec for exact values, or get_implementation_prompt for a build brief. Reuse design decisions, never a brand's name, logo or copy.";

type Rpc = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Record<string, unknown> };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id",
};

const reply = (id: Rpc["id"], result: unknown) => ({ jsonrpc: "2.0", id, result });
const error = (id: Rpc["id"], code: number, message: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

async function handle(msg: Rpc, origin: string) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return error(msg?.id, -32600, "Invalid request");
  const p = msg.params ?? {};

  switch (msg.method) {
    case "initialize": {
      const asked = typeof p.protocolVersion === "string" ? p.protocolVersion : SUPPORTED[0];
      return reply(msg.id, {
        protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "uiverse", title: "Uiverse — real interfaces, measured", version: "0.1.0" },
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return reply(msg.id, {});
    case "tools/list":
      return reply(msg.id, { tools: TOOL_DEFS });
    case "tools/call": {
      const toolName = typeof p.name === "string" ? p.name : "";
      if (!TOOL_DEFS.some((t) => t.name === toolName)) return error(msg.id, -32602, `Unknown tool: ${toolName}`);
      try {
        return reply(msg.id, await callTool(toolName, (p.arguments as Record<string, unknown>) ?? {}, origin));
      } catch (e) {
        /* a tool failure is a result the model can read, not a protocol error */
        return reply(msg.id, { content: [{ type: "text", text: `Tool failed: ${(e as Error).message}` }], isError: true });
      }
    }
    default:
      return error(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(error(null, -32700, "Parse error"), { status: 400, headers: CORS });
  }
  const origin = new URL(request.url).origin;
  const batch = Array.isArray(body);
  const msgs = (batch ? body : [body]) as Rpc[];

  /* notifications and responses carry no id and get no reply — 202 per the transport spec */
  const requests = msgs.filter((m) => m && m.id !== undefined && typeof m.method === "string");
  if (!requests.length) return new Response(null, { status: 202, headers: CORS });

  const out = await Promise.all(requests.map((m) => handle(m, origin)));
  return Response.json(batch ? out : out[0], { headers: CORS });
}

/* this server never pushes, so there is no SSE stream to open */
export function GET() {
  return new Response("Uiverse MCP endpoint — POST JSON-RPC here.", { status: 405, headers: { ...CORS, Allow: "POST" } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
