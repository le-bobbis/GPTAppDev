// src/les-coureurs/App.tsx
import React, { JSX, useMemo, useState } from "react";

/** -----------------------------
 *  Local types (drop-in friendly)
 *  ----------------------------- */
type Mission = {
  id: string;
  title: string;
  difficulty: "Precarious" | "Dire" | "Bold" | string;
  locale: string;
  hook: string;
  description: string;
  phases: string[];
  rewards: { credits: number; reputation: number; items: string[] };
};

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  rarity: "Common" | "Uncommon" | "Rare" | "Exotic" | string;
  notes?: string;
};

type CrewProfile = {
  callSign: string;
  captain: string;
  ship: string;
  specialty: string;
  origins: string;
  values: string[];
};

type LeaderboardEntry = {
  rank: number;
  crew: string;
  reputation: number;
  lastRun: string;
};

type TravelRoute = {
  id: string;
  name: string;
  distance: string;
  risk: string;
  opportunity: string;
};

type TravelRecord = {
  origin: string;
  destination: string;
  summary: string;
  profit: number;
  timestamp: string;
};

type LesCoureursState = {
  selectedMissionId: string | null;
  missionStage: number;
  completedMissions: string[];
  credits: number;
  reputation: number;
  inventory: InventoryItem[];
  travelHistory: TravelRecord[];
  crew: CrewProfile;
};

type WidgetProps = {
  missions?: Mission[];
  leaderboard?: LeaderboardEntry[];
  crew?: CrewProfile;
};

/** -------------------------------------
 *  Minimal utility hooks (local shims)
 *  ------------------------------------- */
function useDisplayMode(): "full" | "compact" {
  // Replace with your app's actual responsive mode if available.
  return "full";
}

// Pretend the widget host can inject props; locally we just use defaults.
function useWidgetProps<T>(init: () => T): T {
  return useMemo(init, []); // no external props in this drop-in context
}

