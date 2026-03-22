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

/** Число → строка для поля веса/объёма (запятая как разделитель) */
const numberToDecimalDraft = (n: number | undefined): string => {
  if (n === undefined || n === null || Number.isNaN(n) || n === 0) return '';
  return String(n).replace('.', ',');
};

/** Нормализация ввода: только цифры и одна запятая; точка → запятая */
const normalizeDecimalInput = (raw: string): string => {
  let v = raw.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const firstComma = v.indexOf(',');
  if (firstComma !== -1) {
    v = v.slice(0, firstComma + 1) + v.slice(firstComma + 1).replace(/,/g, '');
  }
  return v;
};

/** Парсинг в число без потери промежуточного «0,» / «0.» при вводе */
const parseDecimalDraft = (raw: string): number => {
  const normalized = raw.replace(',', '.').replace(/\s/g, '');
  if (normalized === '' || normalized === '.' || normalized === '-') return 0;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
};

export const CargoNew: React.FC<CargoNewProps> = ({ cargo: initialCargo, onBack, onUpdate, onCreate }) => {
  const userName = useLoginStore(state => state.name);
  const userPhone = useLoginStore(state => state.phone);
  const [info, setInfo] = useState<CargoInfo>(initialCargo || { ...EMPTY_CARGO });
  const [multiplePerformers, setMultiplePerformers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weightDraft, setWeightDraft] = useState(() => numberToDecimalDraft(initialCargo?.weight));
  const [volumeDraft, setVolumeDraft] = useState(() => numberToDecimalDraft(initialCargo?.volume));

  const isEdit = Boolean(initialCargo?.guid);

  const cargoGuid = initialCargo?.guid;

  // Только смена режима / груза — без userName/userPhone, иначе форма сбрасывается после ввода городов
  useEffect(() => {
    if (cargoGuid) {
      setInfo(initialCargo);
      setWeightDraft(numberToDecimalDraft(initialCargo.weight));
      setVolumeDraft(numberToDecimalDraft(initialCargo.volume));
    } else {
      setInfo({
        ...EMPTY_CARGO,
        face: userName || '',
        phone: userPhone || ''
      });
      setWeightDraft('');
      setVolumeDraft('');
    }
    // Только cargoGuid: при том же guid не перезатираем правки при обновлении initialCargo из стора
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialCargo/userName из замыкания при смене guid
  }, [cargoGuid]);

  // Подставить ФИО/телефон из профиля, когда поля ещё пустые (не затираем уже введённое)
  useEffect(() => {
    if (cargoGuid) return;
    if (!userName && !userPhone) return;
    setInfo(prev => ({
      ...prev,
      face: prev.face || userName || '',
      phone: prev.phone || userPhone || ''
    }));
  }, [userName, userPhone, cargoGuid]);

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
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  placeholder="0"
                  value={weightDraft}
                  onChange={(e) => {
                    const v = normalizeDecimalInput(e.target.value);
                    setWeightDraft(v);
                    setInfo({ ...info, weight: parseDecimalDraft(v) });
                  }}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Объем (м³)</label>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  placeholder="0"
                  value={volumeDraft}
                  onChange={(e) => {
                    const v = normalizeDecimalInput(e.target.value);
                    setVolumeDraft(v);
                    setInfo({ ...info, volume: parseDecimalDraft(v) });
                  }}
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
              onChange={(cityData) => {
                setInfo(prev => ({
                  ...prev,
                  address: {
                    ...(prev.address || EMPTY_CARGO.address),
                    city: cityData,
                    fias: cityData.fias || prev.address?.fias || ''
                  }
                }));
              }}
              onFIAS={(fias) => {
                setInfo(prev => ({
                  ...prev,
                  address: {
                    ...(prev.address || EMPTY_CARGO.address),
                    fias: fias || prev.address?.fias || '',
                    city: prev.address?.city || EMPTY_CARGO.address.city
                  }
                }));
              }}
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
              onChange={(addressData) =>
                setInfo(prev => ({
                  ...prev,
                  address: {
                    ...(prev.address || EMPTY_CARGO.address),
                    address: addressData.address,
                    fias: addressData.fias || prev.address?.fias || '',
                    lat: addressData.lat ? Number(addressData.lat) : (prev.address?.lat || 0),
                    lon: addressData.lon ? Number(addressData.lon) : (prev.address?.lon || 0)
                  }
                }))
              }
              cityFias={info.address?.city?.fias || info.address?.fias}
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
              onChange={(cityData) => {
                setInfo(prev => ({
                  ...prev,
                  destiny: {
                    ...(prev.destiny || EMPTY_CARGO.destiny),
                    city: cityData,
                    fias: cityData.fias || prev.destiny?.fias || ''
                  }
                }));
              }}
              onFIAS={(fias) => {
                setInfo(prev => ({
                  ...prev,
                  destiny: {
                    ...(prev.destiny || EMPTY_CARGO.destiny),
                    fias: fias || prev.destiny?.fias || '',
                    city: prev.destiny?.city || EMPTY_CARGO.destiny.city
                  }
                }));
              }}
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
              onChange={(addressData) =>
                setInfo(prev => ({
                  ...prev,
                  destiny: {
                    ...(prev.destiny || EMPTY_CARGO.destiny),
                    address: addressData.address,
                    fias: addressData.fias || prev.destiny?.fias || '',
                    lat: addressData.lat ? Number(addressData.lat) : (prev.destiny?.lat || 0),
                    lon: addressData.lon ? Number(addressData.lon) : (prev.destiny?.lon || 0)
                  }
                }))
              }
              cityFias={info.destiny?.city?.fias || info.destiny?.fias}
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
