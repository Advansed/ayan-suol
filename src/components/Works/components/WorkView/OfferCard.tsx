import React, { useEffect, useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { WorkInfo, WorkStatus } from '../../types';
import { useTransportStore, transportDisplayName } from '../../../../Store/transportStore';
import styles from './CounterOffer.module.css';

interface CounterOfferCardProps {
  work: WorkInfo;
  onSubmit: (data: Partial<WorkInfo>, volume: number) => Promise<void>;
  onCancel?: () => void;
}

export const CounterOfferCard: React.FC<CounterOfferCardProps> = ({ work, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<WorkInfo>>({
    price: work.price,
    weight: work.weight,
  });
  const [volume, setVolume] = useState<number>(work.volume);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const transport = useTransportStore((state) => state.data);
  const isOffered = work.status === WorkStatus.OFFERED;

  useEffect(() => {
    if (transport?.guid) {
      setFormData((prev) => ({ ...prev, transport: transport.guid }));
    }
  }, [transport?.guid]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value.replace(/\s/g, ''), 10) || 0;
    setFormData({ ...formData, price: numValue });
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value) || 0);
  };

  const formatPrice = (price: number | undefined): string => {
    if (!price) return '';
    return String(price);
  };

  const transportLabel = transport
    ? [transportDisplayName(transport) || 'Транспорт', transport.license_plate ? `(${transport.license_plate})` : '']
        .filter(Boolean)
        .join(' ')
    : 'Добавьте транспорт в профиле';

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
      await onSubmit(
        {
          ...work,
          ...formData,
          transport: transport.guid,
          volume,
        },
        volume
      );
    } catch {
      setError(isOffered ? 'Ошибка при отзыве предложения' : 'Ошибка при отправке предложения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.root}>
      <section className={styles.formCard}>
        <h3 className={styles.formTitle}>
          {isOffered ? 'Сделано предложение' : 'Встречное предложение'}
        </h3>
        <p className={styles.formHint}>
          {isOffered
            ? 'Вы отправили встречное предложение заказчику'
            : 'Укажите свою цену и параметры перевозки'}
        </p>

        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Цена (₽)</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatPrice(formData.price)}
              onChange={handlePriceChange}
              placeholder="22500"
              disabled={isOffered}
            />
          </label>
          <label className={styles.field}>
            <span>Вес (т)</span>
            <input
              type="number"
              value={formData.weight || ''}
              onChange={handleWeightChange}
              placeholder="8"
              step="0.1"
              min="0"
              disabled={isOffered}
            />
          </label>
          <label className={styles.field}>
            <span>Объём (м³)</span>
            <input
              type="number"
              value={volume || ''}
              onChange={handleVolumeChange}
              placeholder="40"
              step="0.1"
              min="0"
              disabled={isOffered}
            />
          </label>
        </div>

        <label className={styles.field}>
          <span>Транспорт</span>
          <div className={`${styles.select} ${transport ? '' : styles.selectEmpty}`}>
            <span className={styles.selectValue}>{transportLabel}</span>
            <ChevronDown size={18} strokeWidth={2} aria-hidden />
          </div>
        </label>
      </section>

      <aside className={styles.secure}>
        <ShieldCheck size={22} strokeWidth={2} className={styles.secureIcon} />
        <div>
          <h4 className={styles.secureTitle}>Безопасная оплата через платформу</h4>
          <p className={styles.secureText}>
            Все платежи проходят через специальный эскроу-счёт приложения. Комиссия платформы 5%
            обеспечивает защиту обеих сторон и гарантию выполнения сделки.
          </p>
        </div>
      </aside>

      {error && <div className={styles.error}>{error}</div>}

      <button
        type="button"
        className={isOffered ? styles.cancelBtn : styles.submitBtn}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? 'Отправка…'
          : isOffered
            ? 'Отозвать предложение'
            : 'Отправить предложение'}
      </button>
    </div>
  );
};
