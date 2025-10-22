import type { FC } from "react";
import styles from "./CharacterSheet.module.css";

type TravelHistoryEntry = {
  id: string;
  destination: string;
  summary: string;
  profit: number;
  timestamp: string;
};

export type CrewProfile = {
  callSign: string;
  captain: string;
  ship: string;
  specialty: string;
  origins: string;
  values: string[];
};

type CharacterSheetProps = {
  crew: CrewProfile;
  reputation: number;
  completedMissionIds: string[];
  travelHistory: TravelHistoryEntry[];
};

const CharacterSheet: FC<CharacterSheetProps> = ({
  crew,
  reputation,
  completedMissionIds,
  travelHistory,
}) => {
  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <h2>Character Sheet</h2>
        <span className={styles.callsign}>{crew.callSign}</span>
      </header>

      <section className={styles.section}>
        <h3>Captain</h3>
        <p>
          {crew.captain} — {crew.specialty}
        </p>
      </section>

      <section className={styles.section}>
        <h3>Ship</h3>
        <p>{crew.ship}</p>
      </section>

      <section className={styles.section}>
        <h3>Origins</h3>
        <p>{crew.origins}</p>
      </section>

      <section className={styles.section}>
        <h3>Values</h3>
        <ul>
          {crew.values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3>Standing</h3>
        <div className={styles.standingBadges}>
          <span className={styles.badge}>Reputation {reputation}</span>
          <span className={styles.badge}>
            Missions logged {completedMissionIds.length}
          </span>
        </div>
      </section>

      <section className={styles.section}>
        <h3>Recent Runs</h3>
        {travelHistory.length === 0 ? (
          <p className={styles.empty}>No runs logged yet — the crew is itching to fly.</p>
        ) : (
          <ul className={styles.history}>
            {travelHistory.slice(0, 3).map((entry) => (
              <li key={entry.id}>
                <strong>{entry.destination}</strong>
                <span>{formatTimestamp(entry.timestamp)}</span>
                <p>{entry.summary}</p>
                <span className={styles.profit}>{entry.profit} credits</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown cycle";
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default CharacterSheet;