import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  type ListResourceTemplatesRequest,
  type ListResourcesRequest,
  type ListToolsRequest,
  type ReadResourceRequest,
  type Resource,
  type ResourceTemplate,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

type LesCoureursWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
};

type JsonSchema = {
  type: "object";
  properties?: Record<string, unknown>;
  required?: readonly string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
};

type ToolDefinition<T> = {
  name: string;
  title: string;
  description: string;
  widget: LesCoureursWidget;
  inputSchema: JsonSchema;
  parser: z.ZodType<T>;
  handle: (args: T) => { text: string; structuredContent: unknown };
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const ASSETS_DIR = path.resolve(ROOT_DIR, "assets");

function readWidgetHtml(componentName: string): string {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(
      `Widget assets not found. Expected directory ${ASSETS_DIR}. Run "pnpm run build" before starting the server.`
    );
  }

  const directPath = path.join(ASSETS_DIR, `${componentName}.html`);
  let htmlContents: string | null = null;

  if (fs.existsSync(directPath)) {
    htmlContents = fs.readFileSync(directPath, "utf8");
  } else {
    const candidates = fs
      .readdirSync(ASSETS_DIR)
      .filter(
        (file) => file.startsWith(`${componentName}-`) && file.endsWith(".html")
      )
      .sort();
    const fallback = candidates[candidates.length - 1];
    if (fallback) {
      htmlContents = fs.readFileSync(path.join(ASSETS_DIR, fallback), "utf8");
    }
  }

  if (!htmlContents) {
    throw new Error(
      `Widget HTML for "${componentName}" not found in ${ASSETS_DIR}. Run "pnpm run build" to generate the assets.`
    );
  }

  return htmlContents;
}

function widgetMeta(widget: LesCoureursWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const sharedWidget: LesCoureursWidget = {
  id: "les-coureurs-dashboard",
  title: "LES COUREURS Control",
  templateUri: "ui://widget/les-coureurs.html",
  invoking: "Compiling Les Coureurs telemetry",
  invoked: "Les Coureurs dashboard ready",
  html: readWidgetHtml("les-coureurs"),
};

type MissionStatus = "available" | "active" | "completed";
type MissionPriority = "low" | "moderate" | "high";

type MissionRecord = {
  id: string;
  codename: string;
  summary: string;
  status: MissionStatus;
  priority: MissionPriority;
  region: string;
  reward: { credits: number; favors?: string[] };
  window: { start: string; end: string };
  specialists: string[];
  tags: string[];
};

const missionCatalog: MissionRecord[] = [
  {
    id: "vapor-trail",
    codename: "Vapor Trail",
    summary:
      "Trace a defected courier across the Lyonnais maglev network and recover the stolen quantum spool before it is fenced.",
    status: "active",
    priority: "high",
    region: "Lyonnais Corridor",
    reward: { credits: 8200, favors: ["Express lane clearance", "Refuel chit"] },
    window: {
      start: "2024-10-21T04:30:00Z",
      end: "2024-10-22T22:00:00Z",
    },
    specialists: ["Tracer Gaspard", "Driver Mireille"],
    tags: ["recovery", "infiltration"],
  },
  {
    id: "jade-mistral",
    codename: "Jade Mistral",
    summary:
      "Escort a climate caravan carrying desal regulators through contested Camargue marsh routes under cover of night.",
    status: "available",
    priority: "moderate",
    region: "Camargue Marshlands",
    reward: { credits: 5400 },
    window: {
      start: "2024-10-24T19:00:00Z",
      end: "2024-10-25T05:30:00Z",
    },
    specialists: ["Pilot Vinh", "Navigator Solenne"],
    tags: ["escort", "environmental"],
  },
  {
    id: "clockwork-ember",
    codename: "Clockwork Ember",
    summary:
      "Sabotage a rival syndicate's drone foundry by introducing latency into their print queue during the midnight maintenance window.",
    status: "available",
    priority: "high",
    region: "Nouvelle Limoges",
    reward: { credits: 6700, favors: ["Black channel uplink"] },
    window: {
      start: "2024-10-22T23:45:00Z",
      end: "2024-10-23T03:15:00Z",
    },
    specialists: ["Ghost Ilya", "Mechanist Noor"],
    tags: ["sabotage", "cyber"],
  },
  {
    id: "amber-resonance",
    codename: "Amber Resonance",
    summary:
      "Stabilize a wayward resonance beacon to reopen the Jura smugglers' corridor before the seasonal storms close the pass.",
    status: "completed",
    priority: "moderate",
    region: "Jura Highlands",
    reward: { credits: 4600 },
    window: {
      start: "2024-10-12T09:00:00Z",
      end: "2024-10-12T14:00:00Z",
    },
    specialists: ["Surveyor Lina", "Engineer Baptiste"],
    tags: ["logistics", "infrastructure"],
  },
];

type InventoryItem = {
  id: string;
  label: string;
  category: string;
  status: "staged" | "deployed" | "maintenance";
  quantity: number;
  unit: string;
  notes?: string;
};

const inventoryLedger: InventoryItem[] = [
  {
    id: "warp-sling",
    label: "Warp Sling Mk.III",
    category: "Mobility",
    status: "staged",
    quantity: 6,
    unit: "rigs",
    notes: "Primed with fresh capacitor banks",
  },
  {
    id: "echo-shroud",
    label: "Echo Shroud Mesh",
    category: "Infiltration",
    status: "deployed",
    quantity: 18,
    unit: "squares",
    notes: "Cells 3 and 4 overdue for resequencing",
  },
  {
    id: "auric-seal",
    label: "Auric Seal Credentials",
    category: "Identity",
    status: "staged",
    quantity: 12,
    unit: "latches",
  },
  {
    id: "pulse-forge",
    label: "Pulse Forge Charges",
    category: "Sabotage",
    status: "maintenance",
    quantity: 9,
    unit: "cells",
    notes: "Awaiting coil realignment",
  },
];

type TravelCorridor = {
  id: string;
  origin: string;
  destination: string;
  clearance: "standard" | "express" | "shadow";
  typicalHours: number;
  bottlenecks: string[];
  conveyance: string;
};

const travelNetwork: TravelCorridor[] = [
  {
    id: "lyon-to-marseille",
    origin: "Lyonnais Hub",
    destination: "Marseille Freeport",
    clearance: "express",
    typicalHours: 5.5,
    bottlenecks: ["Aix thermal checks"],
    conveyance: "Night maglev + delta skiff",
  },
  {
    id: "marseille-to-nice",
    origin: "Marseille Freeport",
    destination: "Nice Sky-lift",
    clearance: "shadow",
    typicalHours: 4.25,
    bottlenecks: ["Coastal drone patrols"],
    conveyance: "Subsurface tram + stealth dirigible",
  },
  {
    id: "lyon-to-geneva",
    origin: "Lyonnais Hub",
    destination: "Geneva Relay",
    clearance: "standard",
    typicalHours: 3.5,
    bottlenecks: ["Customs lattice sync"],
    conveyance: "Overland caravan",
  },
];

const missionInputSchema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["available", "active", "completed"],
      description: "Filter missions by current engagement status.",
    },
    priority: {
      type: "string",
      enum: ["low", "moderate", "high"],
      description: "Limit missions to a priority tier.",
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 10,
      description: "Maximum number of missions to return.",
    },
  },
  additionalProperties: false,
} as const;

