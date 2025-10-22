import { useCallback, useMemo, type JSX } from "react";
import { useDisplayMode } from "../use-display-mode";
import { useWidgetProps } from "../use-widget-props";
import { useWidgetState } from "../use-widget-state";
import MissionSelection, {
  type Mission,
} from "./components/MissionSelection";
import MissionPlay from "./components/MissionPlay";
import TravelTrade, {
  type TravelRoute,
  type TradeOutcome,
} from "./components/TravelTrade";
import InventoryPanel, {
  type InventoryItem,
} from "./components/InventoryPanel";
import CharacterSheet, {
  type CrewProfile,
} from "./components/CharacterSheet";
import Leaderboard, {
  type LeaderboardEntry,
} from "./components/Leaderboard";
import styles from "./App.module.css";

type TravelRecord = {
  id: string;
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

const defaultMissions: Mission[] = [
  {
    id: "radiant-auction",
    title: "The Radiant Auction",
    difficulty: "Calculated",
    locale: "The Prism Exchange, Vega Spindle",
    hook:
      "Slip into the invitation-only art auction and walk out with a forbidden holo-icon before the clergy notices.",
    description:
      "A collector loyal to the Synod is showing off a relic they confiscated from the Coureurs. The crew must infiltrate the auction, swap the relic, and exfiltrate without triggering the zero-airlock lockdown.",
    phases: [
      "Secure forged invitations and decode the guest registry.",
      "Blend into the bidding floor while your ghost-hacker spoofs surveillance.",
      "Make the swap in the reliquary and slip the mark onto the rival broker.",
      "Evade Synod hunters through the habitat's mirrored maintenance shafts.",
    ],
    rewards: {
      credits: 620,
      reputation: 2,
      items: ["Synod cipher key", "Holo-icon replica"],
    },
  },
  {
    id: "salt-market",
    title: "Letters of Salt",
    difficulty: "Perilous",
    locale: "Tide-locked moon of Cordelière",
    hook:
      "Deliver contraband desalination schematics to miners before the governor's embargo locks down the docks.",
    description:
      "The mining guild is starving for fresh water. The Coureurs can break the embargo if they outfly the patrol skiffs and broker peace between rival crews long enough to hand off the plans.",
    phases: [
      "Chart a slipstream through the governor's blockade.",
      "Broker a ceasefire between the Ember and Jade crews at the docks.",
      "Upload the schematics to the miners' fabrication lattice before the signal jammers sweep back.",
      "Exit with the guild's gratitude and keep your own ship off the sanction list.",
    ],
    rewards: {
      credits: 800,
      reputation: 3,
      items: ["Guild promissory note"],
    },
  },
  {
    id: "luminous-caravan",
    title: "Luminous Caravan",
    difficulty: "Daring",
    locale: "Auroral skyways of the Roche Briar",
    hook:
      "Escort a caravan of shimmer-silk skiffs through ion storms while a rival captain tries to poach your clients.",
    description:
      "Pilots loyal to House Briar need a Coureurs escort to outrun storm fronts and sabotage attempts. Keep morale high, fend off interceptors, and deliver every skiff intact for a premium bonus.",
    phases: [
      "Map the safest skyway currents and patch the lead skiff's ion sails.",
      "Counter a rival captain's sabotage drones mid-flight.",
      "Rally the caravan through the green-fire tempest and redistribute power across the flotilla.",
      "Hand off the goods at Dawnspear and collect the surcharge for every intact skiff.",
    ],
    rewards: {
      credits: 540,
      reputation: 1,
      items: ["Briar signet"],
    },
  },
];

const defaultInventory: InventoryItem[] = [
  {
    id: "sky-maps",
    name: "Ion-etched Sky Maps",
    quantity: 3,
    rarity: "Rare",
    notes: "Folded charts that shimmer with predictive storm vectors.",
  },
  {
    id: "trade-seals",
    name: "Charter Seals",
    quantity: 5,
    rarity: "Common",
    notes: "Stamped contracts granting safe passage through neutral docks.",
  },
  {
    id: "silk-strands",
    name: "Shimmer-Silk Strands",
    quantity: 12,
    rarity: "Exotic",
    notes: "Luminescent threads traded as favors among Coureurs cells.",
  },
];

const defaultCrew: CrewProfile = {
  callSign: "Les Courants",
  captain: "Maëlys Verdin",
  ship: "Sloop Perseidae",
  specialty: "Negotiator-pilot blending charm with reckless drift dives.",
  origins: "Once a Synod courier, now the broker who keeps wayward crews fed and free.",
  values: ["Mutual aid over conquest", "Stories as currency", "Every escape is a performance"],
};

const defaultLeaderboard: LeaderboardEntry[] = [
  { rank: 1, crew: "House Briar Couriers", reputation: 18, lastRun: "Escorted the Dawnlight convoy" },
  { rank: 2, crew: "Velvet Signal", reputation: 16, lastRun: "Intercepted Synod tax collectors" },
  { rank: 3, crew: "Caravan of Embers", reputation: 15, lastRun: "Smuggled desal pods to Dawnmarket" },
];

const travelRoutes: TravelRoute[] = [
  {
    id: "mirrors",
    name: "Mirrorfields Run",
    distance: "2 jumps",
    risk: "Low heat, high sensor noise",
    opportunity: "Swap luxury goods in refraction markets",
  },
  {
    id: "drift",
    name: "Drift Hollows",
    distance: "4 jumps",
    risk: "Pirate activity spikes at dusk-cycle",
    opportunity: "Acquire outlaw tech components on the cheap",
  },
  {
    id: "braids",
    name: "Braided Spires",
    distance: "3 jumps",
    risk: "Ion storms require precision flying",
    opportunity: "House Briar buyers pay double for shimmer-silk",
  },
];

export function LesCoureursApp(): JSX.Element {
  const displayMode = useDisplayMode();
  const props = useWidgetProps<WidgetProps>(() => ({
    missions: defaultMissions,
    leaderboard: defaultLeaderboard,
    crew: defaultCrew,
  }));

  const missions = props.missions?.length ? props.missions : defaultMissions;
  const leaderboardEntries = props.leaderboard?.length
    ? props.leaderboard
    : defaultLeaderboard;
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

  const selectedMission = useMemo(() => {
    return missions.find((mission) => mission.id === state?.selectedMissionId) ?? null;
  }, [missions, state?.selectedMissionId]);

  const handleSelectMission = useCallback(
    (missionId: string) => {
      setState((prevState) => {
        if (!prevState) {
          return prevState;
        }

        return {
          ...prevState,
          selectedMissionId: missionId,
          missionStage: 0,
        };
      });
    },
    [setState]
  );

  const handleAdvanceMission = useCallback(() => {
    if (!selectedMission) {
      return;
    }

    setState((prevState) => {
      if (!prevState) {
        return prevState;
      }

      const nextStage = Math.min(
        prevState.missionStage + 1,
        selectedMission.phases.length
      );

      const missionCompleted = nextStage >= selectedMission.phases.length;

      const updatedInventory = missionCompleted && selectedMission.rewards.items
        ? mergeInventory(prevState.inventory, selectedMission.rewards.items)
        : prevState.inventory;

      return {
        ...prevState,
        missionStage: nextStage,
        completedMissions: missionCompleted
          ? Array.from(new Set([...prevState.completedMissions, selectedMission.id]))
          : prevState.completedMissions,
        credits: missionCompleted
          ? prevState.credits + selectedMission.rewards.credits
          : prevState.credits,
        reputation: missionCompleted
          ? prevState.reputation + selectedMission.rewards.reputation
          : prevState.reputation,
        inventory: updatedInventory,
      };
    });
  }, [selectedMission, setState]);

  const handleResetMission = useCallback(() => {
    setState((prevState) => {
      if (!prevState) {
        return prevState;
      }

      return {
        ...prevState,
        missionStage: 0,
      };
    });
  }, [setState]);

  const handleCompleteRoute = useCallback(
    ({ routeId, profit, summary, cargoDelta }: TradeOutcome) => {
      const route = travelRoutes.find((candidate) => candidate.id === routeId);

      setState((prevState) => {
        if (!prevState) {
          return prevState;
        }

        const updatedInventory = cargoDelta
          ? adjustInventory(prevState.inventory, cargoDelta)
          : prevState.inventory;

        const record: TravelRecord = {
          id: `${routeId}-${Date.now()}`,
          destination: route?.name ?? routeId,
          summary: summary ?? (route ? route.opportunity : ""),
          profit,
          timestamp: new Date().toISOString(),
        };

        const nextHistory = [record, ...prevState.travelHistory].slice(0, 6);

        return {
          ...prevState,
          credits: prevState.credits + profit,
          reputation: profit > 0 ? prevState.reputation + 1 : prevState.reputation,
          inventory: updatedInventory,
          travelHistory: nextHistory,
        };
      });
    },
    [setState]
  );

  const playerLeaderboardEntry = useMemo<LeaderboardEntry>(() => {
    return {
      rank: 0,
      crew: crewProfile.callSign,
      reputation: state?.reputation ?? 0,
      lastRun:
        state?.travelHistory?.[0]?.summary ?? "Planning the next daring courier run",
    };
  }, [crewProfile.callSign, state?.reputation, state?.travelHistory]);

  return (
    <div
      className={[
        styles.app,
        displayMode === "fullscreen" ? styles.fullscreen : styles.inline,
      ].join(" ")}
    >
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Les Coureurs Dispatch</h1>
          <p className={styles.subtitle}>
            Courier crews swapping secrets, credits, and stories across the fringe.
          </p>
        </div>
        <div className={styles.statusPanel}>
          <span className={styles.statusItem}>
            <strong>Credits</strong>
            <span>{state?.credits ?? 0}</span>
          </span>
          <span className={styles.statusItem}>
            <strong>Reputation</strong>
            <span>{state?.reputation ?? 0}</span>
          </span>
        </div>
      </header>

      <section className={styles.missionRow}>
        <MissionSelection
          missions={missions}
          selectedMissionId={state?.selectedMissionId ?? null}
          onSelectMission={handleSelectMission}
          completedMissionIds={state?.completedMissions ?? []}
        />
        <MissionPlay
          mission={selectedMission}
          stage={state?.missionStage ?? 0}
          onAdvanceStage={handleAdvanceMission}
          onResetStage={handleResetMission}
        />
      </section>

      <section className={styles.grid}>
        <TravelTrade
          routes={travelRoutes}
          credits={state?.credits ?? 0}
          inventory={state?.inventory ?? []}
          onCompleteRun={handleCompleteRoute}
        />
        <InventoryPanel inventory={state?.inventory ?? []} credits={state?.credits ?? 0} />
        <CharacterSheet
          crew={state?.crew ?? crewProfile}
          reputation={state?.reputation ?? 0}
          completedMissionIds={state?.completedMissions ?? []}
          travelHistory={state?.travelHistory ?? []}
        />
        <Leaderboard
          entries={leaderboardEntries}
          playerEntry={playerLeaderboardEntry}
        />
      </section>
    </div>
  );
}

function mergeInventory(
  inventory: InventoryItem[],
  newItems: string[]
): InventoryItem[] {
  const inventoryMap = new Map(inventory.map((item) => [item.name, { ...item }]));

  newItems.forEach((itemName) => {
    if (inventoryMap.has(itemName)) {
      const existing = inventoryMap.get(itemName)!;
      inventoryMap.set(itemName, { ...existing, quantity: existing.quantity + 1 });
    } else {
      inventoryMap.set(itemName, {
        id: itemName.toLowerCase().replace(/\s+/g, "-"),
        name: itemName,
        quantity: 1,
        rarity: "Uncommon",
        notes: "Fresh haul from a successful mission.",
      });
    }
  });

  return Array.from(inventoryMap.values());
}

function adjustInventory(
  inventory: InventoryItem[],
  delta: TradeOutcome["cargoDelta"]
): InventoryItem[] {
  if (!delta) {
    return inventory;
  }

  const inventoryMap = new Map(inventory.map((item) => [item.id, { ...item }]));
  const { id, name, quantityChange, rarity, notes } = delta;
  const existing = inventoryMap.get(id);

  if (existing) {
    const updatedQuantity = Math.max(existing.quantity + quantityChange, 0);
    if (updatedQuantity === 0) {
      inventoryMap.delete(id);
    } else {
      inventoryMap.set(id, { ...existing, quantity: updatedQuantity });
    }
  } else if (quantityChange > 0) {
    inventoryMap.set(id, {
      id,
      name,
      quantity: quantityChange,
      rarity: rarity ?? "Common",
      notes: notes ?? "Freshly acquired on the last run.",
    });
  }

  return Array.from(inventoryMap.values());
}

export default LesCoureursApp;