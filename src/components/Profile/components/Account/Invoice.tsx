import React from "react";
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from "@ionic/react";
import { closeOutline, downloadOutline, printOutline } from "ionicons/icons";
import { formatters } from "../../../Cargos";
import styles from './styles.module.css';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Filesystem, Directory } from "@capacitor/filesystem";

// Типы для данных из companyStore
interface SellerData {
    name:           "",
    address:        "",
    inn:            "",
    kpp:          "",
    ogrn:         "",
    account:      "",
    bank:           "",
    bankInn:        "",
    bik:            "",
    korAccount:     "",
    bankAddress:    ""
}

interface InvoiceItem {
  item_name:        string;
  qty:              number;
  unit:             string;
  price:            number;
  total:            number;
}

interface CustomerData {
  name:             string;
  address:          number;
  inn:              string;
}

interface InvoiceModalProps {
  isOpen:           boolean;
  onClose: () =>    void;
  inv:              InvoiceData;
}

interface InvoiceData   {
  invoiceNumber:    string,
  invoiceDate:      string,
  customer:         CustomerData,
  items:            InvoiceItem[],
  total:            number,
  vat:              number,
  paymentPurpose:   string,
  paymentDue:       string,
  seller:           SellerData,
  signer:           string,
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  inv
}) => {
  // Проверяем, есть ли данные продавца
  const hasSellerData = inv.seller && inv.seller.name;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async() => {
    // Логика для скачивания PDF
 try {
      const invoiceEl = document.querySelector(`.${styles.invoiceContainer}`) as HTMLElement;
      if (!invoiceEl) {
        console.warn("Invoice element not found");
        return;
      }

      // Рендерим HTML в Canvas
      const canvas = await html2canvas(invoiceEl, {
        useCORS: true, // Важно, если есть картинки или шрифты
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      // Пропорционально подгоняем размер изображения под ширину страницы
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Конвертируем PDF в base64
      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      // Сохраняем файл на устройстве
      const fileName = `invoice_${inv.invoiceNumber}.pdf`;
      const result = await Filesystem.writeFile({
        path:       fileName,
        data:       pdfBase64,
        directory:  Directory.Library,
      });

      console.log("PDF сохранён:", result.uri);
      alert(`Счёт сохранён как ${fileName}`);

    } catch (err) {
      console.error("Ошибка при сохранении PDF:", err);
    } 
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className={styles.modal}>
      <IonHeader>
        <IonToolbar className={styles.toolbar}>
          <IonButtons slot="end">
            <IonButton onClick={handleDownload}>
              <IonIcon icon={downloadOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={handlePrint}>
              <IonIcon icon={printOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className={styles.content}>
        <div className={styles.invoiceContainer}>
          <div className={styles.header}>
            Счет на оплату № {inv.invoiceNumber} от {inv.invoiceDate}
          </div>

          {/* Поставщик - данные из companyStore */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Поставщик:</div>
            <div className={styles.sectionContent}>
              {hasSellerData ? inv.seller.name : <span className={styles.emptyData}>________________________</span>}
              
              {hasSellerData && inv.seller.address && (
                <div className={styles.flexRow}>
                  <strong>Юридический адрес:</strong>
                  <div style={{marginLeft: 8}}>{inv.seller.address}</div>
                </div>
              )}
              
              {hasSellerData && inv.seller.inn && (
                <div className={styles.flexRow}>
                  <strong>ИНН:</strong> 
                  <div style={{marginLeft: 8}}>
                    {inv.seller.inn}{inv.seller.kpp ? ` КПП: ${inv.seller.kpp}` : ''}
                  </div>
                </div>
              )}
              
              {hasSellerData && inv.seller.ogrn && (
                <div className={styles.flexRow}>
                  <strong>ОГРН:</strong>
                  <div style={{marginLeft: 8}}>{inv.seller.ogrn}</div>
                </div>
              )}
              
              {hasSellerData && inv.seller.account && inv.seller.bank && (
                <div className={styles.flexRow}>
                  <strong>р/с:</strong>
                  <div style={{marginLeft: 8}}>{inv.seller.account} в {inv.seller.bank}</div>
                </div>
              )}
              
              {hasSellerData && inv.seller.bik && (
                <div className={styles.flexRow}>
                  <strong>БИК:</strong>
                  <div style={{marginLeft: 8}}>
                    {inv.seller.bik}{inv.seller.korAccount ? ` к/с: ${inv.seller.korAccount}` : ''}
                  </div>
                </div>
              )}
              
              {hasSellerData && inv.seller.bankAddress && (
                <div className={styles.flexRow}>
                  <strong>Адрес банка:</strong>
                  <div style={{marginLeft: 8}}>{inv.seller.bankAddress}</div>
                </div>
              )}
              
              {!hasSellerData && <span className={styles.emptyData}>Данные поставщика не заполнены</span>}
            </div>
          </div>

          {/* Покупатель */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Покупатель:</div>
            <div className={styles.sectionContent}>
              {inv.customer.name || <span className={styles.emptyData}>________________________</span>}
              
              {inv.customer.inn && (
                <div className={styles.flexRow}>
                  <strong>ИНН:</strong>
                  <div style={{marginLeft: 8}}>{inv.customer.inn}</div>
                </div>
              )}
              
              {inv.customer.address && (
                <div className={styles.flexRow}>
                  <strong>Адрес:</strong>
                  <div style={{marginLeft: 8}}>{inv.customer.address}</div>
                </div>
              )}
              
              {!inv.customer.name && !inv.customer.inn && !inv.customer.address && 
                <span className={styles.emptyData}>Данные покупателя не указаны</span>
              }
            </div>
          </div>

          {/* Таблица товаров/услуг */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>№</th>
                <th className={styles.tableHeader}>Наименование</th>
                <th className={styles.tableHeader}>Кол-во</th>
                <th className={styles.tableHeader}>Ед.</th>
                <th className={styles.tableHeader}>Цена</th>
                <th className={styles.tableHeader}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.length > 0 ? inv.items.map((item, idx) => (
                <tr key={idx}>
                  <td className={styles.tableCell}>{idx + 1}</td>
                  <td className={styles.tableCellLeft}>{item.item_name}</td>
                  <td className={styles.tableCell}>{item.qty}</td>
                  <td className={styles.tableCell}>{item.unit}</td>
                  <td className={styles.tableCellRight}>
                    {item.price.toLocaleString('ru-RU')} руб.
                  </td>
                  <td className={styles.tableCellRight}>
                    {item.total.toLocaleString('ru-RU')} руб.
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className={styles.tableCell}>1</td>
                  <td className={styles.tableCellLeft}>
                    <span className={styles.emptyData}>___________</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.emptyData}>___</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.emptyData}>___</span>
                  </td>
                  <td className={styles.tableCellRight}>
                    <span className={styles.emptyData}>___</span>
                  </td>
                  <td className={styles.tableCellRight}>
                    <span className={styles.emptyData}>___</span>
                  </td>
                </tr>
              )}
              
              {/* Итого */}
              <tr className={styles.totalRow}>
                <td colSpan={5} className={styles.tableCellRight}>
                  Итого:
                </td>
                <td className={styles.tableCellRight}>
                  {formatters.currency(inv.total)}
                </td>
              </tr>
              
              {/* НДС */}
              {inv.vat > 0 && (
                <tr>
                  <td colSpan={5} className={styles.tableCellRight}>
                    В том числе НДС
                  </td>
                  <td className={styles.tableCellRight}>
                    {formatters.currency(inv.vat)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Условия оплаты */}
          <div className={styles.paymentInfo}>
            {inv.paymentDue && (
              <div style={{marginBottom: "8px"}}>
                <strong>Срок оплаты:</strong> {inv.paymentDue}
              </div>
            )}
            <div>
              <strong>Назначение платежа:</strong> {inv.paymentPurpose || `Оплата по счету №${inv.invoiceNumber} от ${inv.invoiceDate}`}
            </div>
          </div>

          {/* Подпись */}
          <div className={styles.signature}>
            <div className={styles.signatureLine}>
              ________________________ 
            </div>
            <div className={styles.signatureText}>
              {inv.signer || (hasSellerData ? "Генеральный директор" : "ФИО, должность")}
            </div>
            <div className={styles.signatureNote}>
              (подпись и расшифровка)
            </div>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default InvoiceModal;