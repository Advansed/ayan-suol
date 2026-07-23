import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { cameraOutline, imageOutline, carOutline } from 'ionicons/icons';
import { TransportData } from '../../../Store/transportStore';
import styles from './TransportPage.module.css';

interface DriverInfoProps {
  transportData: TransportData | null;
  onSave: (data: Partial<TransportData>) => Promise<void>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DriverInfo: React.FC<DriverInfoProps> = ({
  transportData,
  onSave,
  onImageUpload,
}) => {
  const [formData, setFormData] = useState({
    transportType: '',
    licensePlate: '',
    vin: '',
    manufactureYear: '',
    loadCapacity: '',
    experience: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transportData) {
      setFormData({
        transportType: transportData.transport_type || transportData.type || '',
        licensePlate: transportData.license_plate || transportData.number || '',
        vin: transportData.vin || '',
        manufactureYear:
          transportData.manufacture_year?.toString() ||
          transportData.year?.toString() ||
          '',
        loadCapacity:
          transportData.load_capacity?.toString() ||
          transportData.capacity?.toString() ||
          '',
        experience:
          transportData.experience?.toString() ||
          transportData.exp?.toString() ||
          '',
      });
    }
  }, [transportData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const saveData: Partial<TransportData> = {};

    if (formData.transportType.trim()) {
      saveData.transport_type = formData.transportType.trim();
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
  const typeLabel =
    formData.transportType ||
    transportData?.transport_type ||
    transportData?.type ||
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
              <label className={styles.label}>Тип транспорта</label>
              <input
                type="text"
                className={styles.input}
                value={formData.transportType}
                onChange={(e) => handleInputChange('transportType', e.target.value)}
                placeholder="Фура, Газель…"
              />
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
                src={transportData.image}
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
              accept="image/png,image/jpeg,image/jpg"
              onChange={onImageUpload}
              id="transport-photo-upload"
              className={styles.fileInput}
            />
            <IonButton
              color="primary"
              fill="outline"
              className={styles.uploadBtn}
              onClick={() =>
                document.getElementById('transport-photo-upload')?.click()
              }
            >
              <IonIcon icon={cameraOutline} slot="start" />
              {transportData?.image ? 'Заменить фото' : 'Загрузить фото'}
            </IonButton>
            <p className={styles.uploadInfo}>PNG или JPG, не более 12 МБ</p>
          </div>
        </section>
      </div>
    </div>
  );
};