// State helper compatible with host/state sync; locally just React state.
function useWidgetState<T>(init: () => T): [T, (updater: Partial<T> | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(init);
  const update = (updater: Partial<T> | ((prev: T) => T)) => {
    setState((prev) => (typeof updater === "function" ? (updater as (p: T) => T)(prev) : { ...prev, ...updater }));
  };
  return [state, update];
}

/** -----------------------------
 *  Patched default content
 *  ----------------------------- */
const defaultMissions: Mission[] = [
  {
    id: "glass-tithe",
    title: "Le Dîme du Verre",
    difficulty: "Precarious",
    locale: "Les Verrières, sur la Loire Fendue",
    hook:
      "Slip past the Abbés du Soleil Noir to reclaim the Coalition des Lanternes' tithe before the salt fog reaches the kiln vaults.",
    description:
      "Les Verrières depend on stained glass tithed to the Lantern Coalition to keep their watch-fires burning. When the Abbés seized the convoy, they hid the crates beneath the collapsed nave. Recover the tithe without igniting the powder-damp ruins.",
    phases: [
      "Charm entry papers from the quartermaster at the Canal des Cendres.",
      "Shadow the abbé's beadledom through the nave and mark their patrol rhythm.",
      "Haul the glass crates through the crypt sluices before the rising fog curdles the air.",
      "Escort the wagon to the Lantern outpost on the ridge before dawn bells toll.",
    ],
    rewards: { credits: 340, reputation: 2, items: ["Lantern Coalition writ", "Stained glass tithe"] },
  },
  {
    id: "salt-barge",
    title: "La Barge des Salines",
    difficulty: "Dire",
    locale: "Port-Royal des Brumes",
    hook:
      "Ferry contraband well-casks upriver to the Bastion d'Étain while evading Mirecourt corsairs prowling the drowned quays.",
    description:
      "The Tin Bastion's cisterns are one bad week from running dry. The Bateliers de la Seine will pay handsomely if the cargo slips through Port-Royal without drawing the corsairs' swivel guns.",
    phases: [
      "Coax the rusted paddlewheel back to life with salvaged boiler rivets.",
      "Bribe the Quai des Brumes lookouts to misreport your departure.",
      "Navigate the salt-warped shallows while the corsairs loose grapples from the fog.",
      "Trade the casks at the Bastion gates for coin and a pledge of future escorts.",
    ],
    rewards: { credits: 560, reputation: 3, items: ["Bastion escort marker"] },
  },
  {
    id: "orchid-courier",
    title: "Message pour l'Orchidée",
    difficulty: "Bold",
    locale: "Citadelle de l'Orchidée Noire",
    hook:
      "Carry a truce charter between rival glassmaker guilds before the Ashen Choir convinces them to burn the greenhouses.",
    description:
      "The Fraternité des Verriers will only parley if the Coureurs deliver the charter intact and prove the Lantern Coalition stands behind it. Every hour the Ashen Choir preaches, more apprentices take up torches.",
    phases: [
      "Secure the charter seals within the Concordat archives at Montreuil.",
      "Ride the night stage through plague hamlets while ashfall drums the coach roof.",
      "Present the truce under the watch of the Orchidée matriarch and read the clauses aloud.",
      "Broker a joint vigil so the guild banners remain in the hall rather than on the pyres.",
    ],
    rewards: { credits: 420, reputation: 2, items: ["Orchidée signet"] },
  },
];

const defaultInventory: InventoryItem[] = [
  {
    id: "lantern-maps",
    name: "Cartes aux Lanternes",
    quantity: 4,
    rarity: "Rare",
    notes: "Hand-inked routes noting every standing beacon between Port-Royal and Montreuil.",
  },
  {
    id: "telegraph-ciphers",
    name: "Chiffres télégraphiques",
    quantity: 6,
    rarity: "Uncommon",
    notes: "Copper plates for encoding dispatches along the shattered optical lines.",
  },
  {
    id: "mercury-poultice",
    name: "Cataplasmes au mercure",
    quantity: 9,
    rarity: "Exotic",
    notes: "Treats fog-burn lungs after a run through the salt marshes.",
  },
];

const defaultCrew: CrewProfile = {
  callSign: "Courriers du Levant",
  captain: "Capitaine Éloise Marceau",
  ship: "Allège Sainte-Bernadette",
  specialty: "Conductrice des canaux, l'esprit aussi affûté que son sabre-briquet.",
  origins:
    "Ancienne messagère impériale, rescapée des brasiers de la Seine, elle relie désormais les bastions alliés.",
  values: [
    "La parole donnée vaut plus que l'or",
    "Protéger les phares de la Coalition des Lanternes",
    "Jamais abandonner un village aux brumes",
  ],
};

const defaultLeaderboard: LeaderboardEntry[] = [
  { rank: 1, crew: "House Briar Couriers", reputation: 18, lastRun: "Escorted the Dawnlight convoy" },
  { rank: 2, crew: "Velvet Signal", reputation: 16, lastRun: "Intercepted Synod tax collectors" },
  { rank: 3, crew: "Caravan of Embers", reputation: 15, lastRun: "Smuggled desal pods to Dawnmarket" },
];

const travelRoutes: TravelRoute[] = [
  {
    id: "canal-brume",
    name: "Canal des Brumes",
    distance: "2 jours",
    risk: "Patrouilles corsaires embusquées sous la brume salée",
    opportunity: "Troquer des vivres séchés contre des briques de charbon à Port-Royal",
  },
  {
    id: "route-lanterne",
    name: "Route des Lanternes",
    distance: "3 jours",
    risk: "Postes de péage levés par les Abbés du Soleil Noir",
    opportunity: "Gagner des faveurs en escortant les pèlerins jusqu'à la Citadelle d'Étain",
  },
  {
    id: "col-cendre",
    name: "Col des Cendres",
    distance: "4 jours",
    risk: "Éboulements et messagers de l'Ashen Choir qui sèment la panique",
    opportunity: "Revendre du verre soufflé aux verriers de Montreuil à prix double",
  },
];

/** -----------------------------
 *  UI Components
 *  ----------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ margin: "12px 0", fontSize: 18 }}>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function MissionCard({
  mission,
  active,
  onSelect,
  stage,
}: {
  mission: Mission;
  active: boolean;
  onSelect: () => void;
  stage: number;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        border: active ? "2px solid #222" : "1px solid #ccc",
        borderRadius: 10,
        padding: 12,
        cursor: "pointer",
        background: active ? "#fafafa" : "white",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <strong>{mission.title}</strong>
        <span title="difficulty">{mission.difficulty}</span>
      </div>
      <small style={{ color: "#555" }}>{mission.locale}</small>
      <p style={{ marginTop: 8 }}>{mission.hook}</p>
      {active && (
        <>
          <ol style={{ paddingLeft: 18, marginTop: 8 }}>
            {mission.phases.map((p, i) => (
              <li key={i} style={{ opacity: i < stage ? 0.5 : 1 }}>
                {p}
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 8 }}>
            <em>Rewards:</em>{" "}
            <span>
              {mission.rewards.credits} cr, +{mission.rewards.reputation} rep, {mission.rewards.items.join(", ")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/** -----------------------------
 *  Main App
 *  ----------------------------- */
export function LesCoureursApp(): JSX.Element {
  const displayMode = useDisplayMode();
  const props = useWidgetProps<WidgetProps>(() => ({
    missions: defaultMissions,
    leaderboard: defaultLeaderboard,
    crew: defaultCrew,
  }));

  const missions = props.missions?.length ? props.missions : defaultMissions;
  const leaderboardEntries = props.leaderboard?.length ? props.leaderboard : defaultLeaderboard;
  const crewProfile = props.crew ?? defaultCrew;

  const [state, setState] = useWidgetState<LesCoureursState>(() => ({
    selectedMissionId: missions[0]?.id ?? null,
    missionStage: 0,
    completedMissions: [],
    credits: 1240,
    reputation: 12,
    inventory: defaultInventory,
    travelHistory: [],
    crew: crewProfile,
  }));

  const selected = missions.find((m) => m.id === state.selectedMissionId) ?? missions[0];

  function advanceStage() {
    if (!selected) return;
    const next = Math.min(state.missionStage + 1, selected.phases.length);
    // If mission completed, record travel/profit history as a simple example.
    if (next === selected.phases.length) {
      setState((prev) => ({
        ...prev,
        missionStage: 0,
        completedMissions: [...prev.completedMissions, selected.id],
        credits: prev.credits + selected.rewards.credits,
        reputation: prev.reputation + selected.rewards.reputation,
        travelHistory: [
          ...prev.travelHistory,
          {
            origin: "Divers",
            destination: selected.locale,
            summary: `Completed: ${selected.title}`,
            profit: selected.rewards.credits,
            timestamp: new Date().toISOString(),
          },
        ],
        inventory: [
          ...prev.inventory,
          ...selected.rewards.items.map<InventoryItem>((nm, idx) => ({
            id: `${selected.id}-item-${idx}`,
            name: nm,
            quantity: 1,
            rarity: "Common",
          })),
        ],
      }));
    } else {
      setState({ missionStage: next });
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16, lineHeight: 1.35 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>LES COUREURS — Tableau de Bord</h1>
        <div title="display-mode" style={{ color: "#666" }}>
          {displayMode === "full" ? "Mode: complet" : "Mode: compact"}
        </div>
      </header>

      <Section title="Équipage">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <strong>{state.crew.callSign}</strong> — {state.crew.captain}
            <div style={{ color: "#444" }}>{state.crew.ship}</div>
            <div style={{ marginTop: 6 }}>{state.crew.specialty}</div>
            <small style={{ color: "#555" }}>{state.crew.origins}</small>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {state.crew.values.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Missions">
        {missions.map((m) => (
          <MissionCard
            key={m.id}
            mission={m}
            active={m.id === selected?.id}
            stage={m.id === selected?.id ? state.missionStage : 0}
            onSelect={() =>
              setState({
                selectedMissionId: m.id,
                missionStage: 0,
              })
            }
          />
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={advanceStage} style={{ padding: "8px 12px", borderRadius: 8 }}>
            {state.missionStage >= (selected?.phases.length ?? 1) - 1 ? "Terminer" : "Avancer l'étape"}
          </button>
          <div style={{ alignSelf: "center", color: "#333" }}>
            Étape: {Math.min(state.missionStage + 1, selected?.phases.length ?? 1)} / {selected?.phases.length ?? 1}
          </div>
        </div>
      </Section>

      <Section title="Inventaire">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {state.inventory.map((it) => (
            <div key={it.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
              <strong>{it.name}</strong>
              <div>
                Qté: {it.quantity} • <em>{it.rarity}</em>
              </div>
              {it.notes && <small style={{ color: "#555" }}>{it.notes}</small>}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Itinéraires">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
          {travelRoutes.map((r) => (
            <div key={r.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
              <strong>{r.name}</strong> <small>• {r.distance}</small>
              <div style={{ marginTop: 6 }}>
                <em>Risque:</em> {r.risk}
              </div>
              <div>
                <em>Opportunité:</em> {r.opportunity}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Classement">
        <ol style={{ paddingLeft: 18, margin: 0 }}>
          {leaderboardEntries.map((e) => (
            <li key={e.rank} style={{ marginBottom: 6 }}>
              <strong>#{e.rank}</strong> {e.crew} — rep {e.reputation} <small>({e.lastRun})</small>
            </li>
          ))}
        </ol>
      </Section>

      <footer style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 8, borderTop: "1px solid #eee" }}>
        <div>
          <strong>Crédits:</strong> {state.credits}
        </div>
        <div>
          <strong>Réputation:</strong> {state.reputation}
        </div>
        <div>
          <strong>Missions accomplies:</strong> {state.completedMissions.length}
        </div>
      </footer>
    </div>
  );
}

export default LesCoureursApp;
