import React from 'react';
import {
  ArrowRight,
  Building2,
  FileText,
  Lock,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Truck,
  User,
} from 'lucide-react';
import { WorkInfo, WorkStatus } from '../../types';
import { getWorkCustomerName, workFormatters } from '../../utils';
import { normalizeWorkStatus } from '../../statusFlow';
import {
  fleetSlots,
  formatPhonePretty,
  formatQty,
  getPaymentLevel,
  offersLabel,
  phoneHref,
  plural,
  resolveBodyType,
  routeDistanceKm,
  shortDate,
  type PaymentLevel,
} from '../../feedFormat';
import styles from './WorkOrderInfo.module.css';

type WorkOrderInfoProps = {
  work: WorkInfo;
};

const PAYMENT_TITLE: Record<PaymentLevel, string> = {
  full: 'Полная безопасная оплата',
  partial: 'Частичная безопасная оплата',
  none: 'Без безопасной оплаты',
};

const PAYMENT_TEXT: Record<PaymentLevel, string> = {
  full: 'Вся сумма уже зарезервирована на эскроу-счёте и будет переведена после доставки.',
  partial: 'На эскроу-счёте зарезервирована часть суммы, остаток оплачивается напрямую.',
  none: 'Средства не зарезервированы. Оплата напрямую с заказчиком — повышенный риск.',
};

