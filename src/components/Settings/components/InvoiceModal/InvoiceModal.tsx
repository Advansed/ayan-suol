import React, { useCallback, useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonButtons, IonButton, IonContent, IonIcon, IonLoading } from '@ionic/react';
import { closeOutline, downloadOutline, printOutline, sendOutline, shareOutline } from 'ionicons/icons';
import { formatters } from '../../../../utils/utils';
import styles from './InvoiceModal.module.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useCompanyStore } from '../../../../Store/companyStore';
import { api } from '../../../../Store/api';
import { useToken } from '../../../../Store/loginStore';
import { useToast } from '../../../Toast';

interface SellerData {
  name: '';
  address: '';
  inn: '';
  kpp: '';
  ogrn: '';
  account: '';
  bank: '';
  bankInn: '';
  bik: '';
  korAccount: '';
  bankAddress: '';
}

interface InvoiceItem {
  item_name: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

interface CustomerData {
  name: string;
  address: number;
  inn: string;
}

export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  inv: InvoiceData;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customer: CustomerData;
  items: InvoiceItem[];
  total: number;
  vat: number;
  paymentPurpose: string;
  paymentDue: string;
  seller: SellerData;
  signer: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, inv }) => {
  const [load, setLoad] = useState(false);
  const hasSellerData = inv.seller && inv.seller.name;
  const email = useCompanyStore((state) => state.data?.email);
  const token = useToken();
  const toast = useToast();

  const handlePrint = () => {
    window.print();
  };

  const send_email = async (data: any) => {
    setLoad(true);
    const res = await api('api/sendEmail', data);
    if (res.success) toast.success('Счет отправлен на почту ');
    else toast.error('Ошибка отправки почты');
    setLoad(false);
  };

  const buildInvoicePdf = useCallback(async (): Promise<{
    base64: string;
    blob: Blob;
    fileName: string;
  } | null> => {
    const invoiceEl = document.querySelector(`.${styles.invoiceContainer}`) as HTMLElement;
    if (!invoiceEl) return null;

    const originalWidth = invoiceEl.style.width;
    const originalHeight = invoiceEl.style.height;
    const originalMargin = invoiceEl.style.margin;
    const originalFontSize = invoiceEl.style.fontSize;

    invoiceEl.style.width = '800px';
    invoiceEl.style.height = 'auto';
    invoiceEl.style.margin = '0 auto';
    invoiceEl.style.fontSize = '14px';

    const pdf = new jsPDF('p', 'mm', 'a4');

    const canvas = await html2canvas(invoiceEl, {
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: invoiceEl.scrollHeight,
      scale: 2
    });

    invoiceEl.style.width = originalWidth;
    invoiceEl.style.height = originalHeight;
    invoiceEl.style.margin = originalMargin;
    invoiceEl.style.fontSize = originalFontSize;

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    const dataUri = pdf.output('datauristring');
    const base64 = dataUri.split(',')[1];
    const blob = await fetch(dataUri).then((r) => r.blob());
    const fileName = `invoice_${inv.invoiceNumber}.pdf`;

    return { base64, blob, fileName };
  }, [inv.invoiceNumber]);

  const handleEmail = async () => {
    try {
      const built = await buildInvoicePdf();
      if (!built) {
        console.warn('Invoice element not found');
        return;
      }
      send_email({ token, email, pdf: built.base64 });
    } catch (err) {
      console.error('Ошибка при сохранении PDF:', err);
    }
  };

  const handleDownload = async () => {
    try {
      const built = await buildInvoicePdf();
      if (!built) {
        console.warn('Invoice element not found');
        return;
      }

      const result = await Filesystem.writeFile({
        path: built.fileName,
        data: built.base64,
        directory: Directory.Library
      });

      console.log('PDF сохранён:', result.uri);
      alert(`Счёт сохранён как ${built.fileName}`);
    } catch (err) {
      console.error('Ошибка при сохранении PDF:', err);
    }
  };

  const shareSummaryText = `Счёт №${inv.invoiceNumber} от ${inv.invoiceDate}. Сумма: ${formatters.currency(inv.total)}`;

  const handleShare = async () => {
    setLoad(true);
    try {
      const built = await buildInvoicePdf();
      if (!built) {
        toast.error('Не удалось подготовить PDF');
        return;
      }

      const { base64, blob, fileName } = built;
      const title = `Счёт на оплату №${inv.invoiceNumber}`;

      if (Capacitor.isNativePlatform()) {
        const { value: shareSupported } = await Share.canShare();
        if (shareSupported) {
          try {
            const { uri } = await Filesystem.writeFile({
              path: fileName,
              data: base64,
              directory: Directory.Cache
            });

            await Share.share({
              title,
              text: shareSummaryText,
              files: [uri],
              dialogTitle: 'Поделиться'
            });
            return;
          } catch (shareErr) {
            console.warn('Share with file failed, fallback to text', shareErr);
          }
        }

        await Share.share({
          title,
          text: shareSummaryText,
          dialogTitle: 'Поделиться'
        });
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.share) {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        const withFiles: ShareData = { title, text: shareSummaryText, files: [file] };

        if (typeof navigator.canShare === 'function' && navigator.canShare(withFiles)) {
          await navigator.share(withFiles);
          return;
        }

        await navigator.share({ title, text: shareSummaryText });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${title}\n${shareSummaryText}`);
        toast.success('Текст скопирован — вставьте в мессенджер');
        return;
      }

      toast.info('Сохраните счёт через кнопку загрузки и отправьте файл');
    } catch (e: unknown) {
      const err = e as { name?: string };
      if (err?.name === 'AbortError') return;
      console.error(e);
      toast.error('Не удалось открыть «Поделиться»');
    } finally {
      setLoad(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className={styles.modal}>
      <IonHeader>
        <IonToolbar className={styles.toolbar}>
          <IonButtons slot="end">
            <IonButton onClick={handleEmail} size="small" title="На почту">
              <IonIcon icon={sendOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={handleShare} size="small" title="Поделиться">
              <IonIcon icon={shareOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={handleDownload} size="small" title="Скачать">
               <IonIcon icon={downloadOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={handlePrint} size="small" title="Печать">
              <IonIcon icon={printOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={onClose} size="small">
              <IonIcon icon={closeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonLoading isOpen={load} message={'Подождите...'} />
      <IonContent className={styles.content}>
        <div className={styles.invoiceContainer}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>Счет на оплату</div>
            <div className={styles.headerDetails}>
              <div>№ {inv.invoiceNumber}</div>
              <div>от {inv.invoiceDate}</div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Поставщик:</div>
            <div className={styles.sectionContent}>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Название:</span>
                <span className={styles.dataValue}>
                  {hasSellerData ? inv.seller.name : <span className={styles.emptyData}>________________________</span>}
                </span>
              </div>

              {hasSellerData && inv.seller.address && (
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>Адрес:</span>
                  <span className={styles.dataValue}>{inv.seller.address}</span>
                </div>
              )}

              {hasSellerData && inv.seller.inn && (
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>ИНН:</span>
                  <span className={styles.dataValue}>
                    {inv.seller.inn}
                    {inv.seller.kpp ? ` КПП: ${inv.seller.kpp}` : ''}
                  </span>
                </div>
              )}

              {hasSellerData && inv.seller.account && inv.seller.bank && (
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>Банковские реквизиты:</span>
                  <span className={styles.dataValue}>
                    р/с {inv.seller.account} в {inv.seller.bank}
                    {inv.seller.bik && (
                      <>
                        <br />
                        БИК: {inv.seller.bik}
                      </>
                    )}
                    {inv.seller.korAccount && (
                      <>
                        <br />
                        к/с: {inv.seller.korAccount}
                      </>
                    )}
                  </span>
                </div>
              )}

              {!hasSellerData && <div className={styles.emptyData}>Данные поставщика не заполнены</div>}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Покупатель:</div>
            <div className={styles.sectionContent}>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Название:</span>
                <span className={styles.dataValue}>
                  {inv.customer.name || <span className={styles.emptyData}>________________________</span>}
                </span>
              </div>

              {inv.customer.inn && (
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>ИНН:</span>
                  <span className={styles.dataValue}>{inv.customer.inn}</span>
                </div>
              )}

              {inv.customer.address && (
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>Адрес:</span>
                  <span className={styles.dataValue}>{inv.customer.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.itemsSection}>
            <div className={styles.itemsTitle}>Товары/услуги:</div>

            {inv.items?.length > 0 ? (
              inv.items.map((item, idx) => (
                <div key={idx} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemNumber}>{idx + 1}.</span>
                    <span className={styles.itemName}>{item.item_name}</span>
                  </div>

                  <div className={styles.itemDetails}>
                    <div className={styles.itemDetailRow}>
                      <span className={styles.itemDetailLabel}>Количество:</span>
                      <span className={styles.itemDetailValue}>
                        {item.qty} {item.unit}
                      </span>
                    </div>

                    <div className={styles.itemDetailRow}>
                      <span className={styles.itemDetailLabel}>Цена:</span>
                      <span className={styles.itemDetailValue}>{formatters.currency(item.price)}</span>
                    </div>

                    <div className={styles.itemDetailRow}>
                      <span className={styles.itemDetailLabel}>Сумма:</span>
                      <span className={styles.itemDetailValue}>{formatters.currency(item.total)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemNumber}>1.</span>
                  <span className={styles.itemName}>
                    <span className={styles.emptyData}>________________________</span>
                  </span>
                </div>

                <div className={styles.itemDetails}>
                  <div className={styles.itemDetailRow}>
                    <span className={styles.itemDetailLabel}>Количество:</span>
                    <span className={styles.itemDetailValue}>
                      <span className={styles.emptyData}>___</span>
                    </span>
                  </div>

                  <div className={styles.itemDetailRow}>
                    <span className={styles.itemDetailLabel}>Цена:</span>
                    <span className={styles.itemDetailValue}>
                      <span className={styles.emptyData}>___</span>
                    </span>
                  </div>

                  <div className={styles.itemDetailRow}>
                    <span className={styles.itemDetailLabel}>Сумма:</span>
                    <span className={styles.itemDetailValue}>
                      <span className={styles.emptyData}>___</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.totalSection}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Итого:</span>
              <span className={styles.totalValue}>{formatters.currency(inv.total)}</span>
            </div>

            {inv.vat > 0 && (
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>В том числе НДС:</span>
                <span className={styles.totalValue}>{formatters.currency(inv.vat)}</span>
              </div>
            )}
          </div>

          <div className={styles.paymentSection}>
            <div className={styles.paymentTitle}>Условия оплаты:</div>

            {inv.paymentDue && (
              <div className={styles.paymentRow}>
                <span className={styles.paymentLabel}>Срок оплаты:</span>
                <span className={styles.paymentValue}>{inv.paymentDue}</span>
              </div>
            )}

            <div className={styles.paymentRow}>
              <span className={styles.paymentLabel}>Назначение платежа:</span>
              <span className={styles.paymentValue}>
                {inv.paymentPurpose || `Оплата по счету №${inv.invoiceNumber} от ${inv.invoiceDate}`}
              </span>
            </div>
          </div>

          <div className={styles.signatureSection}>
            <div className={styles.signatureLine}>________________________</div>
            <div className={styles.signatureName}>
              {inv.signer || (hasSellerData ? 'Генеральный директор' : 'ФИО, должность')}
            </div>
            <div className={styles.signatureNote}>(подпись и расшифровка)</div>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default InvoiceModal;
