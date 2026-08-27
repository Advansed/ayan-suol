import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { CargoInfo, CargoStatus } from '../../../Store/cargoStore';
import {
  CARGO_STATUS_SHORT,
  getCargoProgressSlots,
  resolveCargoProgressStatus,
} from '../cargoStatusFlow';
import styles from './CargoStatusTimeline.module.css';

type CargoStatusTimelineProps = {
  cargo: CargoInfo;
};

export const CargoStatusTimeline: React.FC<CargoStatusTimelineProps> = ({ cargo }) => {
  const current = resolveCargoProgressStatus(cargo);
  const isProblems = current === CargoStatus.PROBLEMS;
  const slots = isProblems ? [] : getCargoProgressSlots(current);

  return (
    <section className={styles.wrap} aria-label="Статус рейса">
      <div className={styles.head}>
        <p className={styles.title}>Статус рейса</p>
        {!isProblems && (
          <span className={styles.pill}>{CARGO_STATUS_SHORT[current] || current}</span>
        )}
      </div>

      {isProblems ? (
        <div className={styles.rejectedBanner}>
          <AlertTriangle size={16} strokeWidth={2} />
          <span>По заявке зафиксирован внештатный статус «Проблемы»</span>
        </div>
      ) : (
        <ol className={styles.track}>
          {slots.map((slot, offset) => {
            if (slot.type === 'ellipsis') {
              return (
                <li key="ellipsis" className={`${styles.step} ${styles.gap}`}>
                  {offset > 0 && <span className={styles.connector} aria-hidden />}
                  <span className={styles.dot} aria-hidden>
                    …
                  </span>
                  <span className={styles.stepLabel}>…</span>
                </li>
              );
            }

            const done = slot.role === 'prev';
            const active = slot.role === 'current';
            return (
              <li
                key={`${slot.role}-${slot.status}`}
                className={[
                  styles.step,
                  done ? styles.done : '',
                  active ? styles.active : '',
                  !done && !active ? styles.upcoming : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {offset > 0 && (
                  <span
                    className={`${styles.connector} ${done || active ? styles.connectorOn : ''}`}
                    aria-hidden
                  />
                )}
                <span className={styles.dot} aria-hidden>
                  {done || (active && current === CargoStatus.COMPLETED) ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <span className={styles.dotMark} />
                  )}
                </span>
                <span className={styles.stepLabel}>{CARGO_STATUS_SHORT[slot.status]}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