export const WorkOrderInfo: React.FC<WorkOrderInfoProps> = ({ work }) => {
  const price = work.currentOffer?.price ?? work.price;
  const weight = work.currentOffer?.weight ?? work.weight;
  const volume = work.currentOffer?.volume ?? work.volume;
  const fromCity = work.address?.city?.city || 'Не указано';
  const toCity = work.destiny?.city?.city || 'Не указано';
  const customerName = getWorkCustomerName(work);
  const contactName = work.face?.trim() || '';
  const payment = getPaymentLevel(work);
  const reserved = Number(work.advance) || 0;
  const slots = fleetSlots(work);
  const offers = work.offers?.length ?? 0;
  const distance = routeDistanceKm(work);
  const bodyType = resolveBodyType(work);
  const pickup = shortDate(work.pickup_date);
  const delivery = shortDate(work.delivery_date);
  const tel = work.phone ? phoneHref(work.phone) : null;
  const verified = work.company?.verified ?? Boolean(work.company);
  const status = normalizeWorkStatus(work.status);
  const phoneUnlocked =
    work.signed ||
    (status !== WorkStatus.NEW &&
      status !== WorkStatus.OFFERED &&
      status !== WorkStatus.REJECTED);
  const documents = Array.isArray(work.documents)
    ? work.documents.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return (
    <div className={styles.stack}>
      <section className={`${styles.card} ${styles.payCard} ${styles[`pay_${payment}`]}`}>
        <div className={styles.payHead}>
          <div className={`${styles.payLight} ${styles[`light_${payment}`]}`} aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.payCopy}>
            <h3 className={styles.payTitle}>
              <Lock size={14} strokeWidth={2} className={styles.payLock} />
              {PAYMENT_TITLE[payment]}
            </h3>
            <p className={styles.payText}>{PAYMENT_TEXT[payment]}</p>
          </div>
        </div>
        {payment !== 'none' && (
          <div className={styles.payReserve}>
            <span>Зарезервировано на эскроу-счёте</span>
            <strong>
              {workFormatters.currency(reserved)}
              <span>
                {' '}
                из {workFormatters.currency(work.price)}
              </span>
            </strong>
          </div>
        )}
      </section>

      {slots && (
        <section className={styles.card}>
          <div className={styles.fleetHead}>
            <div className={styles.fleetTitle}>
              <Truck size={16} strokeWidth={1.75} />
              Требуется машин: {slots.total}
            </div>
            <span className={`${styles.fleetBadge} ${slots.free > 0 ? styles.fleetOpen : styles.fleetFull}`}>
              {slots.free > 0 ? `Свободно ${slots.free}` : 'Набор завершён'}
            </span>
          </div>
          <div className={styles.fleetBar} aria-hidden>
            {Array.from({ length: slots.total }, (_, i) => (
              <span key={i} className={i < slots.busy ? styles.fleetSegOn : styles.fleetSegOff} />
            ))}
          </div>
          <p className={styles.fleetHint}>
            {slots.busy} из {slots.total} машин уже согласовали переговоры и работают по заказу.
            {slots.free > 0
              ? ` Заказчику ещё нужно ${slots.free} ${plural(slots.free, 'машина', 'машины', 'машин')} — вы можете откликнуться, даже если часть уже в работе.`
              : ' Все места заняты, приём новых откликов закрыт.'}
          </p>
          <div className={styles.fleetSlots}>
            {Array.from({ length: slots.total }, (_, i) =>
              i < slots.busy ? (
                <div key={i} className={styles.slotFilled}>
                  <span className={styles.slotIcon}>
                    <User size={16} strokeWidth={1.75} />
                  </span>
                  <div className={styles.slotBody}>
                    <p>Машина в работе</p>
                    <span>Слот занят перевозчиком</span>
                  </div>
                  <span className={styles.slotPill}>В работе</span>
                </div>
              ) : (
                <div key={i} className={styles.slotOpen}>
                  <span className={styles.slotIconMuted}>
                    <Plus size={16} strokeWidth={1.75} />
                  </span>
                  <p>Свободный слот — ждём отклика</p>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {customerName && (
        <section className={styles.card}>
          <div className={styles.kicker}>Отправитель заказа</div>
          <div className={styles.partyRow}>
            <span className={styles.partyIconBrand}>
              <Building2 size={18} strokeWidth={1.75} />
            </span>
            <div className={styles.partyBody}>
              <div className={styles.partyName}>
                {customerName}
                {verified && <ShieldCheck size={16} strokeWidth={2} className={styles.verified} />}
              </div>
              <div className={styles.partyRole}>Заказчик · Грузовладелец</div>
            </div>
          </div>
          {(work.company?.rating || work.company?.deals || verified) && (
            <div className={styles.partyFooter}>
              <div className={styles.partyMeta}>
                {work.company?.rating != null && (
                  <span>
                    <Star size={14} strokeWidth={2} className={styles.star} />
                    {work.company.rating.toFixed(1)}
                  </span>
                )}
                {work.company?.deals != null && (
                  <span>
                    {work.company.deals} {plural(work.company.deals, 'сделка', 'сделки', 'сделок')}
                  </span>
                )}
              </div>
              {verified && <span className={styles.verifiedPill}>Проверен</span>}
            </div>
          )}
        </section>
      )}

      {(contactName || work.phone) && (
        <section className={styles.card}>
          <div className={styles.kicker}>Контактное лицо</div>
          <div className={styles.partyRow}>
            <span className={styles.partyIcon}>
              <User size={16} strokeWidth={1.75} />
            </span>
            <div className={styles.partyBody}>
              <div className={styles.partyName}>{contactName || 'Представитель заказчика'}</div>
              <div className={styles.partyRole}>Представитель заказчика</div>
            </div>
          </div>
          {phoneUnlocked && work.phone ? (
            <a
              className={styles.phoneBtn}
              href={tel || undefined}
              onClick={(e) => {
                if (!tel) e.preventDefault();
              }}
            >
              <Phone size={16} strokeWidth={2} />
              <span>{formatPhonePretty(work.phone)}</span>
              {work.signed && <span className={styles.signedPill}>Договор заключён</span>}
            </a>
          ) : (
            <div className={styles.phoneLocked}>
              <Lock size={16} strokeWidth={2} />
              <span>+7 900 •••-••-••</span>
              <em>Откроется после договора</em>
            </div>
          )}
        </section>
      )}

      {documents.length > 0 && (
        <section className={styles.card}>
          <div className={styles.kicker}>
            <FileText size={13} strokeWidth={2} />
            Документы по заказу
          </div>
          {phoneUnlocked ? (
            <ul className={styles.docList}>
              {documents.map((name) => (
                <li key={name} className={styles.docItem}>
                  <FileText size={16} strokeWidth={1.75} />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.phoneLocked}>
              <Lock size={16} strokeWidth={2} />
              <span>
                {documents.length}{' '}
                {plural(documents.length, 'документ', 'документа', 'документов')}
              </span>
              <em>Откроются после договора</em>
            </div>
          )}
        </section>
      )}

      <section className={`${styles.card} ${styles.specCard}`}>
        <div className={styles.specHead}>
          <span className={styles.specKicker}>Стоимость</span>
          <span className={styles.offers}>{offersLabel(offers)}</span>
        </div>
        <div className={styles.specPrice}>{workFormatters.currency(price)}</div>
        <div className={styles.specRoute}>
          <MapPin size={16} strokeWidth={1.75} />
          <span>{fromCity}</span>
          <ArrowRight size={14} strokeWidth={2} className={styles.specArrow} />
          <span>{toCity}</span>
          {distance != null && <span className={styles.specKm}>· {distance} км</span>}
        </div>
        <dl className={styles.specTable}>
          <SpecRow label="Дата отправления" value={pickup} />
          <SpecRow label="Дата доставки" value={delivery} />
          <SpecRow label="Тип кузова" value={bodyType} />
          <SpecRow label="Тип загрузки" value={work.loading_type} />
          <SpecRow
            label="Вес / объём"
            value={`${formatQty(Number(weight) || 0)} т · ${formatQty(Number(volume) || 0)} м³`}
          />
          <SpecRow label="Оплата" value="Безналичный" />
        </dl>
        {work.description && work.description.trim() !== work.name && (
          <p className={styles.desc}>{work.description}</p>
        )}
      </section>
    </div>
  );
};

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className={styles.specRow}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
