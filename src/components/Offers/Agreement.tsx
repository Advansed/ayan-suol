import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { 
  menuOutline, 
  refreshOutline, 
  warningOutline, 
  personOutline, 
  attachOutline,
  checkmarkCircleOutline,
  downloadOutline
} from 'ionicons/icons';
import styles from './Agreement.module.css';

export interface AgreementData {
  orderId: string;
  agreedPrice: number;
  contractId: string;
  contractDate: string;
  performer: {
    companyName?: string;
    representative?: string;
    tin?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  customer: {
    companyName?: string;
    representative?: string;
    tin?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  route: {
    from: string;
    to: string;
  };
  dates: {
    start: string;
    end: string;
  };
  cargo: {
    weight: number;
    volume: number;
  };
  payment: {
    total: number;
    prepayment: number;
    prepaymentPercent: number;
    remaining: number;
  };
  performerSignature?: {
    name: string;
    sign?: string;
  };
  customerSignature?: {
    name: string;
    sign?: string;
  };
}

interface AgreementProps {
  data: AgreementData;
  onMenu?: () => void;
  onRefresh?: () => void;
  onCancel?: () => void;
  onDownload?: () => void;
  onSign?: () => void;
}

export const Agreement: React.FC<AgreementProps> = ({
  data,
  onMenu,
  onRefresh,
  onCancel,
  onDownload,
  onSign
}) => {
  const formatPrice = (price: number): string => {
    return price.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';
  };

  const formatDate = (date: string): string => {
    return date; // Assuming date is already formatted
  };

  return (
    <div className={styles.agreementContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button 
          className={styles.menuButton}
          onClick={onMenu}
        >
          <IonIcon icon={menuOutline} />
        </button>
        
        <div className={styles.headerContent}>
          <h2 className={styles.headerTitle}>Оформление договора</h2>
          <div className={styles.headerInfo}>
            <span>Заказ ID: {data.orderId.substr(0, 8)}</span>
            <span>Согласованная цена: {formatPrice(data.agreedPrice)}</span>
          </div>
        </div>

        <button 
          className={styles.refreshButton}
          onClick={onRefresh}
        >
          <IonIcon icon={refreshOutline} />
        </button>
      </div>

      {/* Warning Section */}
      <div className={styles.warningBox}>
        <IonIcon icon={warningOutline} className={styles.warningIcon} />
        <div className={styles.warningContent}>
          <div className={styles.warningTitle}>Внимание! Ознакомьтесь с полным договором</div>
          <div className={styles.warningText}>
            Перед подписанием обязательно скачайте и внимательно прочитайте полный текст договора. 
            Подписывая договор, вы принимаете все условия и обязательства.
          </div>
        </div>
      </div>

      {/* Contract ID and Date */}
      <div className={styles.contractInfo}>
        № {data.contractId} от {formatDate(data.contractDate)}
      </div>

      {/* Parties Section */}
      <div className={styles.partiesSection}>
        <div className={styles.partyBox}>
          <div className={`${styles.partyHeader} ${styles.performerHeader}`}>
            <IonIcon icon={personOutline} />
            <span>ИСПОЛНИТЕЛЬ (Перевозчик)</span>
          </div>
          <div className={styles.partyContent}>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                {data.performer.companyName || 'Название компании'}
              </span>
            </div>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                {data.performer.representative || 'Представитель'}
              </span>
            </div>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                ИНН: {data.performer.tin || '__________'}
              </span>
            </div>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                {data.performer.address || 'Адрес'}
              </span>
            </div>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                {data.performer.phone || 'Телефон'}
              </span>
            </div>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                {data.performer.email || 'Email'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.partyBox}>
          <div className={`${styles.partyHeader} ${styles.customerHeader}`}>
            <IonIcon icon={personOutline} />
            <span>Заказчик</span>
          </div>
          <div className={styles.partyContent}>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                {data.customer.companyName || 'Название компании'}
              </span>
            </div>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                {data.customer.representative || 'Представитель'}
              </span>
            </div>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                ИНН: {data.customer.tin || '__________'}
              </span>
            </div>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                {data.customer.address || 'Адрес'}
              </span>
            </div>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                {data.customer.phone || 'Телефон'}
              </span>
            </div>
            <div className={styles.partyField}>
              <span className={styles.placeholder}>
                {data.customer.email || 'Email'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Subject of Agreement */}
      <div className={styles.section}>
        <div className={`${styles.sectionHeader} ${styles.sectionGreen}`}>
          <IonIcon icon={attachOutline} />
          <span>1. ПРЕДМЕТ ДОГОВОРА</span>
        </div>
        <div className={styles.sectionGrid}>
          <div className={styles.infoBox}>
            <div className={styles.infoLabel}>Маршрут</div>
            <div className={styles.infoValue}>
              {data.route.from} → {data.route.to}
            </div>
          </div>
          <div className={styles.infoBox}>
            <div className={styles.infoLabel}>Даты</div>
            <div className={styles.infoValue}>
              {formatDate(data.dates.start)} - {formatDate(data.dates.end)}
            </div>
          </div>
          <div className={styles.infoBox}>
            <div className={styles.infoLabel}>Вес груза</div>
            <div className={styles.infoValue}>{data.cargo.weight} тонн</div>
          </div>
          <div className={styles.infoBox}>
            <div className={styles.infoLabel}>Объем</div>
            <div className={styles.infoValue}>{data.cargo.volume} м³</div>
          </div>
        </div>
      </div>

      {/* Section 2: Cost and Payment Procedure */}
      <div className={styles.section}>
        <div className={`${styles.sectionHeader} ${styles.sectionOrange}`}>
          <IonIcon icon={attachOutline} />
          <span>2. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ</span>
        </div>
        <div className={styles.paymentSection}>
          <div className={styles.totalCostBox}>
            <div className={styles.totalCostLabel}>Общая стоимость услуг</div>
            <div className={styles.totalCostValue}>
              {formatPrice(data.payment.total)}
            </div>
          </div>
          <div className={styles.paymentGrid}>
            <div className={styles.paymentBox}>
              <div className={styles.paymentLabel}>
                Предоплата ({data.payment.prepaymentPercent}%)
              </div>
              <div className={styles.paymentValue}>
                {formatPrice(data.payment.prepayment)}
              </div>
              <div className={styles.paymentNote}>До начала перевозки</div>
            </div>
            <div className={styles.paymentBox}>
              <div className={styles.paymentLabel}>Остаток</div>
              <div className={styles.paymentValue}>
                {formatPrice(data.payment.remaining)}
              </div>
              <div className={styles.paymentNote}>После доставки груза</div>
            </div>
          </div>
          <div className={styles.securePaymentBox}>
            <IonIcon icon={checkmarkCircleOutline} className={styles.checkIcon} />
            <div className={styles.securePaymentContent}>
              <div className={styles.securePaymentTitle}>
                Безопасная оплата через платформу
              </div>
              <div className={styles.securePaymentText}>
                Все платежи проходят через специальный счет приложения. 
                Комиссия платформы 5% обеспечивает защиту обеих сторон и гарантию выполнения сделки.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Rights and Obligations */}
      <div className={styles.section}>
        <div className={`${styles.sectionHeader} ${styles.sectionBlue}`}>
          <IonIcon icon={attachOutline} />
          <span>3. ПРАВА И ОБЯЗАННОСТИ СТОРОН</span>
        </div>
        <div className={styles.obligationsContent}>
          <div className={styles.obligationsSection}>
            <div className={styles.obligationsTitle}>Исполнитель обязан:</div>
            <ul className={styles.obligationsList}>
              <li>Обеспечить сохранность груза</li>
              <li>Предоставить необходимые документы</li>
              <li>Соблюдать сроки доставки</li>
            </ul>
          </div>
          <div className={styles.obligationsSection}>
            <div className={styles.obligationsTitle}>Заказчик обязан:</div>
            <ul className={styles.obligationsList}>
              <li>Обеспечить доступ для погрузки/разгрузки</li>
              <li>Предоставить необходимые документы</li>
              <li>Оплатить услуги в установленные сроки</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className={styles.signatureSection}>
        <div className={styles.signatureBox}>
          <div className={`${styles.signatureHeader} ${styles.performerHeader}`}>
            Исполнитель
          </div>
          <div className={styles.signaturePlace}>
            <IonIcon icon={attachOutline} />
            <div className={styles.signatureLabel}>Место для подписи</div>
            <div className={styles.signatureName}>
              {data.performerSignature?.name || 'Петров Петр Петрович'}
            </div>
          </div>
        </div>

        <div className={styles.signatureBox}>
          <div className={`${styles.signatureHeader} ${styles.customerHeader}`}>
            Заказчик
          </div>
          <div className={styles.signaturePlace}>
            <IonIcon icon={attachOutline} />
            <div className={styles.signatureLabel}>Подпись и печать</div>
            <div className={styles.signatureName}>
              {data.customerSignature?.name || 'Николаев Николай Николаевич'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className={styles.buttonsSection}>
        <IonButton 
          className={styles.cancelButton}
          onClick={onCancel}
          expand="block"
        >
          Отменить
        </IonButton>
        <IonButton 
          className={styles.downloadButton}
          onClick={onDownload}
          expand="block"
          fill="outline"
        >
          <IonIcon icon={downloadOutline} slot="start" />
          скачать образец полного договора
        </IonButton>
        <IonButton 
          className={styles.signButton}
          onClick={onSign}
          expand="block"
        >
          Подписать
        </IonButton>
      </div>
    </div>
  );
};

// Пример использования с mock данными для отладки:
// import { Agreement } from './Agreement';
// import { mockAgreementData } from './Agreement.mock';
// 
// <Agreement
//   data={mockAgreementData}
//   onMenu={() => console.log('Menu clicked')}
//   onRefresh={() => console.log('Refresh clicked')}
//   onCancel={() => console.log('Cancel clicked')}
//   onDownload={() => console.log('Download clicked')}
//   onSign={() => console.log('Sign clicked')}
// />
