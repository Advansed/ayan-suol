import React from 'react';
import styles from './OrderHistory.module.css';

export function OrderHistory(){
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>История заказов</h1>
      <div className={styles.card}>
        <h2 className={styles.subtitle}>История заказов</h2>
        <p className={styles.description}>Просмотр всех ваших заказов и их статусов</p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Маршрут</th>
              <th>Дата</th>
              <th>Стоимость</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>12460</td>
              <td>Перевозка промышленного оборудования</td>
              <td>Москва - Санкт Петербург</td>
              <td>25.04.2025</td>
              <td>120 000 ₽</td>
              <td><span className={styles.statusDone}>Выполнен</span></td>
            </tr>
            <tr>
              <td>12443</td>
              <td>Перевозка овощей и фруктов</td>
              <td>Москва - Санкт Петербург</td>
              <td>25.04.2025</td>
              <td>50 000 ₽</td>
              <td><span className={styles.statusDone}>Выполнен</span></td>
            </tr>
            <tr>
              <td>12433</td>
              <td>Перевозка овощей и фруктов</td>
              <td>Москва - Санкт Петербург</td>
              <td>22.04.2025</td>
              <td>50 000 ₽</td>
              <td><span className={styles.statusCancelled}>Отменен</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.analyticsCard}>
        <h2 className={styles.subtitle}>Аналитика заказов</h2>
        <p className={styles.description}>Статистика и аналитика ваших заказов</p>

        <div className={styles.analyticsGrid}>
          <div className={styles.analyticsItem}>
          <p className={styles.analyticsLabel}>Всего заказов</p>
            <p className={styles.analyticsValue}>124</p>
            <p className={styles.analyticsLabel}>За все врем я</p>
          </div>
          <div className={styles.analyticsItem}>
          <p className={styles.analyticsLabel}>Средняя стоимость</p>
            <p className={styles.analyticsValue}>128 676 ₽</p>
            <p className={styles.analyticsLabel}>На заказ</p>
          </div>
          <div className={styles.analyticsItem}>
          <p className={styles.analyticsLabel}>Успешность</p>
            <p className={styles.analyticsValue}>97%</p>
            <p className={styles.analyticsLabel}>Выполненных заказов</p>
          </div>
        </div>
      </div>
    </div>
  );
};