import styles from './OrderCard.module.css';
// import DriverCard from "../../card/DriverCard";

const OrderCard = ({ type, price, id, from, to, loadDate, unloadDate,buttonShow }) => {
    const typeLabel = type === 'new' ? 'Новый' : 'Торг';
    const typeClass = type === 'new' ? styles.new : styles.bargain;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <span className={`${styles.label} ${typeClass}`}>{typeLabel}</span>

                    <span className={styles.id}>ID:{id}</span>
                </div>
                <span className={styles.price}>₽ {price.toLocaleString()}</span>
            </div>

            <h3 className={styles.title}>Перевозка промышленного оборудования</h3>

            <div className={styles.route}>
                <div className={styles.routeContainer}>
                    <span className={styles.icon}>📍</span>
                    <div className={styles.toTextContainer}>
                        <div className={styles.toTextHeader}>Откуда</div>
                        <strong className={styles.toText}>{from}</strong>
                    </div>
                </div>
                <div className={styles.routeContainerGrid}>
                    <span className={styles.labelText}>Дата загрузки:</span>
                    <div><strong className={styles.timeDate}>{loadDate}</strong> <span className={styles.time}>13:00 - 15:00</span></div>
                </div>
            </div>

            <div className={styles.route}>
                <div className={styles.routeContainer}>
                    <span className={styles.icon}>📍</span>
                    <div className={styles.toTextContainer}>
                        <div className={styles.toTextHeader}>Куда</div>
                        <strong className={styles.toText}>{to}</strong>
                    </div>
                </div>
                <div className={styles.routeContainerGrid}>
                    <span className={styles.labelText}>Дата выгрузки:</span>
                    <div><strong className={styles.timeDate}>{unloadDate}</strong> <span className={styles.time}>13:00 - 15:00</span></div>
                </div>
            </div>

            <div className={styles.details}>
                <span className={styles.detailsTitle}>Детали груза:</span>
                <div className={styles.detailsDesc}>
                    Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.
                </div>
            </div>

            {buttonShow ? <div className={styles.buttons}>
                <button className={styles.contactBtn}>Связаться с заказчиком</button>
                <button className={styles.offerBtn}>Предложить свою цену</button>
            </div> : null}
        </div>
    );
};

{/* <OrderCard
    type="new"
    price={120000}
    id="12460"
    from="Казань"
    to="Уфа"
    loadDate="01.04.2025"
    unloadDate="03.04.2025"
/> */}
export default OrderCard