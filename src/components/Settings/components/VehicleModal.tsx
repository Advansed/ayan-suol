import React, { useEffect, useRef, useState } from 'react';
import { Camera, Truck, X } from 'lucide-react';
import {
  TransportData,
  useTransportTypes,
  resolveTransportTypeId,
  asTransportType,
  toTransportTypeId,
  transportDisplayName,
  transportDriverName,
} from '../../../Store/transportStore';
import { resolveImageSrc, uploadTransportPhoto } from '../../../utils/fileUpload';
import { useToast } from '../../Toast';
import styles from './VehicleModal.module.css';

type VehicleModalProps = {
  vehicle: TransportData | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (data: Partial<TransportData>) => Promise<void>;
};

export const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  saving = false,
  onClose,
  onSave,
}) => {
  const types = useTransportTypes();
  const toast = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(vehicle?.guid);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    licensePlate: '',
    transportType: '',
    loadCapacity: '',
    volume: '',
    manufactureYear: '',
    driverFio: '',
    driverPhone: '',
  });

  useEffect(() => {
    setForm({
      name: transportDisplayName(vehicle),
      licensePlate: vehicle?.license_plate || vehicle?.number || '',
      transportType: resolveTransportTypeId(vehicle?.transport_type, types, vehicle?.type),
      loadCapacity: String(vehicle?.load_capacity ?? vehicle?.capacity ?? ''),
      volume: String(vehicle?.volume ?? ''),
      manufactureYear: String(vehicle?.manufacture_year ?? vehicle?.year ?? ''),
      driverFio: transportDriverName(vehicle),
      driverPhone: vehicle?.driver_phone || (typeof vehicle?.driver === 'object' ? vehicle.driver?.phone || '' : ''),
    });
    setPhotoFile(null);
    setPhotoPreview(vehicle?.image ? resolveImageSrc(vehicle.image) : '');
  }, [vehicle, types]);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const currentType = asTransportType(vehicle?.transport_type);
  const busy = saving || photoUploading;
  const canSubmit = Boolean(form.name.trim() && form.licensePlate.trim() && !busy);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|webp)$/i)) {
      toast.error('Формат файла должен быть PNG, JPG или WebP');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 12 МБ');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    const data: Partial<TransportData> = {
      name: form.name.trim(),
      license_plate: form.licensePlate.trim(),
      driver_fio: form.driverFio.trim(),
      driver_phone: form.driverPhone.trim(),
    };

    if (form.transportType.trim()) {
      data.transport_type = toTransportTypeId(form.transportType);
    }
    if (form.loadCapacity.trim()) {
      const tons = parseFloat(form.loadCapacity.replace(',', '.'));
      if (!isNaN(tons)) data.load_capacity = tons;
    }
    if (form.volume.trim()) {
      const volume = parseFloat(form.volume.replace(',', '.'));
      if (!isNaN(volume)) data.volume = volume;
    }
    if (form.manufactureYear.trim()) {
      const year = parseInt(form.manufactureYear, 10);
      if (!isNaN(year)) data.manufacture_year = year;
    }

    if (photoFile) {
      setPhotoUploading(true);
      try {
        const { filePath } = await uploadTransportPhoto(photoFile, vehicle?.guid);
        if (!filePath) throw new Error('Сервер не вернул путь к файлу');
        data.image = filePath;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Не удалось загрузить фото');
        setPhotoUploading(false);
        return;
      }
      setPhotoUploading(false);
    } else if (vehicle?.image) {
      data.image = vehicle.image;
    }

    await onSave(data);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.head}>
          <h2 id="vehicle-modal-title" className={styles.title}>
            {isEdit ? 'Изменить машину' : 'Добавить машину'}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.photoField}>
            <span>Фото машины</span>
            <button
              type="button"
              className={styles.photoFrame}
              onClick={() => photoInputRef.current?.click()}
              disabled={busy}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Фото машины" className={styles.photoImg} />
              ) : (
                <div className={styles.photoEmpty}>
                  <Truck size={36} strokeWidth={1.5} />
                  <p>Добавьте фото кузова или машины</p>
                  <span>PNG, JPG или WebP, до 12 МБ</span>
                </div>
              )}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className={styles.fileInput}
              onChange={handlePhotoChange}
              disabled={busy}
            />
            <button
              type="button"
              className={styles.photoBtn}
              onClick={() => photoInputRef.current?.click()}
              disabled={busy}
            >
              <Camera size={16} strokeWidth={2} />
              {photoUploading
                ? 'Загрузка…'
                : photoPreview
                  ? 'Заменить фото'
                  : 'Загрузить фото'}
            </button>
          </div>

          <label className={styles.field}>
            <span>
              Марка и модель <i>*</i>
            </span>
            <input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Например, МАЗ 5440"
            />
          </label>

          <div className={styles.row2}>
            <label className={styles.field}>
              <span>
                Гос. номер <i>*</i>
              </span>
              <input
                value={form.licensePlate}
                onChange={(e) => setField('licensePlate', e.target.value)}
                placeholder="А 123 ВС 77"
              />
            </label>
            <label className={styles.field}>
              <span>Тип кузова</span>
              <select
                value={form.transportType}
                onChange={(e) => setField('transportType', e.target.value)}
              >
                <option value="">Выберите</option>
                {form.transportType &&
                  !types.some((type) => type.id === form.transportType) && (
                    <option value={form.transportType}>
                      {currentType?.name || 'Текущий тип'}
                    </option>
                  )}
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.row3}>
            <label className={styles.field}>
              <span>Тоннаж, т</span>
              <input
                type="number"
                step="0.1"
                value={form.loadCapacity}
                onChange={(e) => setField('loadCapacity', e.target.value)}
                placeholder="20"
              />
            </label>
            <label className={styles.field}>
              <span>Объём, м³</span>
              <input
                type="number"
                step="0.1"
                value={form.volume}
                onChange={(e) => setField('volume', e.target.value)}
                placeholder="82"
              />
            </label>
            <label className={styles.field}>
              <span>Год выпуска</span>
              <input
                type="number"
                value={form.manufactureYear}
                onChange={(e) => setField('manufactureYear', e.target.value)}
                placeholder="2021"
              />
            </label>
          </div>

          <div className={styles.row2}>
            <label className={styles.field}>
              <span>Водитель</span>
              <input
                value={form.driverFio}
                onChange={(e) => setField('driverFio', e.target.value)}
                placeholder="Фамилия И.О. (необязательно)"
              />
            </label>
            <label className={styles.field}>
              <span>Телефон водителя</span>
              <input
                type="tel"
                value={form.driverPhone}
                onChange={(e) => setField('driverPhone', e.target.value)}
                placeholder="+7 900 000-00-00"
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.submit} disabled={!canSubmit}>
              {busy ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить в парк'}
            </button>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
