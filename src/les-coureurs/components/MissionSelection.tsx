import type { FC } from "react";
import styles from "./MissionSelection.module.css";

export type Mission = {
  id: string;
  title: string;
  difficulty: string;
  locale: string;
  hook: string;
  description: string;
  phases: string[];
  rewards: {
    credits: number;
    reputation: number;
    items?: string[];
  };
};

type MissionSelectionProps = {
  missions: Mission[];
  selectedMissionId: string | null;
  completedMissionIds: string[];
  onSelectMission: (missionId: string) => void;
};

const MissionSelection: FC<MissionSelectionProps> = ({
  missions,
  selectedMissionId,
  completedMissionIds,
  onSelectMission,
}) => {
  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Mission Ledger</h2>
        <p className={styles.tagline}>
          Choose the next story the Fringe will whisper about.
        </p>
      </header>
      <ul className={styles.list}>
        {missions.map((mission) => {
          const isActive = mission.id === selectedMissionId;
          const isComplete = completedMissionIds.includes(mission.id);
          return (
            <li key={mission.id}>
              <button
                type="button"
                className={[
                  styles.card,
                  isActive ? styles.cardActive : "",
                  isComplete ? styles.cardComplete : "",
                ].join(" ")}
                onClick={() => onSelectMission(mission.id)}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.missionTitle}>{mission.title}</h3>
                    <p className={styles.missionHook}>{mission.hook}</p>
                  </div>
                  <span className={styles.badge}>{mission.difficulty}</span>
                </div>
                <dl className={styles.meta}>
                  <div>
                    <dt>Locale</dt>
                    <dd>{mission.locale}</dd>
                  </div>
                  <div>
                    <dt>Reputation</dt>
                    <dd>+{mission.rewards.reputation}</dd>
                  </div>
                  <div>
                    <dt>Credits</dt>
                    <dd>{mission.rewards.credits}</dd>
                  </div>
                </dl>
                {isComplete ? (
                  <p className={styles.completeNote}>
                    Logged in the Dispatch archive. The crew still reminisces about
                    this run.
                  </p>
                ) : (
                  <p className={styles.description}>{mission.description}</p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
};

export default MissionSelection;