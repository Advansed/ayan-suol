// ContractPage.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLoading,
  IonAlert,
  IonButton,
  IonIcon,
  IonModal,
} from '@ionic/react';
import { closeOutline, download, print } from 'ionicons/icons';
import './styles.css';

interface ContractData {
  document_info: {
    order_number: string;
    city: string;
    day: string;
    month: string;
    year: string;
  };
  customer: {
    name: string;
    gender_suffix: string;
    representative: string;
    representative_gender_suffix: string;
    basis: string;
  };
  carrier: {
    name: string;
    gender_suffix: string;
    representative: string;
    representative_gender_suffix: string;
    basis: string;
  };
  payment: {
    amount: string;
  };
  contract_date: string;
  specification: {
    sender_details: string;
    carrier_details: string;
    recipient_details: string;
    cargo_name: string;
    cargo_quantity: string;
    cargo_dimensions: string;
    cargo_packaging: string;
    special_conditions: string;
    loading_address: string;
    loading_date_time: string;
    destination_address: string;
    delivery_terms: string;
    vehicle_details: string;
    driver_details: string;
  };
}

interface ContractProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
}

const ContractPage: React.FC<ContractProps> = ({ isOpen, onClose, data }) => {
  const [contractData, setContractData] = useState<ContractData | null>( data );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log("data", data)
    if(!data)
        loadContractData();
  }, []);

  const loadContractData = async () => {
    try {
      console.log("loading", true)
      // Здесь будет вызов API для получения данных договора
      // const response = await fetch('/api/contract', { method: 'POST', body: JSON.stringify({ token, id }) });
      // const result = await response.json();
      
      // Временные mock данные для демонстрации
      const mockData: ContractData = {
        document_info: {
          order_number: "____________",
          city: "_______",
          day: "__",
          month: "________",
          year: "____"
        },
        customer: {
          name: "_______________",
          gender_suffix: "__",
          representative: "____________________________________________",
          representative_gender_suffix: "__",
          basis: "________"
        },
        carrier: {
          name: "_________________",
          gender_suffix: "__",
          representative: "_________________________________",
          representative_gender_suffix: "__",
          basis: "______"
        },
        payment: {
          amount: "________"
        },
        contract_date: "_______________",
        specification: {
          sender_details: "___________________________________________________________",
          carrier_details: "__________________________________________________________",
          recipient_details: "_________________________________________________________",
          cargo_name: "____________________",
          cargo_quantity: "______________",
          cargo_dimensions: "_________________________________________",
          cargo_packaging: "____________________",
          special_conditions: "_________________________________________________",
          loading_address: "_____________________________________",
          loading_date_time: "________________________",
          destination_address: "_______________________________________",
          delivery_terms: "___________________",
          vehicle_details: "_________________________________________________",
          driver_details: "__________________________________________________"
        }
      };
      
      setContractData(mockData);
    } catch (err) {
      setError('Ошибка при загрузке данных договора');
    } finally {
      console.log("loading", false)
    }
  };

  const handleDownload = () => {
    // Логика для скачивания PDF
    console.log('Download contract');
  };

  const handlePrint = () => {
    // Логика для печати
    window.print();
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={loading} message="Загру зка договора..." />
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent>
          <IonAlert
            isOpen={!!error}
            onDidDismiss={() => setError('')}
            header="Ошибка"
            message={error}
            buttons={['OK']}
          />
        </IonContent>
      </IonPage>
    );
  }

  if (!contractData) {
    return (
      <IonPage>
        <IonContent>
          <div className="error-message">Данные договора не найдены</div>
        </IonContent>
      </IonPage>
    );
  }

  const { 
    document_info, 
    customer, 
    carrier, 
    payment, 
    contract_date,
    specification 
  } = contractData;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Пользовательское соглашение</IonTitle>
              <IonButton 
                fill    = "clear" 
                slot    = "end" 
                onClick = { onClose }
              >
                <IonIcon icon = { closeOutline } />
              </IonButton>
            </IonToolbar>
          </IonHeader>

      <IonContent>
        <div className="contract-container">
          <div className="header">
            <div>Приложение № 2</div>
            <div>К Пользовательскому соглашению</div>
            <div className="document-title">Договор перевозки груза</div>
            <div>по заказу № {document_info.order_number}</div>
          </div>

          <div className="section">
            г. {document_info.city} "{document_info.day}" {document_info.month} {document_info.year} г.
          </div>

          <div className="section">
            {customer.name}, именуем{customer.gender_suffix} в дальнейшем "Заказчик", в
            лице {customer.representative}, действующего{customer.representative_gender_suffix} на основании
            {customer.basis}, с одной стороны, и
            {carrier.name}, именуем{carrier.gender_suffix} в дальнейшем "Перевозчик", в
            лице {carrier.representative}, действующего{carrier.representative_gender_suffix} на основании
            {carrier.basis}, с другой стороны, именуемые вместе "Стороны", а по
            отдельности "Сторона", заключили настоящий договор (далее - Договор) о
            нижеследующем.
          </div>

          <div className="clause">
            <span className="clause-number">1.</span> Перевозчик обязуется доставить вверенный ему Отправителем груз
            (далее - Груз) в пункт назначения и выдать его получателю, а
            Отправитель обязуется уплатить за перевозку Груза установленную
            плату (провозную плату) в размере {payment.amount} рублей.
          </div>

          <div className="clause">
            <span className="clause-number">2.</span> Стоимость провозной платы является твердой и не подлежит изменению в
            зависимости от фактического количества (объема) при загрузке Груза.
          </div>

          <div className="clause">
            <span className="clause-number">3.</span> Характеристики Груза и условия перевозки указаны в Спецификации к
            настоящему договору (Приложение № 1).
          </div>

          <div className="clause">
            <span className="clause-number">4.</span> Надлежащее исполнение перевозки груза подтверждается актом
            выполненных работ и товарной накладной.
          </div>

          <div className="clause">
            <span className="clause-number">5.</span> В целях обеспечения исполнения обязательства по оплате провозной
            платы стороны заключили с ООО "Груз в рейс" Договор эскроу.
          </div>

          <div className="clause">
            <span className="clause-number">6.</span> Все споры, связанные с заключением, толкованием, исполнением и
            расторжением Договора, будут разрешаться Сторонами путем
            переговоров.
          </div>

          <div className="clause">
            В случае не достижения соглашения в ходе переговоров заинтересованная
            сторона направляет другой стороне письменную претензию на электронную
            почту другой стороны. Срок рассмотрения претензии -- 15 календарных дней
            с момента направления. В случае не урегулирования споров в претензионном
            порядке, а также в случае неполучения ответа на претензию в
            установленного срока, спор может быть передан в Арбитражный суд
            Республики Саха (Якутия).
          </div>

          <div className="clause">
            <span className="clause-number">7.</span> Уведомления и иные юридически значимые сообщения могут направляться
            сторонами по электронной почте или заказным письмом на юридический и
            фактический адрес сторон.
          </div>

          <div className="clause">
            <span className="clause-number">8.</span> Договор подписан сторонами в форме электронного документа путем
            использования Отправителем и Перевозчиком простой электронной
            подписи через Приложение "Груз в рейс".
          </div>

          <div className="clause">
            <span className="clause-number">9.</span> Договор вступает в силу с момента перечисления Заказчиком
            депонируемых денежных средств ООО "Груз в рейс" по Договору
            эскроу.
          </div>

          <div className="clause">
            <span className="clause-number">10.</span> Настоящий договор подписывается путем подписания простой электронной
            подписью и действует до полного исполнения сторонами своих
            обязательств.
          </div>

          <div className="section">
            Приложение № 1 к договору перевозки груза от {contract_date} г.
          </div>

          <div className="section">
            По заказу № {document_info.order_number}
          </div>

          <div className="document-title">Спецификация</div>

          <table>
            <tbody>
              <tr>
                <th>Отправитель:</th>
                <td>{specification.sender_details}</td>
              </tr>
              <tr>
                <th>Перевозчик:</th>
                <td>{specification.carrier_details}</td>
              </tr>
              <tr>
                <th>Получатель:</th>
                <td>{specification.recipient_details}</td>
              </tr>
              <tr>
                <th>Наименование Груза</th>
                <td>{specification.cargo_name}</td>
              </tr>
              <tr>
                <th>Количество (объем) Груза</th>
                <td>{specification.cargo_quantity}</td>
              </tr>
              <tr>
                <th>Габариты и параметры Груза</th>
                <td>{specification.cargo_dimensions}</td>
              </tr>
              <tr>
                <th>Упаковка (тара) Груза</th>
                <td>{specification.cargo_packaging}</td>
              </tr>
              <tr>
                <th>Особые условия перевозки груза</th>
                <td>{specification.special_conditions}</td>
              </tr>
              <tr>
                <th>Адрес загрузки Груза, контактные телефоны работников.</th>
                <td>{specification.loading_address}</td>
              </tr>
              <tr>
                <th>Дата и время загрузки Груза</th>
                <td>{specification.loading_date_time}</td>
              </tr>
              <tr>
                <th>Пункт назначения (адрес доставки)</th>
                <td>{specification.destination_address}</td>
              </tr>
              <tr>
                <th>Сроки доставки Груза</th>
                <td>{specification.delivery_terms}</td>
              </tr>
              <tr>
                <th>Плата за перевозу Груза (провозная плата)</th>
                <td>{payment.amount} рублей</td>
              </tr>
              <tr>
                <th>Наименование и тип транспортного средства</th>
                <td>{specification.vehicle_details}</td>
              </tr>
              <tr>
                <th>ФИО и контактные данные водителя</th>
                <td>{specification.driver_details}</td>
              </tr>
            </tbody>
          </table>

          <div className="signature-block">
            <div className="signature-line">
              <div className="signature-item">
                <div>Заказчик:</div>
                <div className="signature-name"></div>
                <div>{customer.representative}</div>
              </div>
              <div className="signature-item">
                <div>Перевозчик:</div>
                <div className="signature-name"></div>
                <div>{carrier.representative}</div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ContractPage;