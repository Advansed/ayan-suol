import React from 'react';
import styles from './OrderCard.module.css';


// orderData - example



export function DriverOrder({ orderProp }) {


    const order = orderProp ? orderProp : {
        id: 12460,
        price: 120000,
        title: 'Перевозка промышленного оборудования',
        from: 'Казань',
        to: 'Уфа',
        loadDate: '01.04.2025 13:00',
        unloadDate: '03.04.2025 15:00',
        details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.',
        weight: '15',
        volume: '45',
        pickupAddress: 'Москва, ул. Промышленная, 15, Завод \'ПромТех\'',
        deliveryAddress: 'Нижний Новгород, ул. Индустриальная, 23, Промышленная зона',
        contactName: 'Иванов Алексей',
        phone: '+7 (999) 123-45-67',
    };
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerFlex}>
                    <span className={styles.status}>В работе</span>
                    <div className={styles.title}>ID:{order.id}</div>
                </div>
                <div className={styles.price}>₽ {order.price.toLocaleString()}</div>
            </div>

            <div className={styles.section}>
                <div className={styles.label}>{order.title}</div>
                <div className={styles.value}>
                    Откуда: {order.from}<br />
                    Куда: {order.to}<br />
                    Дата загрузки: {order.loadDate}<br />
                    Дата выгрузки: {order.unloadDate}
                </div>
                <div className={styles.details}>
                    {order.details}
                </div>
                <button className={styles.buttonPrimary}>Связаться с заказчиком</button>
            </div>

            <div className={styles.section}>
                <div className={styles.label}>Информация о грузе</div>
                <div className={styles.inputGroup}>
                    <input className={styles.input} readOnly value={order.weight} placeholder="Вес (т)" />
                </div>
                <div className={styles.inputGroup}>
                    <input className={styles.input} readOnly value={order.volume} placeholder="Объем (м³)" />
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.label}>Адреса и контакты</div>
                <div className={styles.inputGroup}>
                    <input className={styles.input} readOnly value={order.pickupAddress} />
                </div>
                <div className={styles.inputGroup}>
                    <input className={styles.input} readOnly value={order.deliveryAddress} />
                </div>
                <div className={styles.inputGroup}>
                    <input className={styles.input} readOnly value={order.contactName} />
                </div>
                <div className={styles.inputGroup}>
                    <input className={styles.input} readOnly value={order.phone} />
                </div>
            </div>

            <button className={styles.buttonDanger}>Сообщить о мошенничестве</button>
        </div>
    );
};
