import React, { useState, useEffect } from 'react';
import { IonIcon, IonButton, IonCheckbox } from '@ionic/react';
import { locationOutline, calendarOutline } from 'ionicons/icons';
import { WizardHeader } from '../../Header/WizardHeader';
import { CargoInfo, EMPTY_CARGO, CargoAddress } from '../../../Store/cargoStore';
import styles from './CargoNew.module.css';

interface CargoNewProps {
  cargo: CargoInfo;
  onBack: () => void;
  onUpdate: (guid: string, data: CargoInfo) => Promise<boolean>;
  onCreate: (data: CargoInfo) => Promise<boolean>;
}

const parseDateFromInput = (value: string): string => {
  if (!value || !value.trim()) return '';
  const parts = value.trim().split(/[.\-/]/);
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  const day = d.padStart(2, '0');
  const month = m.padStart(2, '0');
  const year = y.length === 2 ? `20${y}` : y;
  return `${year}-${month}-${day}`;
};

const formatDateToInput = (value: string): string => {
  if (!value || value.length < 10) return '';
  const [y, m, d] = value.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
};

export const CargoNew: React.FC<CargoNewProps> = ({ cargo: initialCargo, onBack, onUpdate, onCreate }) => {
  const [name, setName] = useState(initialCargo.name ?? '');
  const [cityFrom, setCityFrom] = useState(initialCargo.address?.city?.city ?? '');
  const [cityTo, setCityTo] = useState(initialCargo.destiny?.city?.city ?? '');
  const [pickupDate, setPickupDate] = useState(formatDateToInput(initialCargo.pickup_date ?? ''));
  const [pickupDays, setPickupDays] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(formatDateToInput(initialCargo.delivery_date ?? ''));
  const [deliveryDays, setDeliveryDays] = useState('');
  const [price, setPrice] = useState(String(initialCargo.price ?? initialCargo.cost ?? ''));
  const [weight, setWeight] = useState(String(initialCargo.weight ?? ''));
  const [volume, setVolume] = useState(String(initialCargo.volume ?? ''));
  const [description, setDescription] = useState(initialCargo.description ?? '');
  const [multiplePerformers, setMultiplePerformers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(initialCargo?.guid);

  useEffect(() => {
    setName(initialCargo.name ?? '');
    setCityFrom(initialCargo.address?.city?.city ?? '');
    setCityTo(initialCargo.destiny?.city?.city ?? '');
    setPickupDate(formatDateToInput(initialCargo.pickup_date ?? ''));
    setDeliveryDate(formatDateToInput(initialCargo.delivery_date ?? ''));
    setPrice(String(initialCargo.price ?? initialCargo.cost ?? ''));
    setWeight(String(initialCargo.weight ?? ''));
    setVolume(String(initialCargo.volume ?? ''));
    setDescription(initialCargo.description ?? '');
  }, [initialCargo.guid]);

  const buildCargo = (): CargoInfo => {
    const address: CargoAddress = {
      city: { city: cityFrom, fias: initialCargo.address?.city?.fias ?? '' },
      address: initialCargo.address?.address ?? '',
      fias: initialCargo.address?.fias ?? '',
      lat: initialCargo.address?.lat ?? 0,
      lon: initialCargo.address?.lon ?? 0
    };
    const destiny: CargoAddress = {
      city: { city: cityTo, fias: initialCargo.destiny?.city?.fias ?? '' },
      address: initialCargo.destiny?.address ?? '',
      fias: initialCargo.destiny?.fias ?? '',
      lat: initialCargo.destiny?.lat ?? 0,
      lon: initialCargo.destiny?.lon ?? 0
    };
    return {
      ...(initialCargo.guid ? initialCargo : EMPTY_CARGO),
      guid: initialCargo.guid,
      name: name.trim() || EMPTY_CARGO.name,
      description: description.trim() || EMPTY_CARGO.description,
      address,
      destiny,
      pickup_date: parseDateFromInput(pickupDate) || initialCargo.pickup_date || EMPTY_CARGO.pickup_date,
      delivery_date: parseDateFromInput(deliveryDate) || initialCargo.delivery_date || EMPTY_CARGO.delivery_date,
      weight: Number(weight) || 0,
      volume: Number(volume) || 0,
      price: Number(price.replace(/\s/g, '')) || 0,
      cost: Number(price.replace(/\s/g, '')) || 0
    };
  };

  const handleNext = async () => {
    const cargo = buildCargo();
    if (!cargo.name?.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const ok = isEdit && cargo.guid
        ? await onUpdate(cargo.guid, cargo)
        : await onCreate(cargo);
      if (ok) onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <WizardHeader title={isEdit ? 'Редактировать груз' : 'Добавить груз'} onMenu={onBack} />

      <div className={styles.content}>
        {/* Основные данные */}
        <section className={styles.section}>
          <div className={styles.field}>
            <div className={styles.inputWrap}>
              <input
                type="text"
                className={styles.input}
                placeholder="Перевозка промышленного оборудования"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.inputWrap}>
              <IonIcon icon={locationOutline} className={`${styles.inputWrapIcon} ${styles.inputWrapIconRed}`} />
              <input
                type="text"
                className={styles.input}
                placeholder="Казань"
                value={cityFrom}
                onChange={(e) => setCityFrom(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.inputWrap}>
              <IonIcon icon={locationOutline} className={`${styles.inputWrapIcon} ${styles.inputWrapIconBlue}`} />
              <input
                type="text"
                className={styles.input}
                placeholder="Уфа"
                value={cityTo}
                onChange={(e) => setCityTo(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <div className={styles.inputWrap}>
                <IonIcon icon={calendarOutline} className={`${styles.inputWrapIcon} ${styles.inputWrapIconBlue}`} />
                <input
                  type="text"
                  className={styles.input + ' w-50'}
                  placeholder="01.04.2025"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', marginTop: 0.25, gap: 0.25 }}>
                <input
                  type="text"
                  className={styles.inputSmall + ' w-40'}
                  placeholder="дней"
                  value={pickupDays}
                  onChange={(e) => setPickupDays(e.target.value)}
                  style={{ marginLeft: 0 }}
                />
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.inputWrap}>
                <IonIcon icon={calendarOutline} className={`${styles.inputWrapIcon} ${styles.inputWrapIconRed}`} />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="03.04.2025"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', marginTop: 0.25, gap: 0.25 }}>
                <input
                  type="text"
                  className={styles.inputSmall}
                  placeholder="дней"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  style={{ marginLeft: 0 }}
                />
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.inputWrap}>
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                placeholder="120000"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
        </section>

        {/* Информация о грузе */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Информация о грузе</h3>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Вес (т)</label>
              <div className={styles.inputWrap}>
                <input
                  type="number"
                  inputMode="decimal"
                  className={styles.input}
                  placeholder="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Объем (м³)</label>
              <div className={styles.inputWrap}>
                <input
                  type="number"
                  inputMode="decimal"
                  className={styles.input}
                  placeholder="0"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Описание груза</label>
            <textarea
              className={styles.textarea}
              placeholder="Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.checkboxRow}>
            <IonCheckbox
              className={styles.checkbox}
              checked={multiplePerformers}
              onIonChange={(e) => setMultiplePerformers(e.detail.checked)}
            />
            <span className={styles.checkboxLabel}>
              Несколько исполнителей (заказ могут взять несколько исполнителей)
            </span>
          </div>
        </section>

        {/* Доп. поля над кнопкой */}
        <div className={styles.extraFields}>
          <input type="text" className={styles.extraField} placeholder="" />
          <input type="text" className={styles.extraField} placeholder="" />
        </div>

        <IonButton
          className={styles.nextButton}
          expand="block"
          color="primary"
          onClick={handleNext}
          disabled={isSubmitting || !name.trim()}
        >
          Далее
        </IonButton>
      </div>
    </div>
  );
};
