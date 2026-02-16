import React, { useState, useEffect } from 'react';
import { IonIcon, IonButton, IonCheckbox, IonInput } from '@ionic/react';
import { locationOutline, calendarOutline } from 'ionicons/icons';
import { WizardHeader } from '../../Header/WizardHeader';
import { CargoInfo, EMPTY_CARGO, CargoAddress } from '../../../Store/cargoStore';
import { useLoginStore } from '../../../Store/loginStore';
import { CityField } from '../../DataEditor/fields/СityField';
import { AddressField } from '../../DataEditor/fields/AddressField';
import styles from './CargoNew.module.css';

interface CargoNewProps {
  cargo: CargoInfo;
  onBack: () => void;
  onUpdate: (guid: string, data: CargoInfo) => Promise<boolean>;
  onCreate: (data: CargoInfo) => Promise<boolean>;
}

// Форматирование даты для input[type="date"] (YYYY-MM-DD)
const formatDateForInput = (dateString: string): string => {
  if (!dateString || dateString.length < 10) return '';
  return dateString.slice(0, 10);
};

// Форматирование числа с пробелами (150000 -> "150 000")
const formatNumber = (value: number | string): string => {
  if (!value && value !== 0) return '';
  const numStr = String(value).replace(/\s/g, '');
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Удаление форматирования из числа ("150 000" -> 150000)
const unformatNumber = (value: string): number => {
  return Number(value.replace(/\s/g, '')) || 0;
};

export const CargoNew: React.FC<CargoNewProps> = ({ cargo: initialCargo, onBack, onUpdate, onCreate }) => {
  const userName = useLoginStore(state => state.name);
  const userPhone = useLoginStore(state => state.phone);
  const [info, setInfo] = useState<CargoInfo>(initialCargo || { ...EMPTY_CARGO });
  const [multiplePerformers, setMultiplePerformers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(initialCargo?.guid);

  useEffect(() => {
    if (initialCargo?.guid) {
      // При редактировании используем данные из груза
      setInfo(initialCargo);
    } else {
      // При создании нового груза заполняем контактные данные текущего пользователя
      setInfo({
        ...EMPTY_CARGO,
        face: userName || '',
        phone: userPhone || ''
      });
    }
  }, [initialCargo?.guid, userName, userPhone]);

  const buildCargo = (): CargoInfo => {
    return {
      ...info,
      guid: info.guid || initialCargo.guid,
      name: info.name?.trim() || EMPTY_CARGO.name,
      description: info.description?.trim() || EMPTY_CARGO.description,
      price: info.price || 0,
      cost: info.cost || info.price || 0
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
      <WizardHeader title={isEdit ? 'Редактировать груз' : 'Добавить груз'} 
        onBack  = { onBack }  
        onSave  = { handleNext }
      />

      <div className={styles.content}>
        {/* Информация о грузе */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Информация о грузе</h3>

          <div className={styles.field}>
            <label className={styles.label}>Наименование груза</label>
            <div className={styles.inputWrap}>
              <input
                type="text"
                className={styles.input}
                placeholder="Наименование груза"
                value={info.name || ''}
                onChange={(e) => setInfo({ ...info, name: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Вес (т)</label>
              <div className={styles.inputWrap}>
                <input
                  type="number"
                  inputMode="decimal"
                  className={styles.input}
                  placeholder="0"
                  value={info.weight || ''}
                  onChange={(e) => setInfo({ ...info, weight: Number(e.target.value) || 0 })}
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
                  value={info.volume || ''}
                  onChange={(e) => setInfo({ ...info, volume: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Цена</label>
            <div className={styles.inputWrap}>
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                placeholder="Цена"
                value={formatNumber(info.price || info.cost || '')}
                onChange={(e) => {
                  const numValue = unformatNumber(e.target.value);
                  setInfo({ ...info, price: numValue });
                }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Стоимость груза</label>
            <div className={styles.inputWrap}>
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                placeholder="Стоимость груза"
                value={formatNumber(info.cost || '')}
                onChange={(e) => {
                  const numValue = unformatNumber(e.target.value);
                  setInfo({ ...info, cost: numValue });
                }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Описание груза</label>
            <textarea
              className={styles.textarea}
              placeholder="Описание"
              value={info.description || ''}
              onChange={(e) => setInfo({ ...info, description: e.target.value })}
            />
          </div>

        </section>

        {/* Отправка */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Отправка</h3>

          <div className={styles.field}>
            <CityField
              label="Город отправки"
              value={info.address?.city || EMPTY_CARGO.address.city}
              onChange={(cityData) => setInfo({ 
                ...info, 
                address: { 
                  ...(info.address || EMPTY_CARGO.address),
                  city: cityData
                } 
              })}
              onFIAS={(fias) => setInfo({ 
                ...info, 
                address: { 
                  ...(info.address || EMPTY_CARGO.address),
                  fias: fias || info.address?.fias || ''
                } 
              })}
            />
          </div>

          <div className={styles.field}>
            <AddressField
              label="Точный адрес"
              value={{
                address: info.address?.address || '',
                fias: info.address?.fias || '',
                lat: info.address?.lat ? String(info.address.lat) : '',
                lon: info.address?.lon ? String(info.address.lon) : ''
              }}
              onChange={(addressData) => setInfo({ 
                ...info, 
                address: { 
                  ...(info.address || EMPTY_CARGO.address),
                  address: addressData.address,
                  fias: addressData.fias || info.address?.fias || '',
                  lat: addressData.lat ? Number(addressData.lat) : (info.address?.lat || 0),
                  lon: addressData.lon ? Number(addressData.lon) : (info.address?.lon || 0)
                } 
              })}
              cityFias={info.address?.fias}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Дата отправки</label>
            <div className={styles.inputWrap}>
              <IonIcon icon={calendarOutline} className={`${styles.inputWrapIcon} ${styles.inputWrapIconBlue}`} />
              <IonInput
                type="date"
                className={styles.input}
                placeholder="Дата отправки"
                value={formatDateForInput(info.pickup_date || '')}
                onIonInput={(e) => {
                  const value = e.detail.value || '';
                  setInfo({ ...info, pickup_date: value || info.pickup_date });
                }}
              />
            </div>
          </div>

        </section>

        {/* Прибытие */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Прибытие</h3>

          <div className={styles.field}>
            <CityField
              label="Город прибытия"
              value={info.destiny?.city || EMPTY_CARGO.destiny.city}
              onChange={(cityData) => setInfo({ 
                ...info, 
                destiny: { 
                  ...(info.destiny || EMPTY_CARGO.destiny),
                  city: cityData
                } 
              })}
              onFIAS={(fias) => setInfo({ 
                ...info, 
                destiny: { 
                  ...(info.destiny || EMPTY_CARGO.destiny),
                  fias: fias || info.destiny?.fias || ''
                } 
              })}
            />
          </div>

          <div className={styles.field}>
            <AddressField
              label="Точный адрес"
              value={{
                address: info.destiny?.address || '',
                fias: info.destiny?.fias || '',
                lat: info.destiny?.lat ? String(info.destiny.lat) : '',
                lon: info.destiny?.lon ? String(info.destiny.lon) : ''
              }}
              onChange={(addressData) => setInfo({ 
                ...info, 
                destiny: { 
                  ...(info.destiny || EMPTY_CARGO.destiny),
                  address: addressData.address,
                  fias: addressData.fias || info.destiny?.fias || '',
                  lat: addressData.lat ? Number(addressData.lat) : (info.destiny?.lat || 0),
                  lon: addressData.lon ? Number(addressData.lon) : (info.destiny?.lon || 0)
                } 
              })}
              cityFias={info.destiny?.fias}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Дата прибытия</label>
            <div className={styles.inputWrap}>
              <IonIcon icon={calendarOutline} className={`${styles.inputWrapIcon} ${styles.inputWrapIconRed}`} />
              <IonInput
                type="date"
                className={styles.input}
                placeholder="Дата прибытия"
                value={formatDateForInput(info.delivery_date || '')}
                onIonInput={(e) => {
                  const value = e.detail.value || '';
                  setInfo({ ...info, delivery_date: value || info.delivery_date });
                }}
              />
            </div>
          </div>

        </section>

        {/* Контактное лицо */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Контактное лицо</h3>

          <div className={styles.field}>
            <label className={styles.label}>Контактное лицо</label>
            <div className={styles.inputWrap}>
              <input
                type="text"
                className={styles.input}
                placeholder="ФИО контактного лица"
                value={info.face || ''}
                onChange={(e) => setInfo({ ...info, face: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Номер телефона</label>
            <div className={styles.inputWrap}>
              <input
                type="tel"
                inputMode="tel"
                className={styles.input}
                placeholder="+7 (999) 123-45-67"
                value={info.phone || ''}
                onChange={(e) => {
                  const phoneValue = e.target.value.replace(/\D/g, '');
                  setInfo({ ...info, phone: phoneValue });
                }}
              />
            </div>
          </div>

        </section>


        <IonButton
          className = { styles.nextButton }
          expand    = "block"
          color     = "primary"
          onClick   = { handleNext }
          disabled  = { isSubmitting || !info.name?.trim() }
        >
          Добавить
        </IonButton>
      </div>
    </div>
  );
};
