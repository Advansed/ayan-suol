import React, { useMemo } from 'react';
import { Check, CircleDot, X } from 'lucide-react';
import { WorkInfo, WorkStatus } from '../../types';
import {
  WORK_STATUS_FLOW,
  WORK_STATUS_SHORT,
  getStatusFlowIndex,
} from '../../statusFlow';
import styles from './StatusTimeline.module.css';

type StatusTimelineProps = {
  work: WorkInfo;
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ work }) => {
  const current = work.status;
  const currentIndex = getStatusFlowIndex(current);
  const isRejected = current === WorkStatus.REJECTED;

  const steps = useMemo(() => WORK_STATUS_FLOW, []);

  return (
    <section className={styles.wrap} aria-label="Статусы заказа">
      <div className={styles.head}>
        <div>
          <div className={styles.kicker}>Прогресс заказа</div>
          <h2 className={styles.currentTitle}>
            {isRejected ? (
              <span className={styles.rejectedLabel}>{WorkStatus.REJECTED}</span>
            ) : (
              <>
                Текущий статус:{' '}
                <span className={styles.currentValue}>{current}</span>
              </>
            )}
          </h2>
        </div>
        {!isRejected && currentIndex >= 0 && (
          <div className={styles.progressMeta}>
            Шаг {currentIndex + 1} из {steps.length}
          </div>
        )}
      </div>

      {!isRejected && (
        <ol className={styles.track} aria-label="Цепочка статусов">
          {steps.map((status, index) => {
            const done = index < currentIndex;
            const active = index === currentIndex;
            const upcoming = index > currentIndex;
            return (
              <li
                key={status}
                className={[
                  styles.step,
                  done ? styles.done : '',
                  active ? styles.active : '',
                  upcoming ? styles.upcoming : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {index > 0 && (
                  <span
                    className={`${styles.connector} ${done || active ? styles.connectorOn : ''}`}
                    aria-hidden
                  />
                )}
                <span className={styles.dot} aria-hidden>
                  {done ? (
                    <Check size={12} strokeWidth={2.5} />
                  ) : active ? (
                    <CircleDot size={14} strokeWidth={2} />
                  ) : null}
                </span>
                <span className={styles.stepLabel}>{WORK_STATUS_SHORT[status]}</span>
              </li>
            );
          })}
        </ol>
      )}

      {isRejected && (
        <div className={styles.rejectedBanner}>
          <X size={18} strokeWidth={2} />
          <span>Заказ перешёл в статус «Отказано»</span>
        </div>
      )}
    </section>
  );
};