const missionParser = z
  .object({
    status: z.enum(["available", "active", "completed"]).optional(),
    priority: z.enum(["low", "moderate", "high"]).optional(),
    limit: z.number().int().min(1).max(10).optional(),
  })
  .strict();

const inventoryInputSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["allocate", "reserve", "return", "scrap"],
      description: "Inventory directive to perform.",
    },
    itemId: {
      type: "string",
      description: "Identifier of the inventory item to update.",
    },
    quantity: {
      type: "integer",
      minimum: 1,
      description: "Quantity affected by the directive.",
    },
    notes: {
      type: "string",
      description: "Optional note to attach to the action log.",
    },
  },
  required: ["action", "itemId", "quantity"],
  additionalProperties: false,
} as const;

const inventoryParser = z
  .object({
    action: z.enum(["allocate", "reserve", "return", "scrap"]),
    itemId: z.string().min(1),
    quantity: z.number().int().min(1),
    notes: z.string().max(280).optional(),
  })
  .strict();

const travelInputSchema = {
  type: "object",
  properties: {
    origin: {
      type: "string",
      description: "Launch point for the itinerary.",
    },
    destination: {
      type: "string",
      description: "Intended drop site or rendezvous.",
    },
    priority: {
      type: "string",
      enum: ["standard", "express", "stealth"],
      description: "Route handling preference.",
    },
    departure: {
      type: "string",
      format: "date-time",
      description: "Requested departure window.",
    },
    payload: {
      type: "string",
      description: "Cargo manifest or objective payload summary.",
    },
  },
  required: ["origin", "destination"],
  additionalProperties: false,
} as const;

const travelParser = z
  .object({
    origin: z.string().min(1),
    destination: z.string().min(1),
    priority: z.enum(["standard", "express", "stealth"]).optional(),
    departure: z.string().datetime().optional(),
    payload: z.string().max(240).optional(),
  })
  .strict();

