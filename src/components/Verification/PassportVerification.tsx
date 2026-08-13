import React, { useCallback, useEffect, useState } from 'react';
import { IonLoading } from '@ionic/react';
import { ChevronLeft } from 'lucide-react';
import { useLoginStore, loginGetters } from '../../Store/loginStore';
import { useToast } from '../Toast';
import { usePassport } from '../../Store/usePassport';
import type { PassportAddress, PassportData } from '../../Store/passportStore';
import { AddressField } from '../DataEditor/fields/AddressField';
import { takePicture } from '../Files';
import { getFotosUrl, checkPassportPhoto } from '../../utils/fileUpload';
import styles from './PassportVerification.module.css';

interface PassportVerificationProps {
  onBack: () => void;
}

type FormErrors = Record<string, string>;

const EMPTY_ADDRESS: PassportAddress                                      = {
  address: '',
  fias: '',
  lat: 0,
  lon: 0,
};

const EMPTY_FORM: PassportData                                            = {
  series: '',
  number: '',
  issue_date: '',
  issued_by: '',
  birth_date: '',
  birth_place: '',
  reg_address: EMPTY_ADDRESS,
  act_address: EMPTY_ADDRESS,
  main_photo: '',
  reg_photo: '',
};

const normalizeAddress                                                    = (value?: PassportAddress | null): PassportAddress => {
  if (!value) return { ...EMPTY_ADDRESS };
  return {
    address: value.address || '',
    fias: value.fias || '',
    lat: Number(value.lat) || 0,
    lon: Number(value.lon) || 0,
  };
}

const toAddressFieldValue                                                 = (value?: PassportAddress | null) => {
  const address = normalizeAddress(value);
  return {
    address: address.address,
    fias: address.fias,
    lat: address.lat ? String(address.lat) : '',
    lon: address.lon ? String(address.lon) : '',
  };
}

const isViewableUrl                                                       = (value?: unknown): boolean => {
  if (value == null) return false;
  const s = typeof value === 'string' ? value : String(value);
  if (!s || s === '[object Object]') return false;
  return /^https?:\/\//i.test(s) || s.startsWith('data:');
}

const toPhotoPath                                                         = (value?: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    const candidate = o.filePath ?? o.path ?? o.url ?? o.src ?? o.value;
    return typeof candidate === 'string' ? candidate : '';
  }
  return String(value);
}

