import type { FC } from "react";
import styles from "./InventoryPanel.module.css";

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  rarity: string;
  notes?: string;
};

type InventoryPanelProps = {
  inventory: InventoryItem[];
  credits: number;
};

const rarityColors: Record<string, string> = {
  common: "#94a3b8",
  uncommon: "#38bdf8",
  rare: "#818cf8",
  exotic: "#facc15",
};

const InventoryPanel: FC<InventoryPanelProps> = ({ inventory, credits }) => {
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <h2>Inventory Hold</h2>
        <div className={styles.summary}>
          <span>
            <strong>{totalItems}</strong> units on board
          </span>
          <span>
            <strong>{inventory.length}</strong> active cargo tags
          </span>
          <span>
            <strong>{credits}</strong> credits liquid
          </span>
        </div>
      </header>
      {inventory.length === 0 ? (
        <p className={styles.empty}>Cargo hold is clear. Time to pick up a contract.</p>
      ) : (
        <ul className={styles.list}>
          {inventory.map((item) => {
            const rarityColor = rarityColors[item.rarity.toLowerCase()] ?? "#38bdf8";
            return (
              <li key={item.id} className={styles.item}>
                <span
                  className={styles.rarity}
                  style={{ background: rarityColor }}
                />
                <div className={styles.itemDetails}>
                  <div className={styles.itemRow}>
                    <strong>{item.name}</strong>
                    <span className={styles.quantity}>×{item.quantity}</span>
                  </div>
                  {item.notes ? <p className={styles.notes}>{item.notes}</p> : null}
                </div>
                <span className={styles.tag}>{item.rarity}</span>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
};

export default InventoryPanel;