function summarizeMissions({
  status,
  priority,
  limit,
}: z.infer<typeof missionParser>) {
  const filtered = missionCatalog.filter((mission) => {
    if (status && mission.status !== status) return false;
    if (priority && mission.priority !== priority) return false;
    return true;
  });

  const limited = filtered.slice(0, limit ?? filtered.length);

  const counts = missionCatalog.reduce(
    (acc, mission) => {
      acc[mission.status] += 1;
      return acc;
    },
    { available: 0, active: 0, completed: 0 } as Record<MissionStatus, number>
  );

  return {
    text: `Queued ${limited.length} mission${limited.length === 1 ? "" : "s"} for briefing.`,
    structuredContent: {
      view: "missions",
      filters: {
        status: status ?? null,
        priority: priority ?? null,
        limit: limit ?? null,
      },
      missions: limited,
      totals: counts,
      recommendedLoadouts: limited.map((mission) => ({
        missionId: mission.id,
        emphasis:
          mission.priority === "high"
            ? ["Echo Shroud Mesh", "Pulse Forge Charges"]
            : ["Warp Sling Mk.III"],
      })),
    },
  };
}

function projectInventory({
  action,
  itemId,
  quantity,
  notes,
}: z.infer<typeof inventoryParser>) {
  const delta = action === "return" ? quantity : -quantity;
  const adjusted = inventoryLedger.map((item) =>
    item.id === itemId
      ? {
          ...item,
          quantity: Math.max(0, item.quantity + delta),
          status:
            action === "scrap"
              ? "maintenance"
              : action === "return"
              ? "staged"
              : item.status,
          notes: notes ?? item.notes,
        }
      : item
  );

  const totalUnits = adjusted.reduce((sum, item) => sum + item.quantity, 0);

  return {
    text: `Logged ${action} directive on ${itemId}.`,
    structuredContent: {
      view: "inventory",
      directive: {
        action,
        itemId,
        quantity,
        notes: notes ?? null,
        issuedAt: new Date().toISOString(),
      },
      inventory: adjusted,
      utilization: {
        totalTracked: totalUnits,
        staged: adjusted.filter((item) => item.status === "staged").length,
        deployed: adjusted.filter((item) => item.status === "deployed").length,
        maintenance: adjusted.filter((item) => item.status === "maintenance").length,
      },
    },
  };
}

function craftItinerary({
  origin,
  destination,
  priority,
  departure,
  payload,
}: z.infer<typeof travelParser>) {
  const preferredPriority = priority ?? "standard";
  const matchingSegments = travelNetwork.filter(
    (segment) =>
      segment.origin === origin || segment.destination === destination
  );

  const assembled = matchingSegments.slice(0, 2);

  const totalHours = assembled.reduce(
    (sum, segment) => sum + segment.typicalHours,
    preferredPriority === "express" ? -1 : 0
  );

  const computedDeparture = departure ?? new Date().toISOString();
  const arrival = new Date(computedDeparture);
  arrival.setHours(arrival.getHours() + Math.max(totalHours, 2));

  return {
    text: `Outlined ${preferredPriority} route from ${origin} to ${destination}.`,
    structuredContent: {
      view: "travel",
      itinerary: {
        origin,
        destination,
        priority: preferredPriority,
        departure: computedDeparture,
        eta: arrival.toISOString(),
        payload: payload ?? null,
        segments: assembled.map((segment) => ({
          id: segment.id,
          origin: segment.origin,
          destination: segment.destination,
          clearance: segment.clearance,
          conveyance: segment.conveyance,
          durationHours: segment.typicalHours,
          watchpoints: segment.bottlenecks,
        })),
      },
      advisories:
        preferredPriority === "stealth"
          ? [
              {
                type: "surveillance",
                message:
                  "Drone lattice density elevated over Nice Sky-lift between 02:00-03:30 UTC.",
              },
            ]
          : [
              {
                type: "weather",
                message:
                  "Camargue delta experiencing crosswinds; adjust delta skiff trim by 4°.",
              },
            ],
    },
  };
}

const toolDefinitions: ToolDefinition<any>[] = [
  {
    name: "les-coureurs.missions",
    title: "Brief Missions",
    description: "Compile an operational briefing for Les Coureurs missions.",
    widget: sharedWidget,
    inputSchema: missionInputSchema,
    parser: missionParser,
    handle: summarizeMissions,
  },
  {
    name: "les-coureurs.inventory",
    title: "Reconcile Inventory",
    description: "Apply directives to the Les Coureurs equipment ledger.",
    widget: sharedWidget,
    inputSchema: inventoryInputSchema,
    parser: inventoryParser,
    handle: projectInventory,
  },
  {
    name: "les-coureurs.travel",
    title: "Plan Travel",
    description: "Design a corridor itinerary for a Les Coureurs run.",
    widget: sharedWidget,
    inputSchema: travelInputSchema,
    parser: travelParser,
    handle: craftItinerary,
  },
];

