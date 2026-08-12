import React, { useMemo } from 'react';
import { AlertTriangle, Check, CircleDot } from 'lucide-react';
import { CargoInfo, CargoStatus } from '../../../Store/cargoStore';
import {
  CARGO_STATUS_FLOW,
  CARGO_STATUS_SHORT,
  getCargoStatusFlowIndex,
  resolveCargoProgressStatus,
} from '../cargoStatusFlow';
import styles from './CargoStatusTimeline.module.css';

type CargoStatusTimelineProps = {
  cargo: CargoInfo;
};

export const CargoStatusTimeline: React.FC<CargoStatusTimelineProps> = ({ cargo }) => {
  const current = resolveCargoProgressStatus(cargo);
  const isProblems = current === CargoStatus.PROBLEMS;
  const currentIndex = getCargoStatusFlowIndex(current);
  const steps = useMemo(() => CARGO_STATUS_FLOW, []);

  return (
    <section className={styles.wrap} aria-label="Статусы заявки">
      <div className={styles.head}>
        <div>
          <div className={styles.kicker}>Прогресс заявки</div>
          <h2 className={styles.currentTitle}>
            {isProblems ? (
              <span className={styles.rejectedLabel}>{CargoStatus.PROBLEMS}</span>
            ) : (
              <>
                Текущий статус:{' '}
                <span className={styles.currentValue}>{current}</span>
              </>
            )}
          </h2>
        </div>
        {!isProblems && currentIndex >= 0 && (
          <div className={styles.progressMeta}>
            Шаг {currentIndex + 1} из {steps.length}
          </div>
        )}
      </div>

      {!isProblems && (
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
                <span className={styles.stepLabel}>{CARGO_STATUS_SHORT[status]}</span>
              </li>
            );
          })}
        </ol>
      )}

      {isProblems && (
        <div className={styles.rejectedBanner}>
          <AlertTriangle size={18} strokeWidth={2} />
          <span>По заявке зафиксирован внештатный статус «Проблемы»</span>
        </div>
      )}
    </section>
  );
};
