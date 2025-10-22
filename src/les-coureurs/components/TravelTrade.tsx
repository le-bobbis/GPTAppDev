import { useMemo, useState, type FC } from "react";
import type { InventoryItem } from "./InventoryPanel";
import styles from "./TravelTrade.module.css";

export type TravelRoute = {
  id: string;
  name: string;
  distance: string;
  risk: string;
  opportunity: string;
};

export type TradeOutcome = {
  routeId: string;
  profit: number;
  summary?: string;
  cargoDelta?: {
    id: string;
    name: string;
    quantityChange: number;
    rarity?: string;
    notes?: string;
  };
};

type TravelTradeProps = {
  routes: TravelRoute[];
  credits: number;
  inventory: InventoryItem[];
  onCompleteRun: (outcome: TradeOutcome) => void;
};

const cargoOptions = [
  {
    id: "silk",
    label: "Shimmer-Silk",
    rarity: "Exotic",
    notes: "Bundles glow as they catch star-lantern light.",
  },
  {
    id: "seals",
    label: "Charter Seals",
    rarity: "Common",
    notes: "Stamped contracts traded like currency in the fringe docks.",
  },
  {
    id: "maps",
    label: "Ion-etched Sky Maps",
    rarity: "Rare",
    notes: "Predictive storm charts etched with plasma.",
  },
];

const TravelTrade: FC<TravelTradeProps> = ({
  routes,
  credits,
  inventory,
  onCompleteRun,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    () => routes[0]?.id ?? ""
  );
  const [selectedCargo, setSelectedCargo] = useState(cargoOptions[0].id);
  const [tradeIntent, setTradeIntent] = useState<"buy" | "sell" | "scout">(
    "buy"
  );
  const [quantity, setQuantity] = useState(2);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? routes[0] ?? null,
    [routes, selectedRouteId]
  );

  const estimatedProfit = useMemo(() => {
    if (!selectedRoute) {
      return 0;
    }

    const base = selectedRoute.distance.includes("4") ? 320 : 180;
    const riskPremium = selectedRoute.risk.toLowerCase().includes("pirate")
      ? 140
      : selectedRoute.risk.toLowerCase().includes("storm")
      ? 110
      : 60;
    const tradeModifier = tradeIntent === "sell" ? 0.75 : tradeIntent === "buy" ? 1.1 : 0.4;
    return Math.round((base + riskPremium) * tradeModifier + quantity * 35);
  }, [selectedRoute, tradeIntent, quantity]);

  const handleExecute = () => {
    if (!selectedRoute) {
      return;
    }

    const cargo = cargoOptions.find((option) => option.id === selectedCargo);
    const summary = `Threaded the ${selectedRoute.name} run: ${selectedRoute.opportunity}`;

    const quantityChange = tradeIntent === "buy" ? quantity : tradeIntent === "sell" ? -quantity : 0;

    onCompleteRun({
      routeId: selectedRoute.id,
      profit: tradeIntent === "scout" ? Math.round(estimatedProfit * 0.5) : estimatedProfit,
      summary,
      cargoDelta:
        tradeIntent === "scout"
          ? undefined
          : {
              id: cargo?.id ?? "cargo",
              name: cargo?.label ?? "Cargo",
              quantityChange,
              rarity: cargo?.rarity,
              notes: cargo?.notes,
            },
    });
  };

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Travel &amp; Trade Routes</h2>
        <p className={styles.subtitle}>
          Plot a run, track heat, and keep the coffers flush. Credits on hand:
          <span className={styles.credits}> {credits}</span>
        </p>
      </header>

      <div className={styles.body}>
        <section className={styles.routes}>
          <h3>Available lanes</h3>
          <ul>
            {routes.map((route) => (
              <li key={route.id}>
                <button
                  type="button"
                  onClick={() => setSelectedRouteId(route.id)}
                  className={[
                    styles.routeButton,
                    route.id === selectedRoute?.id ? styles.routeButtonActive : "",
                  ].join(" ")}
                >
                  <div>
                    <strong>{route.name}</strong>
                    <p>{route.opportunity}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>Distance</dt>
                      <dd>{route.distance}</dd>
                    </div>
                    <div>
                      <dt>Risk</dt>
                      <dd>{route.risk}</dd>
                    </div>
                  </dl>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.trade}>
          <h3>Run manifest</h3>
          <label className={styles.field}>
            <span>Intent</span>
            <div className={styles.toggleGroup}>
              <button
                type="button"
                className={[
                  styles.toggle,
                  tradeIntent === "buy" ? styles.toggleActive : "",
                ].join(" ")}
                onClick={() => setTradeIntent("buy")}
              >
                Buy cargo
              </button>
              <button
                type="button"
                className={[
                  styles.toggle,
                  tradeIntent === "sell" ? styles.toggleActive : "",
                ].join(" ")}
                onClick={() => setTradeIntent("sell")}
              >
                Sell stock
              </button>
              <button
                type="button"
                className={[
                  styles.toggle,
                  tradeIntent === "scout" ? styles.toggleActive : "",
                ].join(" ")}
                onClick={() => setTradeIntent("scout")}
              >
                Scout lane
              </button>
            </div>
          </label>

          <label className={styles.field}>
            <span>Cargo focus</span>
            <select
              value={selectedCargo}
              onChange={(event) => setSelectedCargo(event.target.value)}
            >
              {cargoOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Manifest quantity</span>
            <input
              type="number"
              min={1}
              max={25}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value) || 1)}
            />
          </label>

          <div className={styles.estimates}>
            <p>
              Estimated profit: <strong>{estimatedProfit} credits</strong>
            </p>
            <p className={styles.inventoryHint}>
              Cargo hold currently carries {inventory.reduce((sum, item) => sum + item.quantity, 0)}
              {" "}
              units across {inventory.length} tags.
            </p>
          </div>

          <button type="button" className={styles.execute} onClick={handleExecute}>
            Commit Run
          </button>
        </section>
      </div>
    </article>
  );
};

export default TravelTrade;