const widgetByUri = new Map<string, LesCoureursWidget>();
widgetByUri.set(sharedWidget.templateUri, sharedWidget);

const resources: Resource[] = [
  {
    uri: sharedWidget.templateUri,
    name: sharedWidget.title,
    description: "LES COUREURS dashboard widget markup",
    mimeType: "text/html+skybridge",
    _meta: widgetMeta(sharedWidget),
  },
];

const resourceTemplates: ResourceTemplate[] = [
  {
    uriTemplate: sharedWidget.templateUri,
    name: sharedWidget.title,
    description: "LES COUREURS dashboard widget markup",
    mimeType: "text/html+skybridge",
    _meta: widgetMeta(sharedWidget),
  },
];

const tools: Tool[] = toolDefinitions.map((definition) => ({
  name: definition.name,
  description: definition.description,
  inputSchema: definition.inputSchema,
  title: definition.title,
  _meta: widgetMeta(definition.widget),
  annotations: {
    destructiveHint: false,
    openWorldHint: false,
    readOnlyHint: true,
  },
}));

function createLesCoureursServer(): Server {
  const server = new Server(
    {
      name: "les-coureurs-node",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  server.setRequestHandler(
    ListResourcesRequestSchema,
    async (_request: ListResourcesRequest) => ({
      resources,
    })
  );

  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request: ReadResourceRequest) => {
      const widget = widgetByUri.get(request.params.uri);

      if (!widget) {
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }

      return {
        contents: [
          {
            uri: widget.templateUri,
            mimeType: "text/html+skybridge",
            text: widget.html,
            _meta: widgetMeta(widget),
          },
        ],
      };
    }
  );

  server.setRequestHandler(
    ListResourceTemplatesRequestSchema,
    async (_request: ListResourceTemplatesRequest) => ({
      resourceTemplates,
    })
  );

  server.setRequestHandler(
    ListToolsRequestSchema,
    async (_request: ListToolsRequest) => ({
      tools,
    })
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      const definition = toolDefinitions.find(
        (tool) => tool.name === request.params.name
      );

      if (!definition) {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      const args = definition.parser.parse(request.params.arguments ?? {});
      const { text, structuredContent } = definition.handle(args);

      return {
        content: [
          {
            type: "text",
            text,
          },
        ],
        structuredContent,
        _meta: widgetMeta(definition.widget),
      };
    }
  );

  return server;
}

type SessionRecord = {
  server: Server;
  transport: SSEServerTransport;
};

const sessions = new Map<string, SessionRecord>();

const ssePath = "/mcp";
const postPath = "/mcp/messages";

async function handleSseRequest(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const server = createLesCoureursServer();
  const transport = new SSEServerTransport(postPath, res);
  const sessionId = transport.sessionId;

  sessions.set(sessionId, { server, transport });

  transport.onclose = async () => {
    sessions.delete(sessionId);
    await server.close();
  };

  transport.onerror = (error) => {
    console.error("SSE transport error", error);
  };

  try {
    await server.connect(transport);
  } catch (error) {
    sessions.delete(sessionId);
    console.error("Failed to start SSE session", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to establish SSE connection");
    }
  }
}

async function handlePostMessage(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    res.writeHead(400).end("Missing sessionId query parameter");
    return;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    res.writeHead(404).end("Unknown session");
    return;
  }

  try {
    await session.transport.handlePostMessage(req, res);
  } catch (error) {
    console.error("Failed to process message", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to process message");
    }
  }
}

const portEnv = Number(process.env.PORT ?? 8000);
const port = Number.isFinite(portEnv) ? portEnv : 8000;

const httpServer = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
      res.writeHead(400).end("Missing URL");
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    if (
      req.method === "OPTIONS" &&
      (url.pathname === ssePath || url.pathname === postPath)
    ) {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === ssePath) {
      await handleSseRequest(res);
      return;
    }

    if (req.method === "POST" && url.pathname === postPath) {
      await handlePostMessage(req, res, url);
      return;
    }

    res.writeHead(404).end("Not Found");
  }
);

httpServer.on("clientError", (err: Error, socket) => {
  console.error("HTTP client error", err);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

httpServer.listen(port, () => {
  console.log(`Les Coureurs MCP server listening on http://localhost:${port}`);
  console.log(`  SSE stream: GET http://localhost:${port}${ssePath}`);
  console.log(
    `  Message post endpoint: POST http://localhost:${port}${postPath}?sessionId=...`
  );
});