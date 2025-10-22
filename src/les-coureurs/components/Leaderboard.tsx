import type { FC } from "react";
import styles from "./Leaderboard.module.css";

export type LeaderboardEntry = {
  rank: number;
  crew: string;
  reputation: number;
  lastRun: string;
};

type LeaderboardProps = {
  entries: LeaderboardEntry[];
  playerEntry: LeaderboardEntry;
};

const Leaderboard: FC<LeaderboardProps> = ({ entries, playerEntry }) => {
  const roster = entries.some((entry) => entry.crew === playerEntry.crew)
    ? entries
    : [playerEntry, ...entries]
        .sort((a, b) => b.reputation - a.reputation)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <h2>Dispatch Leaderboard</h2>
        <p>Where the Coureurs swap bragging rights and cautionary tales.</p>
      </header>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Crew</th>
            <th scope="col">Reputation</th>
            <th scope="col">Last run</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((entry) => {
            const isPlayer = entry.crew === playerEntry.crew;
            return (
              <tr
                key={`${entry.rank}-${entry.crew}`}
                className={isPlayer ? styles.playerRow : undefined}
              >
                <td>{entry.rank}</td>
                <td>{entry.crew}</td>
                <td>{entry.reputation}</td>
                <td>{entry.lastRun}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
};

export default Leaderboard;