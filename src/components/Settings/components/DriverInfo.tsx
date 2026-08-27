import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { cameraOutline, imageOutline, carOutline } from 'ionicons/icons';
import {
  TransportData,
  useTransportTypes,
  resolveTransportTypeId,
  transportTypeName,
  asTransportType,
  toTransportTypeId,
  transportDisplayName,
} from '../../../Store/transportStore';
import { resolveImageSrc } from '../../../utils/fileUpload';
import styles from './TransportPage.module.css';

interface DriverInfoProps {
  transportData: TransportData | null;
  photoLoading?: boolean;
  onSave: (data: Partial<TransportData>) => Promise<void>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DriverInfo: React.FC<DriverInfoProps> = ({
  transportData,
  photoLoading = false,
  onSave,
  onImageUpload,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    transportType: '',
    licensePlate: '',
    vin: '',
    manufactureYear: '',
    loadCapacity: '',
    experience: '',
  });
  const [saving, setSaving] = useState(false);
  const types = useTransportTypes();

  useEffect(() => {
    setFormData({
      name: transportDisplayName(transportData),
      transportType: resolveTransportTypeId(
        transportData?.transport_type,
        types,
        transportData?.type
      ),
      licensePlate: transportData?.license_plate || transportData?.number || '',
      vin: transportData?.vin || '',
      manufactureYear:
        transportData?.manufacture_year?.toString() ||
        transportData?.year?.toString() ||
        '',
      loadCapacity:
        transportData?.load_capacity?.toString() ||
        transportData?.capacity?.toString() ||
        '',
      experience:
        transportData?.experience?.toString() ||
        transportData?.exp?.toString() ||
        '',
    });
  }, [transportData, types]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const saveData: Partial<TransportData> = {};

    if (formData.name.trim()) {
      saveData.name = formData.name.trim();
    }
    if (formData.transportType.trim()) {
      saveData.transport_type = toTransportTypeId(formData.transportType);
    }
    if (formData.licensePlate.trim()) {
      saveData.license_plate = formData.licensePlate.trim();
    }
    if (formData.vin.trim()) {
      saveData.vin = formData.vin.trim();
    }
    if (formData.manufactureYear.trim()) {
      const year = parseInt(formData.manufactureYear.trim(), 10);
      if (!isNaN(year)) saveData.manufacture_year = year;
    }
    if (formData.loadCapacity.trim()) {
      const capacity = parseFloat(formData.loadCapacity.trim());
      if (!isNaN(capacity)) saveData.load_capacity = capacity;
    }
    if (formData.experience.trim()) {
      const exp = parseInt(formData.experience.trim(), 10);
      if (!isNaN(exp)) saveData.experience = exp;
    }

    setSaving(true);
    try {
      await onSave(saveData);
    } finally {
      setSaving(false);
    }
  };

  const plate =
    formData.licensePlate ||
    transportData?.license_plate ||
    transportData?.number ||
    '';
  const currentType = asTransportType(transportData?.transport_type);
  const typeLabel =
    transportTypeName(formData.transportType, types) ||
    currentType?.name ||
    transportTypeName(transportData?.transport_type, types) ||
    'Транспорт';

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <section className={styles.formCard}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} aria-hidden>
              <IonIcon icon={carOutline} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Сведения о машине</h3>
              <p className={styles.cardSub}>Данные транспорта для заказов</p>
            </div>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>Наименование</label>
              <input
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Газель Next"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Тип кузова</label>
              <select
                className={`${styles.input} ${styles.select}`}
                value={formData.transportType}
                onChange={(e) => handleInputChange('transportType', e.target.value)}
              >
                <option value="">Выберите тип кузова</option>
                {formData.transportType &&
                  !types.some((type) => type.id === formData.transportType) && (
                    <option value={formData.transportType}>
                      {currentType?.name || currentType?.description || 'Текущий тип'}
                    </option>
                  )}
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Гос. номер</label>
              <input
                type="text"
                className={styles.input}
                value={formData.licensePlate}
                onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                placeholder="А123ВС777"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>VIN номер</label>
              <input
                type="text"
                className={styles.input}
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value)}
                placeholder="XTA…"
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Год выпуска</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.manufactureYear}
                  onChange={(e) =>
                    handleInputChange('manufactureYear', e.target.value)
                  }
                  placeholder="2022"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Грузоподъёмность (т)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.loadCapacity}
                  onChange={(e) =>
                    handleInputChange('loadCapacity', e.target.value)
                  }
                  placeholder="20"
                  step="0.1"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Опыт (лет)</label>
              <input
                type="number"
                className={styles.input}
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="5"
              />
            </div>
          </div>

          <IonButton
            color="primary"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Сохранение…' : 'Сохранить сведения'}
          </IonButton>
        </section>

        <section className={styles.photoCard}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} aria-hidden>
              <IonIcon icon={imageOutline} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Фото транспорта</h3>
              <p className={styles.cardSub}>
                {typeLabel}
                {plate ? ` · ${plate}` : ''}
              </p>
            </div>
          </div>

          <div className={styles.photoFrame}>
            {transportData?.image ? (
              <img
                src={resolveImageSrc(transportData.image)}
                alt="Фото транспорта"
                className={styles.photoImg}
              />
            ) : (
              <div className={styles.photoEmpty}>
                <IonIcon icon={carOutline} className={styles.photoEmptyIcon} />
                <p>Фото ещё не загружено</p>
                <span>Добавьте снимок кузова или машины</span>
              </div>
            )}
          </div>

          <div className={styles.uploadBlock}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={onImageUpload}
              id="transport-photo-upload"
              className={styles.fileInput}
              disabled={photoLoading}
            />
            <IonButton
              color="primary"
              fill="outline"
              className={styles.uploadBtn}
              disabled={photoLoading}
              onClick={() =>
                document.getElementById('transport-photo-upload')?.click()
              }
            >
              <IonIcon icon={cameraOutline} slot="start" />
              {photoLoading
                ? 'Загрузка…'
                : transportData?.image
                  ? 'Заменить фото'
                  : 'Загрузить фото'}
            </IonButton>
            <p className={styles.uploadInfo}>PNG, JPG или WebP, не более 12 МБ</p>
          </div>
        </section>
      </div>
    </div>
  );
};
