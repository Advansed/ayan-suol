import React, { useMemo, useState } from 'react';
import { IonAlert, IonLoading, IonModal } from '@ionic/react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CloudUpload,
  FileText,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import { CargoInfo, CargoStatus, DriverInfo, useCargoStore } from '../../../Store/cargoStore';
import { accountGetters } from '../../../Store/accountStore';
import { statusUtils, formatters } from '../../../utils/utils';
import {
  getCargoActionHint,
  isCargoCompleted,
  isCargoInExecution,
  isCargoProblems,
  normalizeCargoStatus,
  resolveCargoProgressStatus,
} from '../cargoStatusFlow';
import { CargoOrderInfo } from './CargoOrderInfo';
import { CargoStatusTimeline } from './CargoStatusTimeline';
import styles from './CargoView.module.css';

interface CargoViewProps {
  cargo: CargoInfo;
  onBack: () => void;
  onEdit: (cargo: CargoInfo) => void;
  onDelete: (guid: string) => Promise<boolean>;
  onPublish: (guid: string) => Promise<boolean>;
  onInvoices: (cargo: CargoInfo) => void;
  isLoading?: boolean;
}

function invoiceStatusMeta(status: DriverInfo['status']) {
  if (status === 'Заказано') {
    return {
      label: 'Ожидает решения',
      kind: 'pending' as const,
      Icon: Clock,
    };
  }
  if (status === 'Завершено' || status === 'Доставлено' || status === 'Разгружено') {
    return {
      label: 'Принят',
      kind: 'accepted' as const,
      Icon: CheckCircle2,
    };
  }
  return {
    label: 'Принят',
    kind: 'accepted' as const,
    Icon: CheckCircle2,
  };
}

function isAssignedInvoice(invoice: DriverInfo) {
  return invoice.status !== 'Заказано';
}

