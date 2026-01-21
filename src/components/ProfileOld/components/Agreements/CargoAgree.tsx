import React from 'react';
import styles from './CargoAgree.module.css';
import { IonButton, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

interface Props1 {
  isOpen: boolean;
  onClose?: () => void;
  orderData?: {
    orderNumber?: string;
    city?: string;
    date?: string;
    customer?: {
      name?: string;
      representative?: string;
      basis?: string;
    };
    carrier?: {
      name?: string;
      representative?: string;
      basis?: string;
    };
    payment?: string;
    specification?: {
      sender?: string;
      receiver?: string;
      cargoName?: string;
      cargoQuantity?: string;
      cargoDimensions?: string;
      cargoPackaging?: string;
      specialConditions?: string;
      loadingAddress?: string;
      loadingDateTime?: string;
      destination?: string;
      deliveryTerms?: string;
      vehicle?: string;
      driver?: string;
    };
  };
}

const CargoAgree: React.FC<Props1> = ({ isOpen, onClose, orderData }) => {
  const renderField = (value: string | undefined, placeholder: string = '') => {
    if (value) {
      return <span className={styles.filled}>{value}</span>;
    }
    return <span className={styles.underline}>{placeholder}</span>;
  };

  const renderTableCell = (value: string | undefined, placeholder: string = '') => {
    if (value) {
      return <span className={styles.filledData}>{value}</span>;
    }
    return <span>{placeholder}</span>;
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Пользовательское соглашение</IonTitle>
              <IonButton 
                fill="clear" 
                slot="end" 
                onClick={onClose}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          
          <IonContent className="ion-padding">
            <div className={styles.container}>
              <div className={styles.header}>
                <h2 className={styles.title}>
                  Приложение № 2<br />
                  К Пользовательскому соглашению
                </h2>
                <h1 className={styles.mainTitle}>
                  Договор перевозки груза<br />
                  по заказу № {renderField(orderData?.orderNumber)}
                </h1>
                
                <p className={styles.headerText}>
                  г. {renderField(orderData?.city)} 
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                  "{renderField(orderData?.date)}" г.
                </p>
                
                <p className={styles.headerText}>
                  {renderField(orderData?.customer?.name, '[Название компании Заказчика]')}, именуемый в дальнейшем "Заказчик", в лице {renderField(orderData?.customer?.representative, '[должность ФИО]')}, действующего на основании {renderField(orderData?.customer?.basis, '[Устава/Доверенности]')}, с одной стороны, и {renderField(orderData?.carrier?.name, '[Название компании Перевозчика]')}, именуем{renderField('ый', '[ый/ая]')} в дальнейшем "Перевозчик", в лице {renderField(orderData?.carrier?.representative, '[должность ФИО]')}, действующего{renderField('го', '[го/ей]')} на основании {renderField(orderData?.carrier?.basis, '[Устава/Доверенности]')}, с другой стороны, именуемые вместе "Стороны", а по отдельности "Сторона", заключили настоящий договор (далее - Договор) о нижеследующем.
                </p>
              </div>

              <div className={styles.clause}>
                <strong>1.</strong> Перевозчик обязуется доставить вверенный ему Отправителем груз (далее - Груз) в пункт назначения и выдать его получателю, а Отправитель обязуется уплатить за перевозку Груза установленную плату (провозную плату) в размере {renderField(orderData?.payment)} рублей.
              </div>

              <div className={styles.clause}>
                <strong>2.</strong> Стоимость провозной платы является твердой и не подлежит изменению в зависимости от фактического количества (объема) при загрузке Груза.
              </div>

              <div className={styles.clause}>
                <strong>3.</strong> Характеристики Груза и условия перевозки указаны в Спецификации к настоящему договору (Приложение № 1).
              </div>

              <div className={styles.clause}>
                <strong>4.</strong> Надлежащее исполнение перевозки груза подтверждается актом выполненных работ и товарной накладной.
              </div>

              <div className={styles.clause}>
                <strong>5.</strong> В целях обеспечения исполнения обязательства по оплате провозной платы стороны заключили с ООО "Груз в рейс" Договор эскроу.
              </div>

              <div className={styles.clause}>
                <strong>6.</strong> Все споры, связанные с заключением, толкованием, исполнением и расторжением Договора, будут разрешаться Сторонами путем переговоров.<br />
                В случае не достижения соглашения в ходе переговоров заинтересованная сторона направляет другой стороне письменную претензию на электронную почту другой стороны. Срок рассмотрения претензии – 15 календарных дней с момента направления. В случае не урегулирования споров в претензионном порядке, а также в случае неполучения ответа на претензию в установленного срока, спор может быть передан в Арбитражный суд Республики Саха (Якутия).
              </div>

              <div className={styles.clause}>
                <strong>7.</strong> Уведомления и иные юридически значимые сообщения могут направляться сторонами по электронной почте или заказным письмом на юридический и фактический адрес сторон.
              </div>

              <div className={styles.clause}>
                <strong>8.</strong> Договор подписан сторонами в форме электронного документа путем использования Отправителем и Перевозчиком простой электронной подписи через Приложение "Груз в рейс".
              </div>

              <div className={styles.clause}>
                <strong>9.</strong> Договор вступает в силу с момента перечисления Заказчиком депонируемых денежных средств ООО "Груз в рейс" по Договору эскроу.
              </div>

              <div className={styles.clause}>
                <strong>10.</strong> Настоящий договор подписывается путем подписания простой электронной подписи и действует до полного исполнения сторонами своих обязательств.
              </div>

              <div className={styles.specification}>
                <h2 className={styles.title}>
                  Приложение № 1 к договору перевозки груза от {renderField(orderData?.date)} г.<br />
                  По заказу № {renderField(orderData?.orderNumber)}
                </h2>
                <h1 className={styles.mainTitle}>Спецификация</h1>

                <table className={styles.specTable}>
                  <tbody>
                    <tr>
                      <td>Отправитель:</td>
                      <td>{renderTableCell(orderData?.specification?.sender, 'Организационно-правовая форма и фирменное наименование юридического лица в лице должность фамилия имя отчество, действующего (ей) на основании наименование документа, ОГРН указать номер, ИНН указать номер')}</td>
                    </tr>
                    <tr>
                      <td>Перевозчик:</td>
                      <td>{renderTableCell(orderData?.specification?.sender, 'Организационно-правовая форма и фирменное наименование юридического лица в лице должность фамилия имя отчество, действующего (ей) на основании наименование документа, ОГРН указать номер, ИНН указать номер')}</td>
                    </tr>
                    <tr>
                      <td>Получатель:</td>
                      <td>{renderTableCell(orderData?.specification?.receiver, 'Организационно-правовая форма и фирменное наименование юридического лица в лице должность фамилия имя отчество, действующего (ей) на основании наименование документа, ОГРН указать номер, ИНН указать номер')}</td>
                    </tr>
                    <tr>
                      <td>Наименование Груза</td>
                      <td>{renderTableCell(orderData?.specification?.cargoName)}</td>
                    </tr>
                    <tr>
                      <td>Количество (объем) Груза</td>
                      <td>{renderTableCell(orderData?.specification?.cargoQuantity)}</td>
                    </tr>
                    <tr>
                      <td>Габариты и параметры Груза</td>
                      <td>{renderTableCell(orderData?.specification?.cargoDimensions)}</td>
                    </tr>
                    <tr>
                      <td>Упаковка (тара) Груза</td>
                      <td>{renderTableCell(orderData?.specification?.cargoPackaging)}</td>
                    </tr>
                    <tr>
                      <td>Особые условия перевозки груза</td>
                      <td>{renderTableCell(orderData?.specification?.specialConditions)}</td>
                    </tr>
                    <tr>
                      <td>Адрес загрузки Груза, контактные телефоны работников</td>
                      <td>{renderTableCell(orderData?.specification?.loadingAddress)}</td>
                    </tr>
                    <tr>
                      <td>Дата и время загрузки Груза</td>
                      <td>{renderTableCell(orderData?.specification?.loadingDateTime)}</td>
                    </tr>
                    <tr>
                      <td>Пункт назначения (адрес доставки)</td>
                      <td>{renderTableCell(orderData?.specification?.destination)}</td>
                    </tr>
                    <tr>
                      <td>Сроки доставки Груза</td>
                      <td>{renderTableCell(orderData?.specification?.deliveryTerms)}</td>
                    </tr>
                    <tr>
                      <td>Плата за перевозу Груза (провозная плата)</td>
                      <td>{renderTableCell(orderData?.payment)}</td>
                    </tr>
                    <tr>
                      <td>Наименование и тип транспортного средства (модель, марка, государственный регистрационный знак)</td>
                      <td>{renderTableCell(orderData?.specification?.vehicle)}</td>
                    </tr>
                    <tr>
                      <td>ФИО и контактные данные водителя транспортного средства</td>
                      <td>{renderTableCell(orderData?.specification?.driver)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </IonContent>
    </IonModal>
  );
};

export default CargoAgree;
