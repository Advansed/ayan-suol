import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonCheckbox
} from '@ionic/react';
import styles from './style.module.css';

const DeliveryCard = (props: any) => {
  const info = props.info;
  return (
    <IonCard className={styles.deliveryCard}>
      <IonCardContent>
        {/* Header section with name, rating and price */}
        <div className={styles.cardHeader}>
          <div className={styles.driverInfo}>
            <div className={styles.avatar}>
              <div className={styles.avatarText}>Аватарка</div>
            </div>
            <div className={styles.nameRating}>
              <b>Иванов сергей</b>
              <div className={styles.rating}>
                {/* <IonIcon icon={star} className={styles.starIcon} /> */}
                <div className={styles.starIcon}>
                  ⭐️
                </div>
                <span>4,9(12 отзывов)</span>
              </div>
            </div>
          </div>
          <div className={styles.priceContainer}>
            <div className={styles.price}><b>₽25 000</b></div>
            <div className={styles.priceCaption}>Сформированная цена</div>
          </div>
        </div>

        {/* Transport info */}
        <div className={styles.infoRow}>
          {/* <IonIcon icon={truckOutline} className={styles.infoIcon} /> */}
          <div className={styles.infoIcon}>🚚</div>
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>Транспорт: </span>
            <span className={styles.infoValue}>Тягач Volvo FH с полуприцепом</span>
          </div>
        </div>

        {/* Weight info */}
        <div className={styles.infoRow}>
          {/* <IonIcon icon={arrowDownOutline} className={styles.infoIcon} /> */}
          <div className={styles.infoIcon}>
            📦
          </div>
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>Взял веса: </span>
            <span className={styles.infoValue}>4 тонны</span>
          </div>
        </div>

        {/* Arrival status */}
        <div className={styles.statusText}>Прибыл на место разгрузки</div>

        {/* Checkboxes */}
        <div className={styles.checkboxContainer}>
          <IonCheckbox checked={false} className={styles.statusCheckbox} />
          <div className={styles.checkboxText}>
            <div className={styles.checkboxTitle}>Груз доставлен в целости и сохранности</div>
            <div className={styles.checkboxDescription}>
              Отсутствуют видимые повреждения, которые могли возникнуть при транспортировке
            </div>
          </div>
        </div>

        <div className={styles.checkboxContainer}>
          <IonCheckbox checked={false} className={styles.statusCheckbox} />
          <div className={styles.checkboxText}>
            <div className={styles.checkboxTitle}>Все документы подписаны</div>
            <div className={styles.checkboxDescription}>
              Товарно-транспортная накладная и акт приема-передачи подписаны заказчиком
            </div>
          </div>
        </div>

        {/* Confirm button */}
        <IonButton expand="block" mode='ios' className={styles.confirmButton}>
          {/* <div className='fs-08'> */}
          Подтвердить выполнение заказа
          {/* </div> */}
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default DeliveryCard;