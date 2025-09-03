import React from 'react';
import styles from './CargoAgree.module.css';
import { IonButton, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

interface Props1 {
  isOpen: boolean;
  onClose: () => void;
}
const CargoAgree: React.FC<Props1> = ({ isOpen, onClose }) => {
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
                  по заказу № <span className={styles.underline}></span>
                </h1>
                
                <p className={styles.headerText}>
                  г. <span className={styles.underline}></span> 
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                  "<span className={styles.underline}></span>" <span className={styles.underline}></span> <span className={styles.underline}></span> г.
                </p>
                
                <p className={styles.headerText}>
                  <span className={styles.underline}></span>, именуем<span className={styles.underline}></span> в дальнейшем "Заказчик", в лице <span className={styles.underline}></span>, действующего<span className={styles.underline}></span> на основании <span className={styles.underline}></span>, с одной стороны, и <span className={styles.underline}></span>, именуем<span className={styles.underline}></span> в дальнейшем "Перевозчик", в лице <span className={styles.underline}></span>, действующего<span className={styles.underline}></span> на основании <span className={styles.underline}></span>, с другой стороны, именуемые вместе "Стороны", а по отдельности "Сторона", заключили настоящий договор (далее - Договор) о нижеследующем.
                </p>
              </div>

              <div className={styles.clause}>
                <strong>1.</strong> Перевозчик обязуется доставить вверенный ему Отправителем груз (далее - Груз) в пункт назначения и выдать его получателю, а Отправитель обязуется уплатить за перевозку Груза установленную плату (провозную плату) в размере <span className={styles.underline}></span> рублей.
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
                <strong>10.</strong> Настоящий договор подписывается путем подписания простой электронной подписью и действует до полного исполнения сторонами своих обязательств.
              </div>

              <div className={styles.specification}>
                <h2 className={styles.title}>
                  Приложение № 1 к договору перевозки груза от <span className={styles.underline}></span> г.<br />
                  По заказу № <span className={styles.underline}></span>
                </h2>
                <h1 className={styles.mainTitle}>Спецификация</h1>

                <table className={styles.specTable}>
                  <tbody>
                    <tr>
                      <td>Отправитель:</td>
                      <td>Организационно-правовая форма и фирменное наименование юридического лица в лице должность фамилия имя отчество, действующего (ей) на основании наименование документа, ОГРН указать номер, ИНН указать номер</td>
                    </tr>
                    <tr>
                      <td>Перевозчик:</td>
                      <td>Организационно-правовая форма и фирменное наименование юридического лица в лице должность фамилия имя отчество, действующего (ей) на основании наименование документа, ОГРН указать номер, ИНН указать номер</td>
                    </tr>
                    <tr>
                      <td>Получатель:</td>
                      <td>Организационно-правовая форма и фирменное наименование юридического лица в лице должность фамилия имя отчество, действующего (ей) на основании наименование документа, ОГРН указать номер, ИНН указать номер</td>
                    </tr>
                    <tr>
                      <td>Наименование Груза</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Количество (объем) Груза</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Габариты и параметры Груза</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Упаковка (тара) Груза</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Особые условия перевозки груза</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Адрес загрузки Груза, контактные телефоны работников</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Дата и время загрузки Груза</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Пункт назначения (адрес доставки)</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Сроки доставки Груза</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Плата за перевозу Груза (провозная плата)</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Наименование и тип транспортного средства (модель, марка, государственный регистрационный знак)</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>ФИО и контактные данные водителя транспортного средства</td>
                      <td></td>
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