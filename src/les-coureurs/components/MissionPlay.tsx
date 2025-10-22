import type { FC } from "react";
import type { Mission } from "./MissionSelection";
import styles from "./MissionPlay.module.css";

type MissionPlayProps = {
  mission: Mission | null;
  stage: number;
  onAdvanceStage: () => void;
  onResetStage: () => void;
};

const MissionPlay: FC<MissionPlayProps> = ({
  mission,
  stage,
  onAdvanceStage,
  onResetStage,
}) => {
  if (!mission) {
    return (
      <article className={styles.empty}>
        <p>
          Select a mission to review live briefs, tactical beats, and crew-ready
          prompts.
        </p>
      </article>
    );
  }

  const isComplete = stage >= mission.phases.length;

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{mission.title}</h2>
          <p className={styles.locale}>{mission.locale}</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onResetStage}>
            Restart Briefing
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={onAdvanceStage}
          >
            {isComplete ? "Log Completion" : "Advance Scene"}
          </button>
        </div>
      </header>

      <section className={styles.timeline}>
        <h3 className={styles.timelineHeading}>Mission Phases</h3>
        <ol className={styles.phaseList}>
          {mission.phases.map((phase, index) => {
            const position = index + 1;
            const isActive = index === stage;
            const isPassed = position <= stage;
            return (
              <li
                key={phase}
                className={[
                  styles.phase,
                  isActive ? styles.phaseActive : "",
                  isPassed ? styles.phasePassed : "",
                ].join(" ")}
              >
                <span className={styles.phaseNumber}>{position}</span>
                <p className={styles.phaseText}>{phase}</p>
              </li>
            );
          })}
          {isComplete ? (
            <li className={[styles.phase, styles.phaseComplete].join(" ")}>
              <span className={styles.phaseNumber}>✓</span>
              <p className={styles.phaseText}>
                Mission logged. Debrief the crew and distribute the spoils.
              </p>
            </li>
          ) : null}
        </ol>
      </section>

      <footer className={styles.rewards}>
        <h3>Rewards on Completion</h3>
        <ul>
          <li>
            <strong>{mission.rewards.credits} credits</strong> wired to the crew
            fund.
          </li>
          <li>
            <strong>+{mission.rewards.reputation} reputation</strong> with Coureur
            cells.
          </li>
          {mission.rewards.items?.map((item) => (
            <li key={item}>
              Cargo tag: <strong>{item}</strong>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
};

export default MissionPlay;