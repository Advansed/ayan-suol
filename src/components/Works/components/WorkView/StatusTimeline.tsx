import React from 'react';
import { Check } from 'lucide-react';
import { WorkInfo, WorkStatus } from '../../types';
import {
  WORK_STATUS_SHORT,
  getOrderProgressSlots,
  normalizeWorkStatus,
} from '../../statusFlow';
import styles from './StatusTimeline.module.css';

type StatusTimelineProps = {
  work: WorkInfo;
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ work }) => {
  const current = normalizeWorkStatus(work.status);
  const isRejected = current === WorkStatus.REJECTED;
  const slots = isRejected ? [] : getOrderProgressSlots(current);

  return (
    <section className={styles.wrap} aria-label="Статус рейса">
      <div className={styles.head}>
        <p className={styles.title}>Статус рейса</p>
        {!isRejected && (
          <span className={styles.pill}>{WORK_STATUS_SHORT[current] || current}</span>
        )}
      </div>

      {isRejected ? (
        <div className={styles.rejectedBanner}>Заказ перешёл в статус «Отказано»</div>
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
                  {done || (active && current === WorkStatus.COMPLETED) ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <span className={styles.dotMark} />
                  )}
                </span>
                <span className={styles.stepLabel}>{WORK_STATUS_SHORT[slot.status]}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
