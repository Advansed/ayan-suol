import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Box,
  Cpu,
  FileText,
  GlassWater,
  Lock,
  MapPin,
  Navigation,
  Package,
  Phone,
  Shield,
  ShieldCheck,
  Snowflake,
  Truck,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import { CargoInfo, EMPTY_CARGO } from '../../../Store/cargoStore';
import { useLoginStore, useToken } from '../../../Store/loginStore';
import {
  resolveTransportTypeId,
  toTransportTypeId,
  useTransportTypes,
} from '../../../Store/transportStore';
import { useSocket } from '../../../Store/useSocket';
import { CityField } from '../../DataEditor/fields/СityField';
import { AddressField } from '../../DataEditor/fields/AddressField';
import { getPaymentLevel, type PaymentLevel } from '../../Works/feedFormat';
import styles from './CargoNew.module.css';

interface CargoNewProps {
  cargo: CargoInfo;
  onBack: () => void;
  onUpdate: (guid: string, data: CargoInfo) => Promise<boolean>;
  onCreate: (data: CargoInfo) => Promise<boolean>;
}

type InsuranceKind = 'simple' | 'fragile' | 'tech';

const FALLBACK_BODY_TYPES: Array<{ name: string; desc: string; Icon: typeof Truck }> = [
  { name: 'Тент', desc: 'Универсальный кузов для большинства грузов', Icon: Truck },
  { name: 'Рефрижератор', desc: 'С поддержанием температурного режима', Icon: Snowflake },
  { name: 'Фургон', desc: 'Закрытый кузов, защита от осадков', Icon: Box },
  { name: 'Бортовой', desc: 'Открытая платформа для негабарита', Icon: Package },
];

const ESCROW_OPTIONS: Array<{
  id: PaymentLevel;
  short: string;
  desc: string;
  light: 'green' | 'yellow' | 'red';
}> = [
  {
    id: 'full',
    short: 'Оплата на эскроу',
    desc: 'Вся сумма уже зарезервирована на эскроу-счёте и будет переведена после доставки.',
    light: 'green',
  },
  {
    id: 'partial',
    short: 'Часть на эскроу',
    desc: 'На эскроу-счёте зарезервирована часть суммы, остаток оплачивается напрямую.',
    light: 'yellow',
  },
  {
    id: 'none',
    short: 'Без эскроу',
    desc: 'Средства не зарезервированы. Оплата напрямую с заказчиком — повышенный риск.',
    light: 'red',
  },
];

const INSURANCE_OPTIONS: Array<{
  id: InsuranceKind;
  label: string;
  desc: string;
  rate: number;
  Icon: typeof Box;
}> = [
  {
    id: 'simple',
    label: 'Простой товар',
    desc: 'Стройматериалы, продукция без особых требований к хрупкости',
    rate: 1,
    Icon: Box,
  },
  {
    id: 'fragile',
    label: 'Хрупкий товар',
    desc: 'Керамика, мебель, стеклотара и другие бьющиеся грузы',
    rate: 2,
    Icon: GlassWater,
  },
  {
    id: 'tech',
    label: 'Техника, стекло',
    desc: 'Электроника, бытовая техника, листовое и оконное стекло',
    rate: 3,
    Icon: Cpu,
  },
];

const formatDateForInput = (dateString: string): string => {
  if (!dateString || dateString.length < 10) return '';
  return dateString.slice(0, 10);
};

