import React from 'react';
import styles from './DriverOrderHistory.module.css';

const OrderCard = ({ order }) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.status}>Выполнено</span>
                <span className={styles.id}>ID:{order.id}</span>
                <span className={styles.price}>₽ {order.price.toLocaleString()}</span>
            </div>

            <div className={styles.title}>{order.title}</div>

            <div className={styles.route}>
                <div>
                    <div className={styles.label}>Откуда:</div>
                    <div className={styles.value}>{order.from}</div>
                </div>
                <div>
                    <div className={styles.label}>Дата загрузки:</div>
                    <div className={styles.value}>{order.loadDate}</div>
                </div>
                <div>
                    <div className={styles.label}>Куда:</div>
                    <div className={styles.value}>{order.to}</div>
                </div>
                <div>
                    <div className={styles.label}>Дата выгрузки:</div>
                    <div className={styles.value}>{order.unloadDate}</div>
                </div>
            </div>

            <div className={styles.details}>
                <div className={styles.detailsTitle}>Детали груза:</div>
                <div className={styles.detailsText}>{order.details}</div>
            </div>
        </div>
    );
};

export function DriverOrderHistory({ ordersProps }) {

    const orders = ordersProps ? ordersProps : [
        {
            id: 12460,
            price: 120000,
            title: 'Перевозка промышленного оборудования',
            from: 'Казань',
            to: 'Уфа',
            loadDate: '01.04.2025 13:00 - 15:00',
            unloadDate: '03.04.2025 13:00 - 15:00',
            details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.',
        },
        {
            id: 12461,
            price: 125000,
            title: 'Перевозка промышленного оборудования',
            from: 'Казань',
            to: 'Уфа',
            loadDate: '01.04.2025 13:00 - 15:00',
            unloadDate: '03.04.2025 13:00 - 15:00',
            details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.',
        },
        {
            id: 12462,
            price: 122000,
            title: 'Перевозка промышленного оборудования',
            from: 'Казань',
            to: 'Уфа',
            loadDate: '01.04.2025 13:00 - 15:00',
            unloadDate: '03.04.2025 13:00 - 15:00',
            details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.',
        }
    ];


    return (
        <div className={styles.list}>
            <div className={styles.titleHeader}>История</div>
            {orders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    );
};

