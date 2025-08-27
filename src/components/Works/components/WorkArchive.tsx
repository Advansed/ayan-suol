import React from 'react';
import { IonRefresher, IonRefresherContent, IonSpinner } from '@ionic/react';
import { WorkCard } from './WorkCard';
import useWorkArchive from '../hooks/useWorkArchive';
import styles from './WorkArchive.module.css';

export const WorkArchive = () => {
  const { works, loading, refreshing, refresh } = useWorkArchive();

  const handleRefresh = async (event: any) => {
    await refresh();
    event.detail.complete();
  };

  const handleWorkClick = (work) => {
    // TODO: Добавить навигацию к просмотру работы
    console.log('Clicked work:', work);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <IonSpinner />
        <div>Загрузка архива...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent
          pullingIcon="chevron-down-outline"
          pullingText="Потяните для обновления"
          refreshingSpinner="circles"
          refreshingText="Обновление..."
        />
      </IonRefresher>

      <div className={styles.header}>
        <div className="fs-09"><b>Архив работ</b></div>
        <button 
          onClick={refresh} 
          disabled={refreshing}
          className={`${styles.refreshBtn} ${refreshing ? styles.refreshing : ''}`}
        >
          {refreshing ? '⟳' : '↻'} Обновить
        </button>
      </div>

      <div className={styles.stats}>
        Выполненных работ: {works.length}
      </div>

      <div className={styles.list}>
        {works.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🚛</div>
            <div className={styles.emptyText}>Нет выполненных работ</div>
          </div>
        ) : (
          works.map(work => (
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