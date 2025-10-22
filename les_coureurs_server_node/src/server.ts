// les_coureurs_server_node/src/server.ts

import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Minimal widget type used by the control UI.
 * If your project already exports this elsewhere, remove this local copy and import it instead.
 */
export type LesCoureursWidget = {
  id: string;
  title: string;
  templateUri: string; // e.g., "ui://widget/les-coureurs.html"
  invoking: string;
  invoked: string;
  html: string;
};

/**
 * Utility to load widget HTML. Adjust the baseDir if your assets live elsewhere.
 * If your project already provides readWidgetHtml(), remove this and import that version.
 */
function readWidgetHtml(widgetName: string): string {
  try {
    const baseDir = path.resolve(process.cwd(), "ui", "widget");
    const filePath = path.join(baseDir, `${widgetName}.html`);
    return fs.readFileSync(filePath, "utf8");
  } catch {
    // Non-fatal: return empty string if the file isn't found in this context.
    return "";
  }
}

export const sharedWidget: LesCoureursWidget = {
  id: "les-coureurs-control",
  title: "LES COUREURS Control",
  templateUri: "ui://widget/les-coureurs.html",
  invoking: "Compiling Les Coureurs telemetry",
  invoked: "Les Coureurs dashboard ready",
  html: readWidgetHtml("les-coureurs"),
};

// -------------------------------
// Domain models
// -------------------------------

export type MissionStatus = "available" | "active" | "completed";
export type MissionPriority = "low" | "moderate" | "high";

export type MissionRecord = {
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

export const missionCatalog: MissionRecord[] = [
  {
    id: "glass-tithe",
    codename: "Dîme du Verre",
    summary:
      "Slip through the shattered nave at Les Verrières and reclaim the Lantern Coalition's stained-glass tithe before the salt fog spoils it.",
    status: "active",
    priority: "high",
    region: "Les Verrières",
    reward: { credits: 340, favors: ["Lantern safe-conduct"] },
    window: {
      start: "1848-10-21T04:30:00Z",
      end: "1848-10-21T23:00:00Z",
    },
    specialists: ["Charretier Luc", "Sœur Alizée"],
    tags: ["recovery", "stealth"],
  },
  {
    id: "salt-barge",
    codename: "Barge des Salines",
    summary:
      "Ferry well-casks upriver from Port-Royal des Brumes to the Bastion d'Étain while Mirecourt corsairs stalk the fog banks.",
    status: "available",
    priority: "high",
    region: "Loire Brisée",
    reward: { credits: 560, favors: ["Bastion escort marker"] },
    window: {
      start: "1848-10-24T18:00:00Z",
      end: "1848-10-25T07:00:00Z",
    },
    specialists: ["Pilote Vinh", "Chaudronnière Mireille"],
    tags: ["escort", "logistics"],
  },
  {
    id: "orchid-charter",
    codename: "Charte de l'Orchidée",
    summary:
      "Carry a truce charter between rival glassmaker guilds before the Ashen Choir lights the Citadelle de l'Orchidée Noire ablaze.",
    status: "available",
    priority: "moderate",
    region: "Montreuil Bastion",
    reward: { credits: 420, favors: ["Orchidée signet"] },
    window: {
      start: "1848-10-22T20:00:00Z",
      end: "1848-10-23T12:00:00Z",
    },
    specialists: ["Archiviste Honoré", "Messagère Éloise"],
    tags: ["diplomacy", "parley"],
  },
  {
    id: "cinder-pass",
    codename: "Col des Cendres",
    summary:
      "Reopen the ash-choked pass to Montreuil by clearing fallen masonry and dispersing Ashen Choir agitators before the winter caravans arrive.",
    status: "completed",
    priority: "moderate",
    region: "Haute-Bourgogne",
    reward: { credits: 310 },
    window: {
      start: "1848-10-12T05:00:00Z",
      end: "1848-10-12T17:00:00Z",
    },
    specialists: ["Piqueur Baptiste", "Veilleur Solenne"],
    tags: ["infrastructure", "security"],
  },
];

export type InventoryItem = {
  id: string;
  label: string;
  category: string;
  status: "staged" | "deployed" | "maintenance";
  quantity: number;
  unit: string;
  notes?: string;
};

export const inventoryLedger: InventoryItem[] = [
  {
    id: "lantern-maps",
    label: "Cartes aux Lanternes",
    category: "Cartographie",
    status: "staged",
    quantity: 4,
    unit: "folios",
    notes: "Tracés mis à jour après l'éboulement du Col des Cendres",
  },
  {
    id: "telegraph-ciphers",
    label: "Chiffres télégraphiques",
    category: "Communications",
    status: "deployed",
    quantity: 6,
    unit: "plaques",
    notes: "Prêtés à la vigie de Port-Royal jusqu'à la fin de la semaine",
  },
  {
    id: "mercury-poultice",
    label: "Cataplasmes au mercure",
    category: "Soins",
    status: "staged",
    quantity: 9,
    unit: "rouleaux",
    notes: "Conserver au frais dans la glacière du bastion",
  },
  {
    id: "charter-seals",
    label: "Sceaux de charte",
    category: "Diplomatie",
    status: "maintenance",
    quantity: 7,
    unit: "étuis",
    notes: "Réencerclés avec de la cire d'abeille du Clos Saint-Brie",
  },
];

export type TravelCorridor = {
  id: string;
  origin: string;
  destination: string;
  clearance: "standard" | "express" | "shadow";
  typicalHours: number;
  bottlenecks: string[];
  conveyance: string;
};

export const travelNetwork: TravelCorridor[] = [
  {
    id: "port-royal-to-bastion",
    origin: "Port-Royal des Brumes",
    destination: "Bastion d'Étain",
    clearance: "shadow",
    typicalHours: 48,
    bottlenecks: ["Corsaires de Mirecourt", "Barrage flottant des Abbés"],
    conveyance: "Barge à aubes blindée",
  },
  {
    id: "montreuil-to-verrieres",
    origin: "Montreuil Bastion",
    destination: "Les Verrières",
    clearance: "express",
    typicalHours: 36,
    bottlenecks: ["Pont effondré du Val d'Or", "Poste des Lanternes"],
    conveyance: "Diligence nocturne sous escorte",
  },
  {
    id: "citadelle-to-port-royal",
    origin: "Citadelle de l'Orchidée Noire",
    destination: "Port-Royal des Brumes",
    clearance: "standard",
    typicalHours: 72,
    bottlenecks: ["Prêches de la Chorale de Cendre", "Coulées de boue"],
    conveyance: "Caravane de mulets et gabarres",
  },
];

// Lightweight JSON-Schema object for mission list filtering (kept `as const` to preserve literal types)
export const missionInputSchema = {
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

// -------------------------------------
// Example exported API for consumers
// -------------------------------------

export function listMissions(filter?: {
  status?: MissionStatus;
  priority?: MissionPriority;
  limit?: number;
}): MissionRecord[] {
  let results = missionCatalog.slice();
  if (filter?.status) results = results.filter((m) => m.status === filter.status);
  if (filter?.priority) results = results.filter((m) => m.priority === filter.priority);
  if (filter?.limit && filter.limit > 0) results = results.slice(0, filter.limit);
  return results;
}

export function getInventory(): InventoryItem[] {
  return inventoryLedger;
}

export function getTravelNetwork(): TravelCorridor[] {
  return travelNetwork;
}

export default {
  sharedWidget,
  listMissions,
  getInventory,
  getTravelNetwork,
  missionInputSchema,
};
