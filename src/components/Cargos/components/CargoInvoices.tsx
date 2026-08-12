import React, { useMemo } from 'react';
import { IonLoading } from '@ionic/react';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { CargoInfo, DriverInfo, useCargoStore } from '../../../Store/cargoStore';
import { DriverCard } from './DriverCard';
import type { UseInvoicesReturn } from '../hooks/useInvoices';
import { useSocket } from '../../../Store/useSocket';
import { useToken } from '../../../Store/loginStore';
import { useChats } from '../../../Store/useChats';
import { CargoStatusTimeline } from './CargoStatusTimeline';
import { InvoiceOfferCard } from './InvoiceOfferCard';
import styles from './CargoInvoices.module.css';

interface CargoInvoiceProps {
  cargo: CargoInfo;
  invoiceApi: UseInvoicesReturn;
  onBack: () => void;
  onOpenAgreement?: (invoice: DriverInfo, contract: unknown) => void;
}

export const CargoInvoice: React.FC<CargoInvoiceProps> = ({
  cargo,
  invoiceApi,
  onBack,
  onOpenAgreement,
}) => {
  const {
    invoices,
    isLoading,
    handleAccept,
    handleReject,
    handleChat,
    get_contract,
    handleComplete,
  } = invoiceApi;
  const { emit } = useSocket();
  const token = useToken();
  const { sendImage } = useChats();
  const cargos = useCargoStore((state) => state.cargos);

  const liveCargo = useMemo(() => {
    return cargos.find((item) => item.guid === cargo.guid) ?? cargo;
  }, [cargos, cargo]);

  const liveInvoices = useMemo(() => {
    const storeInvoices = liveCargo.invoices ?? [];
    if (!invoices.length) return storeInvoices.length ? storeInvoices : invoices;

    return invoices.map((invoice) => {
      const fresh = storeInvoices.find((item) => item.guid === invoice.guid);
      return fresh ? { ...invoice, ...fresh } : invoice;
    });
  }, [invoices, liveCargo.invoices]);

  const AcceptClick = async (
    invoice: DriverInfo,
    data: { sealPhotos?: string[] },
    status: number
  ) => {
    await handleAccept(invoice, status);

    if (status === 16) {
      for (const elem of data.sealPhotos ?? []) {
        await sendImage(invoice.recipient, invoice.cargo, elem);
      }

      emit('send_message', {
        token,
        recipient: invoice.recipient,
        cargo: invoice.cargo,
        message: 'Груз осмотрен и опломбирован, документы на груз переданы',
      });
      emit('send_message', {
        token,
        recipient: invoice.recipient,
        cargo: invoice.cargo,
        message: 'Транспорт отправлен в точку разгрузки',
      });
    } else if (status === 18) {
      for (const elem of data.sealPhotos ?? []) {
        await sendImage(invoice.recipient, invoice.cargo, elem);
      }

      emit('send_message', {
        token,
        recipient: invoice.recipient,
        cargo: invoice.cargo,
        message: 'Пломба цела, груз доставлен',
      });
      emit('send_message', {
        token,
        recipient: invoice.recipient,
        cargo: invoice.cargo,
        message: 'Разгрузка начата',
      });
    } else if (status === 20) {
      emit('send_message', {
        token,
        recipient: invoice.recipient,
        cargo: invoice.cargo,
        message: 'Все работы выполнены',
      });
    }

    return true;
  };

  const handleClick = async (invoice: DriverInfo) => {
    const contractData = await get_contract(invoice);
    if (onOpenAgreement && contractData) {
      onOpenAgreement(invoice, contractData);
    }
  };

  const handleRejectAndMaybeBack = async (invoice: DriverInfo) => {
    const success = await handleReject(invoice);
    if (success && liveInvoices.length <= 1) {
      onBack();
    }
  };

  return (
    <div className={styles.view}>
      <IonLoading isOpen={isLoading} message="Подождите..." />

      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={20} strokeWidth={2} />
          К заказу
        </button>
        <div className={styles.topId}>ID {liveCargo.guid.substr(0, 8)}</div>
      </div>

      <div className={styles.body}>
        {!liveInvoices?.length && (
          <div className={styles.emptyNote}>Пока нет заявок от водителей</div>
        )}

        {liveInvoices.map((invoice) => (
          <section key={invoice.guid} className={styles.invoiceBlock}>
            <CargoStatusTimeline cargo={{ ...liveCargo, invoices: [invoice] }} />

            <div className={styles.cardsRow}>
              <InvoiceOfferCard invoice={invoice} />

              <aside className={styles.actionPanel} aria-label="Текущее действие">
                <div className={styles.actionPanelHead}>
                  <div className={styles.actionPanelKicker}>Текущее действие</div>
                  <h2 className={styles.actionPanelTitle}>{invoice.status}</h2>
                </div>
                <DriverCard
                  info={invoice}
                  onReject={handleRejectAndMaybeBack}
                  onAccept={handleClick}
                  onChat={handleChat}
                  onStartLoading={(info) => handleAccept(info, 14)}
                  onSend={(info) => handleAccept(info, 16)}
                  onStartUnloading={(info) =>
                    AcceptClick(info, { sealPhotos: [] }, 18)
                  }
                  onComplete={(info, rating, completed) => {
                    handleComplete(info, rating, {
                      delivered: completed,
                      documents: completed,
                    });
                    AcceptClick(info, {}, 20);
                  }}
                  isLoading={isLoading}
                />
              </aside>
            </div>

            <button
              type="button"
              className={styles.chatCta}
              onClick={() => handleChat(invoice)}
            >
              <MessageCircle size={20} strokeWidth={1.75} />
              <span>
                <span className={styles.chatCtaTitle}>Чат</span>
                <span className={styles.chatCtaHint}>Написать водителю</span>
              </span>
            </button>
          </section>
        ))}
      </div>
    </div>
  );
};
