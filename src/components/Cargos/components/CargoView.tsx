import React, { useMemo, useState } from 'react';
import { IonAlert, IonLoading, IonModal } from '@ionic/react';
import {
  ChevronLeft,
  CloudUpload,
  CreditCard,
  FileText,
  Pencil,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import { CargoInfo, CargoStatus, useCargoStore } from '../../../Store/cargoStore';
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
  onPayment: (cargo: CargoInfo) => void;
  onInsurance: (cargo: CargoInfo) => void;
  isLoading?: boolean;
}

export const CargoView: React.FC<CargoViewProps> = ({
  cargo,
  onBack,
  onEdit,
  onDelete,
  onPublish,
  onInvoices,
  onPayment,
  onInsurance,
  isLoading = false,
}) => {
  const cargos = useCargoStore((state) => state.cargos);
  const [actionOpen, setActionOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showPublishAlert, setShowPublishAlert] = useState(false);

  // Всегда приоритет стора — prop может быть устаревшим снимком навигации
  const cargoInfo = useMemo(() => {
    const found = cargos.find((item) => item.guid === cargo.guid);
    return found ?? cargo;
  }, [cargos, cargo.guid, cargo]);

  const progressStatus = resolveCargoProgressStatus(cargoInfo);
  const status = normalizeCargoStatus(cargoInfo.status);
  const canPublish = status === CargoStatus.NEW;
  const canEdit = statusUtils.canEdit(status);
  const canDelete = statusUtils.canDelete(status);
  const totalInvoices = cargoInfo.invoices?.length || 0;
  const hasAdvance = cargoInfo.advance > 0;
  const hasInsurance = cargoInfo.insurance > 0;
  const hasAdditionalServices = hasAdvance || hasInsurance;
  const advanceAmount = Number(cargoInfo.advance) || 0;
  const cargoPrice = Number(cargoInfo.price) || 0;
  const isFullAdvance = advanceAmount > 0 && cargoPrice > 0 && advanceAmount >= cargoPrice;
  const advancePercent =
    cargoPrice > 0 && advanceAmount > 0
      ? Math.min(100, Math.round((advanceAmount / cargoPrice) * 100))
      : 0;
  const prepaymentTitle = isFullAdvance
    ? 'Полная предоплата'
    : hasAdvance
      ? `${advancePercent}% предоплаты`
      : 'Спецсчёт';
  const prepaymentTitleClass = isFullAdvance
    ? styles.prepaymentTitleFull
    : hasAdvance
      ? styles.prepaymentTitlePartial
      : styles.prepaymentTitleNone;
  const actionHint = getCargoActionHint(progressStatus);
  const completed = isCargoCompleted(progressStatus);
  const problems = isCargoProblems(progressStatus);
  const hasInteractiveAction = !completed;
  const invoicesAsPrimary =
    status === CargoStatus.HAS_ORDERS || isCargoInExecution(progressStatus);

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

          <button
            type="button"
            className={styles.actionItem}
            onClick={() => closeAnd(() => onPayment(cargoInfo))}
          >
            <CreditCard size={18} strokeWidth={1.75} />
            <span>
              <span className={`${styles.actionItemTitle} ${prepaymentTitleClass}`}>
                {prepaymentTitle}
              </span>
              <span className={styles.actionItemHint}>
                {isFullAdvance
                  ? `Внесено ${formatters.currency(advanceAmount)}`
                  : hasAdvance
                    ? `Внесено ${formatters.currency(cargoInfo.advance)}`
                    : 'Предоплата по заказу'}
              </span>
            </span>
          </button>

          <button
            type="button"
            className={styles.actionItem}
            onClick={() => closeAnd(() => onInsurance(cargoInfo))}
          >
            <Shield size={18} strokeWidth={1.75} />
            <span>
              <span className={styles.actionItemTitle}>Страховка</span>
              <span className={styles.actionItemHint}>
                {hasInsurance
                  ? `Оформлено на ${formatters.currency(cargoInfo.insurance)}`
                  : 'Оформить страхование груза'}
              </span>
            </span>
          </button>

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

  return (
    <div className={styles.view}>
      <IonLoading isOpen={isLoading} message="Подождите..." />

      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={20} strokeWidth={2} />
          К заказам
        </button>
        <div className={styles.topId}>ID {cargoInfo.guid.substr(0, 8)}</div>
      </div>

      <div className={styles.body}>
        <CargoStatusTimeline cargo={cargoInfo} />
        <CargoOrderInfo cargo={cargoInfo} />

        <div className={styles.ctaRow}>
          {hasInteractiveAction && (
            <button
              type="button"
              className={styles.actionCta}
              onClick={handlePrimaryAction}
            >
              <span className={styles.actionCtaTitle}>Действие по заказу</span>
              <span className={styles.actionCtaHint}>{actionHint}</span>
            </button>
          )}

          {!canPublish && (
            <button
              type="button"
              className={styles.chatCta}
              onClick={() => onInvoices(cargoInfo)}
            >
              <FileText size={20} strokeWidth={1.75} />
              <span>
                <span className={styles.chatCtaTitle}>Заявки</span>
                <span className={styles.chatCtaHint}>
                  {totalInvoices > 0 ? `${totalInvoices} от водителей` : 'Пока нет заявок'}
                </span>
              </span>
            </button>
          )}
        </div>
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
        message={
          hasAdditionalServices
            ? 'Для публикации потребуется оплата дополнительных услуг. Продолжить?'
            : 'Опубликовать груз для поиска водителей?'
        }
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
