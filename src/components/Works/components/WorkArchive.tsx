import React from 'react';
import { IonRefresher, IonRefresherContent, IonSpinner } from '@ionic/react';
import { WorkCard } from './WorkCard';
import styles from './WorkArchive.module.css';
import { useWorks } from '../../../Store/useWorks';
import { WizardHeader } from '../../Header/WizardHeader';

export const WorkArchive = () => {
  const { archiveWorks, isArchiveLoading, loadArchiveWorks } = useWorks();

  const handleRefresh = async (event: any) => {
    await loadArchiveWorks();
  };

  const handleWorkClick = (work) => {
    // TODO: Добавить навигацию к просмотру работы
    console.log('Clicked work:', work);
  };

  if (isArchiveLoading) {
    return (
      <div className={styles.loading}>
        <IonSpinner />
        <div>Загрузка архива...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <WizardHeader 
          title     = 'Архив'
          onRefresh = { loadArchiveWorks }
      />

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
          archiveWorks.map(work => (
            <WorkCard
              key={work.guid}
              work={work}
              onClick={() => handleWorkClick(work)}
            />
          ))
        )}
      </div>
    </div>
  );
};