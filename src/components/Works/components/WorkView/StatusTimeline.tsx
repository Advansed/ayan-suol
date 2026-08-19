import React, { useMemo } from 'react';
import { Check, CircleDot, X } from 'lucide-react';
import { WorkInfo, WorkStatus } from '../../types';
import {
  WORK_STATUS_FLOW,
  WORK_STATUS_SHORT,
  getStatusFlowIndex,
  normalizeWorkStatus,
} from '../../statusFlow';
import styles from './StatusTimeline.module.css';

const WINDOW_SIZE = 5;

type StatusTimelineProps = {
  work: WorkInfo;
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ work }) => {
  const current = normalizeWorkStatus(work.status);
  const currentIndex = getStatusFlowIndex(current);
  const isRejected = current === WorkStatus.REJECTED;

  const steps = useMemo(() => WORK_STATUS_FLOW, []);
  const visibleSteps = useMemo(() => {
    const n = steps.length;
    const start = Math.min(Math.max(currentIndex - 2, 0), Math.max(0, n - WINDOW_SIZE));
    return steps.slice(start, start + WINDOW_SIZE).map((status, offset) => ({
      status,
      index: start + offset,
    }));
  }, [steps, currentIndex]);
  const progressPct =
    currentIndex >= 0 && steps.length > 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

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
        <>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={currentIndex + 1}
            aria-label="Прогресс по цепочке статусов"
          >
            <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }} />
          </div>
          <ol className={styles.track} aria-label="Цепочка статусов">
            {visibleSteps.map(({ status, index }, offset) => {
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
                  {offset > 0 && (
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
        </>
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
