import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { mailOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import styles from './OfferCard.module.css';
import { WorkInfo, WorkStatus } from '../../types';
import { useTransportStore } from '../../../../Store/transportStore';

interface CounterOfferCardProps {
    work: WorkInfo;
    onSubmit: (data: Partial<WorkInfo>, volume: number) => Promise<void>;
    onCancel?: () => void;
}

export const CounterOfferCard: React.FC<CounterOfferCardProps> = ({
    work,
    onSubmit,
    onCancel
}) => {
    const [formData, setFormData] = useState<Partial<WorkInfo>>({
        price: work.price,
        weight: work.weight
    });

    const [volume, setVolume] = useState<number>(work.volume);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const transport = useTransportStore(state => state.data);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s/g, '');
        const numValue = parseInt(value) || 0;
        setFormData({ ...formData, price: numValue });
    };

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setFormData({ ...formData, weight: value });
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setVolume(value);
    };

    const formatPrice = (price: number | undefined): string => {
        if (!price) return '0';
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };

    useEffect(() => {
        if (transport?.guid) {
            setFormData(prev => ({ ...prev, transport: transport.guid }));
        }
    }, [transport?.guid]);

    const handleSubmit = async () => {
        setError('');

        if (!formData.price || formData.price <= 0) {
            setError('Укажите корректную цену');
            return;
        }

        if (!formData.weight || formData.weight <= 0) {
            setError('Укажите корректный вес');
            return;
        }

        if (!transport?.guid) {
            setError('Добавьте транспорт в профиле');
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedWork: Partial<WorkInfo> = {
                ...work,
                ...formData,
                transport: transport.guid,
                volume: volume
            };
            await onSubmit(updatedWork, volume);
        } catch (err) {
            setError('Ошибка при отправке предложения');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isOffered = work.status === WorkStatus.OFFERED;

    return (
        <div className={styles.offerCard}>
            <div className={styles.notificationCard}>
                <div className={styles.notificationHeader}>
                    <div className={styles.notificationTitleRow}>
                        <IonIcon icon={mailOutline} className={styles.notificationIcon} />
                        <h2 className={styles.notificationTitle}>
                            {isOffered ? 'Сделано предложение' : 'Новое предложение'}
                        </h2>
                        {!isOffered && <span className={styles.newBadge}>NEW</span>}
                    </div>
                    <p className={styles.notificationSubtitle}>
                        {isOffered
                            ? 'Вы отправили встречное предложение заказчику'
                            : 'Укажите цену и параметры для отправки предложения'}
                    </p>
                </div>
            </div>

            <div className={styles.detailsCard}>
                <div className={styles.infoRow}>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Цена (₽)</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formatPrice(formData.price)}
                            onChange={handlePriceChange}
                            placeholder="150 000"
                        />
                    </div>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Вес (т)</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={formData.weight || 0}
                            onChange={handleWeightChange}
                            placeholder="40"
                            step="0.1"
                        />
                    </div>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Объем (м³)</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={volume}
                            onChange={handleVolumeChange}
                            placeholder="40"
                            step="0.1"
                        />
                    </div>
                </div>

                <div className={styles.transportField}>
                    <label className={styles.label}>Транспорт</label>
                    {transport ? (
                        <div className={styles.transportSingle}>
                            {transport.name || transport.license_plate || 'Транспорт'}
                            {transport.license_plate && (
                                <span className={styles.transportPlate}> ({transport.license_plate})</span>
                            )}
                        </div>
                    ) : (
                        <div className={styles.transportEmpty}>Добавьте транспорт в профиле</div>
                    )}
                </div>
            </div>

            <div className={styles.secureCard}>
                <IonIcon icon={shieldCheckmarkOutline} className={styles.secureIcon} />
                <h3 className={styles.secureTitle}>Безопасная оплата через платформу</h3>
                <p className={styles.secureDescription}>
                    Все платежи проходят через специальный счет приложения. Комиссия платформы 5% обеспечивает защиту обеих сторон и гарантию выполнения сделки.
                </p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
                <IonButton
                    fill={isOffered ? 'outline' : 'solid'}
                    className={isOffered ? styles.cancelButton : styles.submitButton}
                    expand="block"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    <span>{isOffered ? 'Отозвать предложение' : 'Сделать предложение'}</span>
                </IonButton>
            </div>
        </div>
    );
};

