import React, { useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { mailOutline, arrowForwardOutline } from 'ionicons/icons';
import { WorkInfo, CreateOfferData, WorkStatus } from '../types';
import styles from './CounterOfferCard.module.css';

interface CounterOfferCardProps {
    work: WorkInfo;
    onSubmit: (data: CreateOfferData, volume: number) => Promise<void>;
    onCancel?: () => void;
}

export const CounterOfferCard: React.FC<CounterOfferCardProps> = ({ 
    work, 
    onSubmit,
    onCancel 
}) => {
    const [formData, setFormData] = useState<CreateOfferData>({
        workId: work.guid,
        transportId: '',
        price: work.price,
        weight: work.weight,
        comment: ''
    });

    const [volume, setVolume] = useState<number>(work.volume);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

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

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, comment: e.target.value });
    };

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };

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

        setIsSubmitting(true);
        try {
            await onSubmit(formData, volume);
        } catch (err) {
            setError('Ошибка при отправке предложения');
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = () => { 
        return work.status === WorkStatus.OFFERED ? 'Сделано предложение' : 'Сделать предложение';
    }

    return (
        <div className={styles.counterOfferCard}>
            {/* Header */}
            <div className={styles.header}>
                <IonIcon icon={mailOutline} className={styles.headerIcon} />
                <h2 className={styles.title}> { title() } </h2>
            </div>

            {/* Input Fields Row */}
            <div className={styles.inputRow}>

                <div className={styles.inputField}>
                    <label className={styles.label}>Пред. цена (₽)</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formatPrice(formData.price)}
                        onChange={handlePriceChange}
                        placeholder="150 000 (₽)"
                    />
                </div>

                <div className={styles.inputField}>
                    <label className={styles.label}>Вес (т)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={formData.weight}
                        onChange={handleWeightChange}
                        placeholder="40 тонн"
                        step="0.1"
                    />
                </div>

                <div className={styles.inputField}>
                    <label className={styles.label}>Объем (м³)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={volume}
                        onChange={handleVolumeChange}
                        placeholder="40 м³"
                        step="0.1"
                    />
                </div>

            </div>

            {/* Comment Section */}
            {/* <div className={styles.commentSection}>
                <label className={styles.commentLabel}>
                    *Комментарий к встречному предложению
                </label>
                <textarea
                    className={styles.textarea}
                    value={formData.comment}
                    onChange={handleCommentChange}
                    placeholder="Обьясните свое предложение заказчику ...."
                    rows={4}
                />
            </div> */}

            {error && <div className={styles.error}>{error}</div>}

            {/* Submit Button */}
            <IonButton
                // className={styles.submitButton}
                expand      = 'block'
                onClick     = { handleSubmit }
                disabled    = { isSubmitting }
            >
                {/* <IonIcon icon={arrowForwardOutline} className={styles.buttonIcon} /> */}
                <span> Отозвать предложение</span>
            </IonButton>
        </div>
    );
};