export const PassportVerification: React.FC<PassportVerificationProps>    = ({ onBack }) => {
  const toast = useToast();
  const agreements = useLoginStore((s) => s.agreements);
  const { passportData, load, save, isLoading, isSaving } = usePassport();

  const [form, setForm] = useState<PassportData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoLoading, setPhotoLoading] = useState<'main' | 'reg' | null>(null);
  const [checkingFront, setCheckingFront] = useState(false);
  /** Превью через getFotos; в set_passport уходит filePath из form */
  const [photoPreview, setPhotoPreview] = useState<{ main: string; reg: string }>({
    main: '',
    reg: '',
  });

  useEffect(() => {
    if (!passportData) load();
  }, [passportData, load]);

  useEffect(() => {
    if (!passportData) return;
    setForm({
      series: passportData.series || '',
      number: passportData.number || '',
      issue_date: passportData.issue_date || '',
      issued_by: passportData.issued_by || '',
      birth_date: passportData.birth_date || '',
      birth_place: passportData.birth_place || '',
      reg_address: normalizeAddress(passportData.reg_address),
      act_address: normalizeAddress(passportData.act_address),
      main_photo: toPhotoPath(passportData.main_photo),
      reg_photo: toPhotoPath(passportData.reg_photo),
      isVerified: passportData.isVerified,
    });
    // Превью через getFotos по filePath (не через signed URL)
    const mainPath = toPhotoPath(passportData.main_photo);
    const regPath = toPhotoPath(passportData.reg_photo);
    setPhotoPreview({
      main: mainPath
        ? (isViewableUrl(mainPath) ? mainPath : getFotosUrl(mainPath))
        : '',
      reg: regPath
        ? (isViewableUrl(regPath) ? regPath : getFotosUrl(regPath))
        : '',
    });
  }, [passportData]);

  useEffect(() => {
    if (!agreements.personalData) {
      toast.info('Сперва надо принять согласие на обработку персональных данных');
      onBack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField                  = useCallback(<K extends keyof PassportData>(key: K, value: PassportData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const capturePhoto              = useCallback(async (kind: 'main' | 'reg') => {
    const token = loginGetters.getToken();
    const userId = loginGetters.getUserId();

    if (!token || !userId) {
      toast.error('Нет токена авторизации');
      return;
    }

    setPhotoLoading(kind);
    try {
      const photo = await takePicture();
      if (!photo?.dataUrl) return;

      const { uploadFileToDocs, getImageExtension } = await import('../../utils/fileUpload');
      const ext = getImageExtension(photo.dataUrl);
      const name = kind === 'main' ? 'passport_front' : 'passport_reg';
      const filename = `${userId}/passport/${name}.${ext}`;

      const { filePath, signUrl } = await uploadFileToDocs(photo.dataUrl, filename);

      if (!filePath) {
        throw new Error('Сервер не вернул filePath');
      }

      // В set_passport — filePath; превью — getFotos
      setField(kind === 'main' ? 'main_photo' : 'reg_photo', filePath);
      setPhotoPreview((prev) => ({
        ...prev,
        [kind]: signUrl || getFotosUrl(filePath, token),
      }));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Не удалось загрузить фото');
    } finally {
      setPhotoLoading(null);
    }
  }, [setField, toast]);

  const checkFrontPhoto           = useCallback(async () => {
    if (!form.main_photo) {
      toast.error('Сначала загрузите фото лицевой стороны');
      return;
    }

    setCheckingFront(true);
    try {
      const result = await checkPassportPhoto(form.main_photo);
      console.log('check_passport_photo', result);
      const payload = result?.data && typeof result.data === 'object' ? result.data : result;

      // Если API вернул распознанные поля — подставляем в форму
      if (payload?.series) setField('series', String(payload.series));
      if (payload?.number) setField('number', String(payload.number));
      if (payload?.issue_date) setField('issue_date', String(payload.issue_date));
      if (payload?.issued_by) setField('issued_by', String(payload.issued_by));
      if (payload?.birth_date) setField('birth_date', String(payload.birth_date));
      if (payload?.birth_place) setField('birth_place', String(payload.birth_place));

      toast.success(result?.message || 'Лицевая сторона паспорта проверена');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Ошибка проверки фото');
    } finally {
      setCheckingFront(false);
    }
  }, [form.main_photo, setField, toast]);

  const validate                  = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!form.series?.trim()) next.series = 'Укажите серию';
    if (!form.number?.trim()) next.number = 'Укажите номер';
    if (!form.issue_date) next.issue_date = 'Укажите дату выдачи';
    if (!form.issued_by?.trim()) next.issued_by = 'Укажите, кем выдан';
    if (!form.birth_date) next.birth_date = 'Укажите дату рождения';
    if (!form.birth_place?.trim()) next.birth_place = 'Укажите место рождения';
    if (!form.reg_address?.address || !form.reg_address?.fias) {
      next.reg_address = 'Выберите адрес регистрации';
    }
    if (!form.act_address?.address || !form.act_address?.fias) {
      next.act_address = 'Выберите фактический адрес';
    }
    if (!form.main_photo) next.main_photo = 'Добавьте фото лицевой стороны';
    if (!form.reg_photo) next.reg_photo = 'Добавьте фото прописки';

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  const handleSave                = useCallback(() => {
    if (!validate()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    save({
      series: form.series?.trim(),
      number: form.number?.trim(),
      issue_date: form.issue_date,
      issued_by: form.issued_by?.trim(),
      birth_date: form.birth_date,
      birth_place: form.birth_place?.trim(),
      reg_address: normalizeAddress(form.reg_address),
      act_address: normalizeAddress(form.act_address),
      main_photo: form.main_photo,
      reg_photo: form.reg_photo,
      isVerified: passportData?.isVerified ?? false,
    });
  }, [form, passportData?.isVerified, save, toast, validate]);

  return (
    <div className={styles.page}>
      <IonLoading
        isOpen={isLoading || isSaving || checkingFront}
        message={checkingFront ? 'Проверка фото...' : 'Сохранение...'}
      />

      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={20} strokeWidth={2} />
          К профилю
        </button>
      </div>

      <div className={styles.content}>
        <section className={styles.card}>
          <div className={styles.cardKicker}>Паспорт</div>
          <h2 className={styles.cardTitle}>Паспортные данные</h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Серия</label>
              <input
                className={`${styles.input} ${errors.series ? styles.inputError : ''}`}
                value={form.series || ''}
                onChange={(e) => setField('series', e.target.value)}
                placeholder="0000"
              />
              {errors.series && <span className={styles.error}>{errors.series}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Номер</label>
              <input
                className={`${styles.input} ${errors.number ? styles.inputError : ''}`}
                value={form.number || ''}
                onChange={(e) => setField('number', e.target.value)}
                placeholder="000000"
              />
              {errors.number && <span className={styles.error}>{errors.number}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Дата выдачи</label>
              <input
                type="date"
                className={`${styles.input} ${errors.issue_date ? styles.inputError : ''}`}
                value={form.issue_date || ''}
                onChange={(e) => setField('issue_date', e.target.value)}
              />
              {errors.issue_date && <span className={styles.error}>{errors.issue_date}</span>}
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>Кем выдан</label>
              <input
                className={`${styles.input} ${errors.issued_by ? styles.inputError : ''}`}
                value={form.issued_by || ''}
                onChange={(e) => setField('issued_by', e.target.value)}
                placeholder="ОВД / МВД ..."
              />
              {errors.issued_by && <span className={styles.error}>{errors.issued_by}</span>}
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardKicker}>Личные данные</div>
          <h2 className={styles.cardTitle}>Персональные данные</h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Дата рождения</label>
              <input
                type="date"
                className={`${styles.input} ${errors.birth_date ? styles.inputError : ''}`}
                value={form.birth_date || ''}
                onChange={(e) => setField('birth_date', e.target.value)}
              />
              {errors.birth_date && <span className={styles.error}>{errors.birth_date}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Место рождения</label>
              <input
                className={`${styles.input} ${errors.birth_place ? styles.inputError : ''}`}
                value={form.birth_place || ''}
                onChange={(e) => setField('birth_place', e.target.value)}
                placeholder="Город, область"
              />
              {errors.birth_place && <span className={styles.error}>{errors.birth_place}</span>}
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardKicker}>Адреса</div>
          <h2 className={styles.cardTitle}>Адресные данные</h2>
          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <AddressField
                label="Адрес регистрации"
                value={toAddressFieldValue(form.reg_address)}
                error={errors.reg_address}
                onChange={(value) =>
                  setField('reg_address', {
                    address: value.address,
                    fias: value.fias,
                    lat: Number(value.lat) || 0,
                    lon: Number(value.lon) || 0,
                  })
                }
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <AddressField
                label="Фактический адрес"
                value={toAddressFieldValue(form.act_address)}
                error={errors.act_address}
                onChange={(value) =>
                  setField('act_address', {
                    address: value.address,
                    fias: value.fias,
                    lat: Number(value.lat) || 0,
                    lon: Number(value.lon) || 0,
                  })
                }
              />
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardKicker}>Документы</div>
          <h2 className={styles.cardTitle}>Фото паспорта</h2>
          <div className={styles.photos}>
            <div className={styles.photoCard}>
              <div className={styles.photoTitle}>Лицевая сторона</div>
              <div className={styles.photoPreview}>
                {photoPreview.main ? (
                  <img src={photoPreview.main} alt="Лицевая сторона паспорта" />
                ) : form.main_photo ? (
                  <div className={styles.photoEmpty}>Фото загружено (путь сохранён)</div>
                ) : (
                  <div className={styles.photoEmpty}>Добавьте фото разворота с фотографией</div>
                )}
              </div>
              {errors.main_photo && <span className={styles.error}>{errors.main_photo}</span>}
              <div className={styles.photoActions}>
                <button
                  type="button"
                  className={styles.photoBtn}
                  onClick={() => capturePhoto('main')}
                  disabled={photoLoading === 'main' || checkingFront}
                >
                  {photoLoading === 'main' ? 'Загрузка...' : form.main_photo ? 'Заменить' : 'Сделать фото'}
                </button>
                {form.main_photo && (
                  <button
                    type="button"
                    className={styles.photoBtn}
                    onClick={checkFrontPhoto}
                    disabled={checkingFront || photoLoading === 'main'}
                  >
                    {checkingFront ? 'Проверка...' : 'Проверить'}
                  </button>
                )}
                {form.main_photo && (
                  <button
                    type="button"
                    className={styles.photoBtnGhost}
                    onClick={() => {
                      setField('main_photo', '');
                      setPhotoPreview((prev) => ({ ...prev, main: '' }));
                    }}
                    disabled={checkingFront}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>

            <div className={styles.photoCard}>
              <div className={styles.photoTitle}>Прописка</div>
              <div className={styles.photoPreview}>
                {photoPreview.reg ? (
                  <img src={photoPreview.reg} alt="Страница прописки" />
                ) : form.reg_photo ? (
                  <div className={styles.photoEmpty}>Фото загружено (путь сохранён)</div>
                ) : (
                  <div className={styles.photoEmpty}>Добавьте фото страницы регистрации</div>
                )}
              </div>
              {errors.reg_photo && <span className={styles.error}>{errors.reg_photo}</span>}
              <div className={styles.photoActions}>
                <button
                  type="button"
                  className={styles.photoBtn}
                  onClick={() => capturePhoto('reg')}
                  disabled={photoLoading === 'reg'}
                >
                  {photoLoading === 'reg' ? 'Загрузка...' : form.reg_photo ? 'Заменить' : 'Сделать фото'}
                </button>
                {form.reg_photo && (
                  <button
                    type="button"
                    className={styles.photoBtnGhost}
                    onClick={() => {
                      setField('reg_photo', '');
                      setPhotoPreview((prev) => ({ ...prev, reg: '' }));
                    }}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.hint}>
            Проверьте данные перед отправкой. После сохранения документы уйдут на проверку.
          </p>
        </section>

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={onBack}>
            Отмена
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={isSaving}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
