import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { mailOutline, arrowForwardOutline } from 'ionicons/icons';
import styles from './OfferCard.module.css';
import { WorkInfo, WorkStatus } from '../../types';
import { useSocket } from '../../../../Store/useSocket';
import { useToken } from '../../../../Store/loginStore';
import { TransportData } from '../../../../Store/transportStore';

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
    const [transports, setTransports] = useState<TransportData[]>([]);
    const [selectedTransportGuid, setSelectedTransportGuid] = useState<string>('');
    const [isLoadingTransports, setIsLoadingTransports] = useState(false);
    
    const { emit, once } = useSocket();
    const token = useToken();

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

    const handleTransportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const guid = e.target.value;
        setSelectedTransportGuid(guid);
        setFormData({ ...formData, transport: guid });
    };

    const formatPrice = (price: number | undefined): string => {
        if (!price) return '0';
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };

    // Загрузка списка транспортов
    useEffect(() => {
        if (!token) return;

        setIsLoadingTransports(true);
        
        once('get_transport', (response: { success: boolean; data?: TransportData | TransportData[]; message?: string }) => {
            setIsLoadingTransports(false);
            
            if (response.success && response.data) {
                const transportsList = Array.isArray(response.data) ? response.data : [response.data];
                setTransports(transportsList);
                
                // Выбираем транспорт: сначала проверяем work.transport, если нет - первый из списка
                if (transportsList.length > 0) {
                    let transportToSelect: TransportData | null = null;
                    
                    // Если в work уже есть выбранный транспорт, используем его
                    if (work.transport) {
                        transportToSelect = transportsList.find(t => t.guid === work.transport) || null;
                    }
                    
                    // Если не нашли или не было выбранного, берем первый
                    if (!transportToSelect) {
                        transportToSelect = transportsList[0];
                    }
                    
                    if (transportToSelect?.guid) {
                        setSelectedTransportGuid(transportToSelect.guid);
                        setFormData(prev => ({ ...prev, transport: transportToSelect.guid }));
                    }
                }
            }
        });

        emit('get_transport', { token });
    }, [token, emit, once, work.transport]);

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

        if (!selectedTransportGuid) {
            setError('Выберите транспорт');
            return;
        }

        setIsSubmitting(true);
        try {
            // Создаем объект с обновленными данными из формы
            const updatedWork: Partial<WorkInfo> = {
                ...work,
                ...formData,
                transport: selectedTransportGuid,
                volume: volume
            };
            await onSubmit(updatedWork, volume);
        } catch (err) {
            setError('Ошибка при отправке предложения');
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = () => { 
        return work.status === WorkStatus.OFFERED ? 'Сделано предложение' : 'Сделать предложение';
    }

    const isOffered = work.status === WorkStatus.OFFERED;
    
    return (
        <div className={`${styles.counterOfferCard} ${isOffered ? styles.offered : styles.notOffered}`}>
            {/* Header */}
            <div className={styles.header}>
                <IonIcon icon={mailOutline} className={styles.headerIcon} />
                <h2 className={styles.title}> { title() } </h2>
            </div>

            {/* Input Fields Row */}
            <div className={styles.inputRow}>

                <div className={`${styles.inputField} ${styles.priceField}`}>
                    <label className={styles.label}>Пред. цена (₽)</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formatPrice(formData.price)}
                        onChange={handlePriceChange}
                        placeholder="150 000 (₽)"
                    />
                </div>

                <div className={`${styles.inputField} ${styles.weightField}`}>
                    <label className={styles.label}>Вес (т)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={formData.weight || 0}
                        onChange={handleWeightChange}
                        placeholder="40 тонн"
                        step="0.1"
                    />
                </div>

                <div className={`${styles.inputField} ${styles.volumeField}`}>
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

            {/* Transport Selection */}
            <div className={styles.transportField}>
                <label className={styles.label}>Транспорт</label>
                {isLoadingTransports ? (
                    <div className={styles.transportLoading}>Загрузка транспортов...</div>
                ) : transports.length === 0 ? (
                    <div className={styles.transportEmpty}>Нет доступных транспортов</div>
                ) : transports.length === 1 ? (
                    <div className={styles.transportSingle}>
                        {transports[0].name || transports[0].license_plate || 'Транспорт'}
                        {transports[0].license_plate && (
                            <span className={styles.transportPlate}> ({transports[0].license_plate})</span>
                        )}
                    </div>
                ) : (
                    <select
                        className={styles.transportSelect}
                        value={selectedTransportGuid}
                        onChange={handleTransportChange}
                    >
                        <option value="">Выберите транспорт</option>
                        {transports.map((transport) => (
                            <option key={transport.guid} value={transport.guid || ''}>
                                {transport.name || transport.license_plate || transport.guid}
                                {transport.license_plate && ` (${transport.license_plate})`}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {/* Submit Button */}
            <IonButton
                // className={styles.submitButton}
                expand      = 'block'
                onClick     = { handleSubmit }
                disabled    = { isSubmitting }
            >
                {/* <IonIcon icon={arrowForwardOutline} className={styles.buttonIcon} /> */}
                <span> { work.status === WorkStatus.OFFERED ? 'Отозвать предложение' : 'Сделать предложение' }</span>
            </IonButton>
        </div>
    );
};
