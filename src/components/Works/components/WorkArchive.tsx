import React, { useMemo } from 'react';
import { WorkCard } from './WorkCard';
import styles from './WorkArchive.module.css';
import { useWorks } from '../useWorks';
import { WizardHeader } from '../../Header/WizardHeader';
import { WorkStatus, type WorkInfo } from '../types';
import { normalizeWorkStatus } from '../statusFlow';

export const WorkArchive = () => {
  const { works, archiveWorks, refreshWorks } = useWorks();

  const completed = useMemo(() => {
    const done = works.filter((w) => normalizeWorkStatus(w.status) === WorkStatus.COMPLETED);
    const seen = new Set(done.map((w) => w.guid));
    return [...done, ...archiveWorks.filter((w) => !seen.has(w.guid))];
  }, [works, archiveWorks]);

  const handleWorkClick = (work: WorkInfo) => {
    // TODO: Добавить навигацию к просмотру работы
  };

  return (
    <div className={styles.pageRoot}>
      <div className={styles.pageHeader}>
        <WizardHeader title="Архив" onRefresh={refreshWorks} />
      </div>

      <div className={styles.pageContent}>
        <div className={styles.stats}>
          Выполненных работ: {completed.length}
        </div>

        <div className={styles.list}>
          {completed.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🚛</div>
              <div className={styles.emptyText}>Нет выполненных работ</div>
            </div>
          ) : (
            completed.map((work) => (
              <WorkCard
                key={work.guid}
                work={work}
                mode="list"
                onClick={() => handleWorkClick(work)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
