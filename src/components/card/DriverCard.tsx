import React from 'react';
import styles from './DriverCard.module.css';

const DriverCard = () => {
    const typeDriver = 'Choosen';
    return (
        <div className={styles.driverCard}>
            {/* <div className={styles.driverHeader}>Назначенные водители (2)</div> */}
            <div className={styles.driverInfo}>
                <div className={styles.driverInfoFlex}>
                    <div className={styles.driverAvatar}>Ават<br />арка</div>
                    <div className={styles.driverNameRating}>
                        <span className={styles.driverName}>Иванов Сергей</span>
                        <span className={styles.driverRating}>⭐ 4.9 (12 отзывов)</span>
                    </div>
                </div>
                <div>
                    <div className={styles.driverPrice}>25 000 ₽</div>
                    <div className={styles.driverWeight}>75 тонн</div>
                </div>
            </div>

            <div className={styles.driverInfoRow}>
                🚚 <span className={styles.driverLabel}>&nbsp;Транспорт:</span>&nbsp;Тягач Volvo FH с полуприцепом
            </div>
            <div className={styles.driverInfoRow}>
                ⚖️ <span className={styles.driverLabel}>&nbsp;Грузоподъёмность:</span>&nbsp;5 тонн
            </div>
            <div className={styles.driverInfoRow}>
                📦 <span className={styles.driverLabel}>&nbsp;Выполнено заказов:</span>&nbsp;124
            </div>

            <div className={styles.driverComment}>
                <b>Комментарий водителя:</b><br />
                Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.
            </div>

            {typeDriver === '2' ? <button className={styles.driverButton}>
                💬 Связаться
            </button> :
                <div className={styles.driverInfoFlex}>
                    <button className={styles.driverButton}>
                        💬 Связаться
                    </button>
                    <button className={styles.driverButton}>
                        Выбрать водителя
                    </button>
                </div>
            }
        </div>
    );
};

export default DriverCard;
