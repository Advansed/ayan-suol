import React from "react";
import styles from "./EditOrder.module.css";

const OrderEdit = () => {
    return (
        <div className={styles.container}>
            <button className={styles.backButton}>←</button>
            <h1 className={styles.pageTitle}>Редактирование заказа #12460</h1>

            <div className={styles.section}>
                <h2>Основная информация</h2>
                <label>
                    Название заказа
                    <input type="text" value="Перевозка промышленного оборудования" className={styles.orderEditInput} />
                </label>
                <label>
                    Город отправления
                    <input type="text" value="Казань" className={styles.orderEditInput} />
                </label>
                <label>
                    Город назначения
                    <input type="text" value="Уфа" className={styles.orderEditInput} />
                </label>
                <div className={styles.flexRow}>
                    <label className={styles.flexItem}>
                        Дата загрузки
                        <input type="text" value="01.04.2025, 13:00 - 15:00" className={styles.orderEditInput} />
                    </label>
                    <label className={styles.flexItem}>
                        Дата разгрузки
                        <input type="text" value="03.04.2025, 13:00 - 15:00" className={styles.orderEditInput} />
                    </label>
                </div>
                <label>
                    Цена (₽)
                    <input type="text" value="120000" className={styles.orderEditInput} />
                </label>
            </div>

            <div className={styles.section}>
                <h2>Информация о грузе</h2>
                <label>
                    Вес (т)
                    <input type="text" value="15" className={styles.orderEditInput} />
                </label>
                <label>
                    Объем (м³)
                    <input type="text" value="45" className={styles.orderEditInput} />
                </label>
                <label>
                    Описание груза
                    <textarea rows={3} className={styles.orderEditInput} >
                        Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.
                    </textarea>
                </label>
            </div>

            <div className={styles.section}>
                <h2>Адреса и контакты</h2>
                <label>
                    Адрес погрузки
                    <input type="text" value="Москва, ул. Промышленная, 15, Завод 'ПромТех'" className={styles.orderEditInput} />
                </label>
                <label>
                    Адрес разгрузки
                    <input
                        type="text"
                        value="Нижний Новгород, ул. Индустриальная, 23, Промышленная зона"
                        className={styles.orderEditInput}
                    />
                </label>
                <label>
                    Контактное лицо
                    <input type="text" value="Иванов Алексей" className={styles.orderEditInput} />
                </label>
                <label>
                    Телефон
                    <input type="text" value="+7 (999) 123-45-67" className={styles.orderEditInput} />
                </label>
            </div>

            <div className={styles.statusBox}>
                <span className={styles.statusBadge}>В ожидании</span>
                <span className={styles.orderId}>ID:12460</span>
                <p>
                    Ваш заказ находится в статусе ожидания. Водители могут видеть ваш заказ и предлагать свои услуги.
                </p>
            </div>

            <div className={styles.actions}>
                <button className={styles.saveButton}>Сохранить</button>
                <button className={styles.deleteButton}>Удалить заказ</button>
            </div>
        </div>
    );
};

export default OrderEdit;