const formatNumber = (value: number | string): string => {
  if (!value && value !== 0) return '';
  const numStr = String(value).replace(/\s/g, '');
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const unformatNumber = (value: string): number => {
  return Number(value.replace(/\s/g, '')) || 0;
};

const numberToDecimalDraft = (n: number | undefined): string => {
  if (n === undefined || n === null || Number.isNaN(n) || n === 0) return '';
  return String(n).replace('.', ',');
};

const normalizeDecimalInput = (raw: string): string => {
  let v = raw.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const firstComma = v.indexOf(',');
  if (firstComma !== -1) {
    v = v.slice(0, firstComma + 1) + v.slice(firstComma + 1).replace(/,/g, '');
  }
  return v;
};

const parseDecimalDraft = (raw: string): number => {
  const normalized = raw.replace(',', '.').replace(/\s/g, '');
  if (normalized === '' || normalized === '.' || normalized === '-') return 0;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
};

const resolveInsuranceKind = (cargo: CargoInfo): InsuranceKind => {
  const cost = Number(cargo.cost) || 0;
  const premium = Number(cargo.insurance) || 0;
  if (!cost || !premium) return 'simple';
  const rate = Math.round((premium / cost) * 100);
  if (rate >= 3) return 'tech';
  if (rate >= 2) return 'fragile';
  return 'simple';
};

export const CargoNew: React.FC<CargoNewProps> = ({
  cargo: initialCargo,
  onBack,
  onUpdate,
  onCreate,
}) => {
  const userName = useLoginStore((state) => state.name);
  const userPhone = useLoginStore((state) => state.phone);
  const token = useToken();
  const { emit } = useSocket();
  const transportTypes = useTransportTypes();

  useEffect(() => {
    if (transportTypes.length || !token) return;
    emit('get_transport_types', { token });
  }, [transportTypes.length, token, emit]);

  const [info, setInfo] = useState<CargoInfo>(initialCargo || { ...EMPTY_CARGO });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weightDraft, setWeightDraft] = useState(() =>
    numberToDecimalDraft(initialCargo?.weight)
  );
  const [volumeDraft, setVolumeDraft] = useState(() =>
    numberToDecimalDraft(initialCargo?.volume)
  );
  const [escrow, setEscrow] = useState<PaymentLevel>(() =>
    getPaymentLevel(initialCargo || EMPTY_CARGO)
  );
  const [escrowHeld, setEscrowHeld] = useState(() => Number(initialCargo?.advance) || 0);
  const [insuranceKind, setInsuranceKind] = useState<InsuranceKind>(() =>
    resolveInsuranceKind(initialCargo || EMPTY_CARGO)
  );
  const [transportTypeId, setTransportTypeId] = useState(() =>
    resolveTransportTypeId(
      initialCargo?.transport_type,
      [],
      initialCargo?.body_type
    )
  );
  const [capacityT, setCapacityT] = useState('');
  const [docs, setDocs] = useState<File[]>([]);

  const isEdit = Boolean(initialCargo?.guid);
  const cargoGuid = initialCargo?.guid;

  const bodyTypes = useMemo(
    () =>
      transportTypes.map((type) => {
        const fallback = FALLBACK_BODY_TYPES.find(
          (item) => item.name.toLowerCase() === type.name.toLowerCase()
        );
        return {
          id: type.id,
          name: type.name,
          desc: type.description || fallback?.desc || 'Тип кузова из справочника',
          Icon: fallback?.Icon || Truck,
        };
      }),
    [transportTypes]
  );

  useEffect(() => {
    if (!bodyTypes.length) return;
    setTransportTypeId((prev) => {
      if (prev && bodyTypes.some((type) => type.id === prev)) return prev;
      const fromCargo = resolveTransportTypeId(
        cargoGuid ? initialCargo?.transport_type : undefined,
        transportTypes,
        cargoGuid ? initialCargo?.body_type : undefined
      );
      return fromCargo || bodyTypes[0].id;
    });
  }, [bodyTypes, transportTypes, cargoGuid, initialCargo]);

  useEffect(() => {
    if (cargoGuid) {
      setInfo(initialCargo);
      setWeightDraft(numberToDecimalDraft(initialCargo.weight));
      setVolumeDraft(numberToDecimalDraft(initialCargo.volume));
      setEscrow(getPaymentLevel(initialCargo));
      setEscrowHeld(Number(initialCargo.advance) || 0);
      setInsuranceKind(resolveInsuranceKind(initialCargo));
      setTransportTypeId(
        resolveTransportTypeId(
          initialCargo.transport_type,
          transportTypes,
          initialCargo.body_type
        )
      );
      setCapacityT('');
      setDocs([]);
    } else {
      setInfo({
        ...EMPTY_CARGO,
        face: userName || '',
        phone: userPhone || '',
      });
      setWeightDraft('');
      setVolumeDraft('');
      setEscrow('full');
      setEscrowHeld(0);
      setInsuranceKind('simple');
      setTransportTypeId(bodyTypes[0]?.id || '');
      setCapacityT('');
      setDocs([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only on cargo switch
  }, [cargoGuid]);

  useEffect(() => {
    if (cargoGuid) return;
    if (!userName && !userPhone) return;
    setInfo((prev) => ({
      ...prev,
      face: prev.face || userName || '',
      phone: prev.phone || userPhone || '',
    }));
  }, [userName, userPhone, cargoGuid]);

  const cargoCost = Number(info.cost) || 0;
  const haulPrice = Number(info.price) || 0;
  const insuranceRate =
    INSURANCE_OPTIONS.find((item) => item.id === insuranceKind)?.rate ?? 1;
  const insurancePremium = Math.round((cargoCost * insuranceRate) / 100);
  const totalWithInsurance = haulPrice + insurancePremium;
  const escrowPercent =
    haulPrice > 0 && escrowHeld > 0
      ? Math.round((Math.min(escrowHeld, haulPrice) / haulPrice) * 100)
      : 0;

  useEffect(() => {
    if (escrow === 'full') setEscrowHeld(haulPrice);
    if (escrow === 'none') setEscrowHeld(0);
  }, [escrow, haulPrice]);

  const activeBody =
    bodyTypes.find((item) => item.id === transportTypeId) || bodyTypes[0];

  const buildCargo = (): CargoInfo => {
    const advance =
      escrow === 'full' ? haulPrice : escrow === 'partial' ? Number(escrowHeld) || 0 : 0;
    const selectedType = transportTypes.find((type) => type.id === transportTypeId);

    return {
      ...info,
      guid: info.guid || initialCargo.guid,
      name: info.name?.trim() || EMPTY_CARGO.name,
      description: info.description?.trim() || EMPTY_CARGO.description,
      price: haulPrice,
      cost: cargoCost,
      advance,
      insurance: insurancePremium,
      transport_type: transportTypeId ? toTransportTypeId(transportTypeId) : undefined,
      body_type: selectedType?.name || activeBody?.name || info.body_type || '',
      vehicles_total: 1,
      vehicles_busy: info.vehicles_busy || 0,
    };
  };

  const handleNext = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const cargo = buildCargo();
    if (!cargo.name?.trim()) return;

    setIsSubmitting(true);
    try {
      const ok =
        isEdit && cargo.guid
          ? await onUpdate(cargo.guid, cargo)
          : await onCreate(cargo);
      if (ok) onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <button type="button" className={styles.backBtn} onClick={onBack}>
        <ArrowLeft size={16} strokeWidth={2} />
        К моим заказам
      </button>

      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Кабинет заказчика</p>
        <h1 className={styles.title}>
          {isEdit ? 'Редактировать заказ' : 'Разместить заказ'}
        </h1>
        <p className={styles.subtitle}>
          {isEdit
            ? 'Измените детали груза и маршрута'
            : 'Заполните детали груза и маршрута'}
        </p>
      </header>

      <form className={styles.form} onSubmit={handleNext}>
        <Section icon={Package} title="Груз">
          <div className={styles.grid2}>
            <Field label="Наименование груза" className={styles.span2}>
              <input
                type="text"
                className={styles.input}
                placeholder="Например, строительные материалы"
                value={info.name || ''}
                onChange={(e) => setInfo({ ...info, name: e.target.value })}
                required
              />
            </Field>

            <Field label="Вес, т">
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
                required
              />
            </Field>

            <Field label="Объём, м³">
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
                required
              />
            </Field>

            <Field label="Стоимость груза, ₽" className={styles.span2}>
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                placeholder="0"
                value={formatNumber(info.cost || '')}
                onChange={(e) => {
                  setInfo({ ...info, cost: unformatNumber(e.target.value) });
                }}
                required
              />
            </Field>

            <Field label="Описание груза" className={styles.span2}>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="Упаковка, особенности погрузки, требования к температуре и т. д."
                value={info.description || ''}
                onChange={(e) => setInfo({ ...info, description: e.target.value })}
              />
            </Field>
          </div>
        </Section>

        <Section icon={Truck} title="Требуемый транспорт">
          {bodyTypes.length === 0 ? (
            <p className={styles.bodyHint}>Загружаем типы транспорта…</p>
          ) : (
            <>
              <div className={styles.bodyGrid}>
                {bodyTypes.map((type) => {
                  const selected = transportTypeId === type.id;
                  const Icon = type.Icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      className={`${styles.bodyCard} ${selected ? styles.bodyCardActive : ''}`}
                      onClick={() => setTransportTypeId(type.id)}
                    >
                      <Icon size={16} strokeWidth={1.75} />
                      <span>{type.name}</span>
                    </button>
                  );
                })}
              </div>

              {activeBody && <p className={styles.bodyHint}>{activeBody.desc}</p>}
            </>
          )}

          <Field label="Требуемая грузоподъёмность, т" className={styles.mt3}>
            <input
              type="text"
              inputMode="decimal"
              className={styles.input}
              placeholder="0"
              value={capacityT}
              onChange={(e) => setCapacityT(normalizeDecimalInput(e.target.value))}
            />
          </Field>
        </Section>

        <Section icon={MapPin} title="Пункт отправки">
          <div className={styles.grid2}>
            <div className={styles.dadata}>
              <CityField
                label="Город и страна отправки"
                value={info.address?.city || EMPTY_CARGO.address.city}
                onChange={(cityData) => {
                  setInfo((prev) => ({
                    ...prev,
                    address: {
                      ...(prev.address || EMPTY_CARGO.address),
                      city: cityData,
                      fias: cityData.fias || prev.address?.fias || '',
                    },
                  }));
                }}
                onFIAS={(fias) => {
                  setInfo((prev) => ({
                    ...prev,
                    address: {
                      ...(prev.address || EMPTY_CARGO.address),
                      fias: fias || prev.address?.fias || '',
                      city: prev.address?.city || EMPTY_CARGO.address.city,
                    },
                  }));
                }}
              />
            </div>

            <Field label="Дата отправки">
              <input
                type="date"
                className={styles.input}
                value={formatDateForInput(info.pickup_date || '')}
                onChange={(e) => setInfo({ ...info, pickup_date: e.target.value })}
                required
              />
            </Field>

            <div className={`${styles.dadata} ${styles.span2}`}>
              <AddressField
                label="Точный адрес отправки"
                value={{
                  address: info.address?.address || '',
                  fias: info.address?.fias || '',
                  lat: info.address?.lat ? String(info.address.lat) : '',
                  lon: info.address?.lon ? String(info.address.lon) : '',
                }}
                onChange={(addressData) =>
                  setInfo((prev) => ({
                    ...prev,
                    address: {
                      ...(prev.address || EMPTY_CARGO.address),
                      address: addressData.address,
                      fias: addressData.fias || prev.address?.fias || '',
                      lat: addressData.lat ? Number(addressData.lat) : prev.address?.lat || 0,
                      lon: addressData.lon ? Number(addressData.lon) : prev.address?.lon || 0,
                    },
                  }))
                }
                cityFias={info.address?.city?.fias || info.address?.fias}
              />
            </div>
          </div>
        </Section>

        <Section icon={Navigation} title="Пункт прибытия">
          <div className={styles.grid2}>
            <div className={styles.dadata}>
              <CityField
                label="Город и страна прибытия"
                value={info.destiny?.city || EMPTY_CARGO.destiny.city}
                onChange={(cityData) => {
                  setInfo((prev) => ({
                    ...prev,
                    destiny: {
                      ...(prev.destiny || EMPTY_CARGO.destiny),
                      city: cityData,
                      fias: cityData.fias || prev.destiny?.fias || '',
                    },
                  }));
                }}
                onFIAS={(fias) => {
                  setInfo((prev) => ({
                    ...prev,
                    destiny: {
                      ...(prev.destiny || EMPTY_CARGO.destiny),
                      fias: fias || prev.destiny?.fias || '',
                      city: prev.destiny?.city || EMPTY_CARGO.destiny.city,
                    },
                  }));
                }}
              />
            </div>

            <Field label="Дата прибытия">
              <input
                type="date"
                className={styles.input}
                value={formatDateForInput(info.delivery_date || '')}
                onChange={(e) => setInfo({ ...info, delivery_date: e.target.value })}
                required
              />
            </Field>

            <div className={`${styles.dadata} ${styles.span2}`}>
              <AddressField
                label="Точный адрес прибытия"
                value={{
                  address: info.destiny?.address || '',
                  fias: info.destiny?.fias || '',
                  lat: info.destiny?.lat ? String(info.destiny.lat) : '',
                  lon: info.destiny?.lon ? String(info.destiny.lon) : '',
                }}
                onChange={(addressData) =>
                  setInfo((prev) => ({
                    ...prev,
                    destiny: {
                      ...(prev.destiny || EMPTY_CARGO.destiny),
                      address: addressData.address,
                      fias: addressData.fias || prev.destiny?.fias || '',
                      lat: addressData.lat ? Number(addressData.lat) : prev.destiny?.lat || 0,
                      lon: addressData.lon ? Number(addressData.lon) : prev.destiny?.lon || 0,
                    },
                  }))
                }
                cityFias={info.destiny?.city?.fias || info.destiny?.fias}
              />
            </div>
          </div>
        </Section>

        <Section icon={Phone} title="Контактное лицо">
          <div className={styles.grid2}>
            <Field label="ФИО контактного лица">
              <input
                type="text"
                className={styles.input}
                placeholder="Иванов Иван"
                value={info.face || ''}
                onChange={(e) => setInfo({ ...info, face: e.target.value })}
                required
              />
            </Field>
            <Field label="Номер телефона">
              <input
                type="tel"
                inputMode="tel"
                className={styles.input}
                placeholder="+7 900 000-00-00"
                value={info.phone || ''}
                onChange={(e) => {
                  const phoneValue = e.target.value.replace(/\D/g, '');
                  setInfo({ ...info, phone: phoneValue });
                }}
                required
              />
            </Field>
          </div>
          <div className={styles.lockNote}>
            <Lock size={16} strokeWidth={2} />
            <p>
              <strong>Телефон скрыт от перевозчиков.</strong> До завершения торгов общение идёт в
              чате платформы. Номер для связи открывается обеим сторонам автоматически после
              заключения договора.
            </p>
          </div>
        </Section>

        <Section icon={FileText} title="Документы">
          <label className={styles.upload}>
            <Upload size={20} strokeWidth={1.75} />
            <span className={styles.uploadTitle}>Загрузите документы по грузу</span>
            <span className={styles.uploadHint}>
              Накладные, счета, спецификации — PDF, JPG, XLSX
            </span>
            <input
              type="file"
              multiple
              className={styles.srOnly}
              onChange={(e) => {
                const files = e.target.files;
                if (files?.length) setDocs((prev) => [...prev, ...Array.from(files)]);
                e.target.value = '';
              }}
            />
          </label>

          {docs.length > 0 && (
            <ul className={styles.docList}>
              {docs.map((file, index) => (
                <li key={`${file.name}-${index}`} className={styles.docItem}>
                  <FileText size={16} strokeWidth={1.75} />
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className={styles.docRemove}
                    aria-label={`Удалить ${file.name}`}
                    onClick={() => setDocs((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.lockNote}>
            <Lock size={16} strokeWidth={2} />
            <p>
              <strong>Документы скрыты от исполнителей во время торгов.</strong> Они откроются
              автоматически после того, как вы выберете исполнителя и договоритесь об условиях
              перевозки.
            </p>
          </div>
        </Section>

        <Section icon={Shield} title="Безопасная оплата (эскроу)">
          <div className={styles.choiceGrid}>
            {ESCROW_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`${styles.choiceCard} ${escrow === option.id ? styles.choiceActive : ''}`}
                onClick={() => setEscrow(option.id)}
              >
                <span className={styles.choiceHead}>
                  <span className={`${styles.choiceDot} ${styles[`dot_${option.light}`]}`} />
                  <span className={styles.choiceTitle}>{option.short}</span>
                </span>
                <span className={styles.choiceDesc}>{option.desc}</span>
              </button>
            ))}
          </div>

          {escrow === 'partial' && (
            <div className={styles.partialBox}>
              <div className={styles.grid2}>
                <Field label="Сумма на эскроу-счёт, ₽">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={styles.input}
                    placeholder="0"
                    value={formatNumber(escrowHeld || '')}
                    onChange={(e) => setEscrowHeld(unformatNumber(e.target.value))}
                    required
                  />
                </Field>
                <Field label="Остаток напрямую заказчику">
                  <div className={styles.readonly}>
                    {formatNumber(Math.max(haulPrice - escrowHeld, 0)) || '0'} ₽
                  </div>
                </Field>
              </div>
              <p className={styles.helpText}>
                {haulPrice > 0
                  ? `Указанная сумма — ${escrowPercent}% от цены перевозки (${formatNumber(haulPrice)} ₽). Она будет зарезервирована на эскроу-счёте платформы и переведена перевозчику после доставки, остальное оплачивается напрямую.`
                  : 'Укажите сумму, которую нужно зарезервировать на эскроу-счёте платформы. Она будет переведена перевозчику после подтверждения доставки.'}
              </p>
            </div>
          )}
        </Section>

        <Section icon={ShieldCheck} title="Страхование груза">
          <div className={styles.choiceGrid}>
            {INSURANCE_OPTIONS.map((option) => {
              const Icon = option.Icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.choiceCard} ${
                    insuranceKind === option.id ? styles.choiceActive : ''
                  }`}
                  onClick={() => setInsuranceKind(option.id)}
                >
                  <span className={styles.choiceHead}>
                    <Icon size={16} strokeWidth={1.75} className={styles.choiceIcon} />
                    <span className={styles.choiceTitle}>{option.label}</span>
                    <span className={styles.choiceRate}>{option.rate}%</span>
                  </span>
                  <span className={styles.choiceDesc}>{option.desc}</span>
                </button>
              );
            })}
          </div>
          {cargoCost > 0 && (
            <p className={styles.helpText}>
              Страховая премия:{' '}
              <strong>
                {formatNumber(insurancePremium)} ₽
              </strong>{' '}
              ({insuranceRate}% от стоимости груза {formatNumber(cargoCost)} ₽)
            </p>
          )}
        </Section>

        <Section icon={Wallet} title="Цена перевозки">
          <div className={styles.grid2}>
            <Field label="Цена перевозки, ₽">
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                placeholder="0"
                value={formatNumber(info.price || '')}
                onChange={(e) => setInfo({ ...info, price: unformatNumber(e.target.value) })}
                required
              />
            </Field>
            <Field label="Итого с учётом страхования">
              <div className={styles.readonly}>{formatNumber(totalWithInsurance) || '0'} ₽</div>
            </Field>
          </div>
        </Section>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submit}
            disabled={isSubmitting || !info.name?.trim()}
          >
            {isEdit ? 'Сохранить изменения' : 'Опубликовать заказ'}
          </button>
          <button type="button" className={styles.cancel} onClick={onBack}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Package;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>
          <Icon size={16} strokeWidth={1.75} />
        </span>
        {title}
      </h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`${styles.field} ${className || ''}`}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}
