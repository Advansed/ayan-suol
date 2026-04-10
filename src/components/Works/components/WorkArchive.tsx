import React from 'react';
import { IonSpinner } from '@ionic/react';
import { WorkCard } from './WorkCard';
import styles from './WorkArchive.module.css';
import { useWorks } from '../useWorks';
import { WizardHeader } from '../../Header/WizardHeader';
import type { WorkInfo } from '../types';

export const WorkArchive = () => {
  const { archiveWorks, isArchiveLoading, loadArchiveWorks } = useWorks();

  const handleWorkClick = (work: WorkInfo) => {
    // TODO: Добавить навигацию к просмотру работы
    console.log('Clicked work:', work);
  };

  if (isArchiveLoading) {
    return (
      <div className={styles.pageRoot}>
        <div className={styles.pageHeader}>
          <WizardHeader title="Архив" onRefresh={loadArchiveWorks} />
        </div>
        <div className={styles.pageContent}>
          <div className={styles.loading}>
            <IonSpinner />
            <div>Загрузка архива...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageRoot}>
      <div className={styles.pageHeader}>
        <WizardHeader title="Архив" onRefresh={loadArchiveWorks} />
      </div>

      <div className={styles.pageContent}>
        <div className={styles.stats}>
          Выполненных работ: {archiveWorks.length}
        </div>

        <div className={styles.list}>
          {archiveWorks.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🚛</div>
              <div className={styles.emptyText}>Нет выполненных работ</div>
            </div>
          ) : (
            archiveWorks.map((work) => (
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