export const CargoView: React.FC<CargoViewProps> = ({
  cargo,
  onBack,
  onEdit,
  onDelete,
  onPublish,
  onInvoices,
  isLoading = false,
}) => {
  const cargos = useCargoStore((state) => state.cargos);
  const [actionOpen, setActionOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showPublishAlert, setShowPublishAlert] = useState(false);

  const cargoInfo = useMemo(() => {
    const found = cargos.find((item) => item.guid === cargo.guid);
    return found ?? cargo;
  }, [cargos, cargo.guid, cargo]);

  const progressStatus = resolveCargoProgressStatus(cargoInfo);
  const status = normalizeCargoStatus(cargoInfo.status);
  const canPublish = status === CargoStatus.NEW;
  const canEdit = statusUtils.canEdit(status);
  const canDelete = statusUtils.canDelete(status);
  const invoices = cargoInfo.invoices ?? [];
  const totalInvoices = invoices.length;
  const advanceAmount = Number(cargoInfo.advance) || 0;
  const insuranceAmount = Number(cargoInfo.insurance) || 0;
  const publishCost = advanceAmount + insuranceAmount;
  const balance = accountGetters.getBalance();
  const actionHint = getCargoActionHint(progressStatus);
  const publishAlertMessage = (() => {
    if (publishCost <= 0) return 'Опубликовать груз для поиска водителей?';
    const parts: string[] = [];
    if (advanceAmount > 0) parts.push(`спецсчёт ${formatters.currency(advanceAmount)}`);
    if (insuranceAmount > 0) parts.push(`страховка ${formatters.currency(insuranceAmount)}`);
    return `К списанию с баланса: ${formatters.currency(publishCost)} (${parts.join(' + ')}). Доступно: ${formatters.currency(balance)}. Опубликовать заказ?`;
  })();
  const completed = isCargoCompleted(progressStatus);
  const problems = isCargoProblems(progressStatus);
  const inExecution = isCargoInExecution(progressStatus);
  const showTracker = inExecution || completed;
  const hasInteractiveAction = !completed;
  const invoicesAsPrimary =
    status === CargoStatus.HAS_ORDERS || isCargoInExecution(progressStatus);

  const selectedInvoice = useMemo(
    () => invoices.find(isAssignedInvoice) ?? null,
    [invoices]
  );
  const pendingInvoices = useMemo(
    () => invoices.filter((item) => item.status === 'Заказано'),
    [invoices]
  );
  const otherInvoices = useMemo(
    () => invoices.filter((item) => item.status !== 'Заказано'),
    [invoices]
  );

  const handleDelete = async () => {
    setShowDeleteAlert(false);
    setActionOpen(false);
    await onDelete(cargoInfo.guid);
  };

  const handlePublish = async () => {
    setShowPublishAlert(false);
    setActionOpen(false);
    await onPublish(cargoInfo.guid);
  };

  const handlePrimaryAction = () => {
    if (invoicesAsPrimary) {
      onInvoices(cargoInfo);
      return;
    }
    setActionOpen(true);
  };

  const closeAnd = (fn: () => void) => {
    setActionOpen(false);
    fn();
  };

  const actionContent = (
    <>
      {canPublish && (
        <div className={styles.actionList}>
          <button
            type="button"
            className={styles.actionPrimary}
            onClick={() => setShowPublishAlert(true)}
          >
            <CloudUpload size={18} strokeWidth={1.75} />
            <span>
              <span className={styles.actionItemTitle}>Опубликовать груз</span>
              <span className={styles.actionItemHint}>Открыть заказ для водителей</span>
            </span>
          </button>

          {canEdit && (
            <button
              type="button"
              className={styles.actionItem}
              onClick={() => closeAnd(() => onEdit(cargoInfo))}
            >
              <Pencil size={18} strokeWidth={1.75} />
              <span>
                <span className={styles.actionItemTitle}>Изменить</span>
                <span className={styles.actionItemHint}>Редактировать параметры заказа</span>
              </span>
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              className={`${styles.actionItem} ${styles.actionDanger}`}
              onClick={() => setShowDeleteAlert(true)}
            >
              <Trash2 size={18} strokeWidth={1.75} />
              <span>
                <span className={styles.actionItemTitle}>Удалить</span>
                <span className={styles.actionItemHint}>Удалить черновик заказа</span>
              </span>
            </button>
          )}
        </div>
      )}

      {status === CargoStatus.WAITING && (
        <div className={styles.doneNote}>
          Заказ опубликован. Ожидаем предложения от водителей.
          {totalInvoices > 0 && ` Уже есть заявок: ${totalInvoices}.`}
        </div>
      )}

      {problems && (
        <div className={styles.doneNote}>
          По заявке возникли проблемы. Откройте заявки водителей, чтобы разобрать ситуацию.
        </div>
      )}

      {invoicesAsPrimary && (
        <div className={styles.actionList}>
          <button
            type="button"
            className={styles.actionPrimary}
            onClick={() => closeAnd(() => onInvoices(cargoInfo))}
          >
            <FileText size={18} strokeWidth={1.75} />
            <span>
              <span className={styles.actionItemTitle}>Заявки от водителей</span>
              <span className={styles.actionItemHint}>
                {totalInvoices > 0 ? `${totalInvoices} заявок` : 'Открыть список заявок'}
              </span>
            </span>
          </button>
        </div>
      )}

      {completed && (
        <div className={styles.doneNote}>
          Заказ завершён. Дальнейших действий не требуется.
        </div>
      )}
    </>
  );

  const renderBid = (invoice: DriverInfo, actionable: boolean) => {
    const meta = invoiceStatusMeta(invoice.status);
    const StatusIcon = meta.Icon;
    const truckLine = [invoice.transport, invoice.capacity].filter(Boolean).join(' · ') || 'Транспорт не указан';

    return (
      <article key={invoice.guid} className={styles.bidCard}>
        <div className={styles.bidRow}>
          <span className={styles.bidAvatar} aria-hidden>
            <Truck size={20} strokeWidth={1.75} />
          </span>
          <div className={styles.bidBody}>
            <div className={styles.bidTop}>
              <div className={styles.bidIdentity}>
                <div className={styles.bidNameRow}>
                  <p className={styles.bidName}>{invoice.client || 'Исполнитель'}</p>
                  <ShieldCheck size={14} strokeWidth={2} className={styles.bidVerified} />
                </div>
                <p className={styles.bidTruck}>{truckLine}</p>
              </div>
              <div className={styles.bidPriceCol}>
                <p className={styles.bidPrice}>{formatters.currency(invoice.price)}</p>
                <span className={`${styles.bidStatus} ${styles[`bidStatus_${meta.kind}`]}`}>
                  <StatusIcon size={12} strokeWidth={2} />
                  {meta.label}
                </span>
              </div>
            </div>

            <div className={styles.bidMeta}>
              <span className={styles.bidRating}>
                <Star size={14} strokeWidth={1.75} className={styles.bidStar} />
                {invoice.rating || '—'}
              </span>
              <span>
                {invoice.weight} т · {invoice.volume} м³
              </span>
            </div>

            {actionable && (
              <div className={styles.bidActions}>
                <button
                  type="button"
                  className={styles.bidPrimary}
                  onClick={() => onInvoices(cargoInfo)}
                >
                  Выбрать исполнителя
                </button>
                <button
                  type="button"
                  className={styles.bidSecondary}
                  onClick={() => onInvoices(cargoInfo)}
                >
                  <MessageSquare size={14} strokeWidth={1.75} />
                  Написать
                </button>
                <button
                  type="button"
                  className={styles.bidGhost}
                  onClick={() => onInvoices(cargoInfo)}
                >
                  <XCircle size={14} strokeWidth={1.75} />
                  Отклонить
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className={styles.view}>
      <IonLoading isOpen={isLoading} message="Подождите..." />

      <button type="button" className={styles.backBtn} onClick={onBack}>
        <ArrowLeft size={16} strokeWidth={2} />
        Назад к моим заказам
      </button>

      <div className={styles.stack}>
        {showTracker && <CargoStatusTimeline cargo={cargoInfo} />}

        <CargoOrderInfo cargo={cargoInfo} />

        {selectedInvoice && (
          <section className={styles.carrierCard}>
            <p className={styles.carrierKicker}>
              <ShieldCheck size={14} strokeWidth={2} />
              {completed ? 'Рейс выполнен исполнителем' : 'Выбранный исполнитель'}
            </p>
            <div className={styles.carrierRow}>
              <span className={styles.carrierAvatar} aria-hidden>
                <Truck size={20} strokeWidth={1.75} />
              </span>
              <p className={styles.carrierName}>
                {[selectedInvoice.client, selectedInvoice.transport].filter(Boolean).join(' · ') ||
                  'Исполнитель'}
              </p>
              <button
                type="button"
                className={styles.carrierChat}
                onClick={() => onInvoices(cargoInfo)}
                aria-label="Написать исполнителю"
              >
                <MessageSquare size={16} strokeWidth={1.75} />
              </button>
            </div>
          </section>
        )}

        <section className={styles.bidsSection}>
          <div className={styles.bidsHead}>
            <h3 className={styles.bidsTitle}>
              {inExecution || completed
                ? 'Все отклики по заказу'
                : `Отклики исполнителей (${totalInvoices})`}
            </h3>
            {!canPublish && (
              <button
                type="button"
                className={styles.bidsLink}
                onClick={() => onInvoices(cargoInfo)}
              >
                Открыть
              </button>
            )}
          </div>

          {totalInvoices === 0 ? (
            <div className={styles.bidsEmpty}>
              Пока никто не откликнулся на этот заказ.
            </div>
          ) : (
            <div className={styles.bidsList}>
              {pendingInvoices.map((invoice) =>
                renderBid(invoice, !inExecution && !completed)
              )}
              {otherInvoices.map((invoice) => renderBid(invoice, false))}
            </div>
          )}
        </section>

        {(canPublish || hasInteractiveAction) && (
          <div className={styles.ctaRow}>
            {canPublish && (
              <button
                type="button"
                className={styles.actionCta}
                onClick={() => setActionOpen(true)}
              >
                <span className={styles.actionCtaTitle}>Действие по заказу</span>
                <span className={styles.actionCtaHint}>{actionHint}</span>
              </button>
            )}

            {!canPublish && hasInteractiveAction && (
              <button
                type="button"
                className={styles.actionCta}
                onClick={handlePrimaryAction}
              >
                <span className={styles.actionCtaTitle}>
                  {invoicesAsPrimary ? 'Управление заявками' : 'Действие по заказу'}
                </span>
                <span className={styles.actionCtaHint}>{actionHint}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <IonModal
        isOpen={actionOpen}
        onDidDismiss={() => setActionOpen(false)}
        className={styles.actionModal}
      >
        <div className={styles.modalShell}>
          <div className={styles.modalHead}>
            <div>
              <div className={styles.modalKicker}>Заказ</div>
              <h2 className={styles.modalTitle}>Действие по заказу</h2>
            </div>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setActionOpen(false)}
              aria-label="Закрыть"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
          <div className={styles.modalBody}>{actionContent}</div>
        </div>
      </IonModal>

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Подтверждение"
        message="Вы уверены, что хотите удалить этот груз?"
        buttons={[
          {
            text: 'Отмена',
            role: 'cancel',
            handler: () => setShowDeleteAlert(false),
          },
          {
            text: 'Удалить',
            handler: handleDelete,
          },
        ]}
      />

      <IonAlert
        isOpen={showPublishAlert}
        onDidDismiss={() => setShowPublishAlert(false)}
        header="Публикация груза"
        message={publishAlertMessage}
        buttons={[
          {
            text: 'Отмена',
            role: 'cancel',
            handler: () => setShowPublishAlert(false),
          },
          {
            text: 'Опубликовать',
            handler: handlePublish,
          },
        ]}
      />
    </div>
  );
};
