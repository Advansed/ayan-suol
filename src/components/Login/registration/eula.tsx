import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { IonButton } from '@ionic/react';
import styles from './eula.module.css';

const UserAgreementPage = () => {

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <ArrowLeft className={styles.backIcon} />
        <h1 className={styles.headerTitle}>Пользовательское соглашение</h1>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.card}>
          
          <section>
            <h2 className={styles.sectionTitle}>Общие положения</h2>
            <div className={styles.textContent}>
              <p>Настоящее пользовательское соглашение является публичной офертой ООО "Прайм-Групп" и определяет условия использования мобильного приложения "Название приложения" пользователями данного приложения.</p>
              <p>Приложение создано в целях оказания содействия по заключению договоров перевозки грузов между заказчиками и перевозчиками, которые зарегистрированы в качестве пользователей Приложения, путем создания возможности для Заказчика создать заказ на перевозку груза с правом выбора Перевозчика, а для Перевозчиков – по поиску и принятию размещенного заказа на грузоперевозку на условиях, предложенных Заказчиком или на согласованных между сторонами условиях.</p>
              <p>ООО "Прайм-Групп" и Приложение не являются диспетчерской службой и не осуществляют распределение Заказов на перевозку груза между Пользователями Приложения. Срок рассмотрения претензии составляет 30 календарных дней.</p>
              <p>В случае невозможности урегулирования споров путем переговоров спор рассматривается по месту нахождения ООО "Прайм-Групп".</p>
              <p>Пользователи Приложения самостоятельно принимают решение о выборе контрагента для заключения договора перевозки груза.</p>
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Термины, используемые в настоящем соглашении</h2>
            <div className={styles.termsContainer}>
              <div className={styles.termItem}>
                <h3 className={styles.termTitle}>Приложение "Название приложения"</h3>
                <p className={styles.termDescription}>программное обеспечение, применяемое физическими и юридическими лицами с использованием технического устройства, функционирующее на базе инфраструктуры взаимодействия Заказчика и Грузоперевозчика</p>
              </div>
              <div className={styles.termItem}>
                <h3 className={styles.termTitle}>Пользователь</h3>
                <p className={styles.termDescription}>юридическое или физическое лицо, прошедшее регистрацию в Приложении, и имеющее свой личный кабинет в Приложении в качестве Заказчика или Перевозчика</p>
              </div>
              <div className={styles.termItem}>
                <h3 className={styles.termTitle}>Пользователь-Заказчик</h3>
                <p className={styles.termDescription}>юридическое или физическое лицо (в том числе ИП), прошедшее регистрацию в Приложении в качестве Заказчика с целью создания заказов на перевозку грузов</p>
              </div>
              <div className={styles.termItem}>
                <h3 className={styles.termTitle}>Пользователь-Перевозчик</h3>
                <p className={styles.termDescription}>юридическое лицо или индивидуальный предприниматель, прошедшее регистрацию в Приложении в качестве Перевозчика с целью поиска и выбора заказов на перевозку груза</p>
              </div>
              <div className={styles.termItem}>
                <h3 className={styles.termTitle}>Регистрационный платеж</h3>
                <p className={styles.termDescription}>денежные средства, перечисляемые юридическим лицом на расчетный счет ООО "Прайм-Групп" на безвозвратной основе для подтверждения регистрации Пользователя-юридического лица</p>
              </div>
              <div className={styles.termItem}>
                <h3 className={styles.termTitle}>Сервисное вознаграждение от Перевозчика</h3>
                <p className={styles.termDescription}>денежные средства, списываемые в безакцептном порядке в собственность ООО "Прайм-групп" из баланса Перевозчика в качестве вознаграждения за заключение договора перевозки груза с Пользователем-Заказчиком с использованием Приложения и составляет 3,88 % от стоимости заключенного с Пользователем-Заказчиком договора на перевозку груза</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Регистрация Пользователя в Приложении</h2>
            <div className={styles.tableContainer}>
              <table className={styles.registrationTable}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th className={styles.tableHeaderCell}>Этап регистрации</th>
                    <th className={styles.tableHeaderCell}>Для физических лиц</th>
                    <th className={styles.tableHeaderCell}>Для юридических лиц</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.tableCell + ' ' + styles.tableCellBold}>1-ый этап: выбор статуса</td>
                    <td className={styles.tableCell + ' ' + styles.tableCellSpan}>В качестве Заказчика или Перевозчика</td>
                  </tr>
                  <tr>
                    <td className={styles.tableCell + ' ' + styles.tableCellBold}>2-ой этап: заполнение сведений</td>
                    <td className={styles.tableCell}>ФИО, дата и место рождения, паспортные данные, место регистрации и проживания, email, телефон, ИНН, данные ТС</td>
                    <td className={styles.tableCell}>Наименование, ОГРН, ИНН, адреса, данные руководителя, банковские реквизиты</td>
                  </tr>
                  <tr>
                    <td className={styles.tableCell + ' ' + styles.tableCellBold}>3-ий этап: создание логина и пароля</td>
                    <td className={styles.tableCell + ' ' + styles.tableCellSpan}>Логин из латинских букв от 6 до 20 символов</td>
                  </tr>
                  <tr>
                    <td className={styles.tableCell + ' ' + styles.tableCellBold}>4-ый этап: подтверждение</td>
                    <td className={styles.tableCell}>SMS-подтверждение на телефон</td>
                    <td className={styles.tableCell}>Регистрационный платеж 100 рублей в течение 2 рабочих дней</td>
                  </tr>
                  <tr>
                    <td className={styles.tableCell + ' ' + styles.tableCellBold}>5-ый этап: подтверждение успешной регистрации</td>
                    <td className={styles.tableCell}>Сообщение на email или телефон</td>
                    <td className={styles.tableCell}>Сообщение на email в течение 2 рабочих дней</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.tableFooter}>
              <p>Созданный Пользователем индивидуальный логин и пароль для аутентификации в личном кабинете Приложения используются в качестве простой электронной подписи.</p>
              <p>С момента присоединения к Соглашению Пользователь заверяет ООО "Прайм-Групп" о достоверности информации, внесенной в регистрационную форму и обязуется поддерживать указанные сведения в актуальном состоянии.</p>
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Порядок пользования Приложением</h2>
            <div className={styles.textContent}>
              <p>Любые операции, выполненные в Приложении через авторизацию личного кабинета вне зависимости от статуса считаются выполненными Пользователем.</p>
              
              <div className={styles.highlightBox}>
                <h3 className={styles.highlightTitle}>Важно знать:</h3>
                <p>Пользователи Приложения самостоятельно принимают решение о выборе контрагента для заключения договора перевозки груза.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Внесение изменений в Пользовательское соглашение</h2>
            <p className={styles.textParagraph}>
              ООО "Прайм-Групп" вправе в одностороннем порядке изменять условия настоящего Соглашения путем публикации на главной странице Приложения новой редакции. В случае несогласия Пользователь должен в течение 10 календарных дней прекратить использование Приложения и направить письменное уведомление об отказе.
            </p>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Ответственность сторон</h2>
            <div className={styles.listContainer}>
              <p>• Пользователь использует Приложение на условиях «как есть» («as is»), без гарантий любого рода</p>
              <p>• Пользователь самостоятельно несет ответственность за соответствие размещаемой информации требованиям законодательства</p>
              <p>• Пользователь самостоятельно несет ответственность за безопасность средств доступа к учетной записи</p>
              <p>• ООО "Прайм-Групп" не несет ответственность за неисполнение обязательств по Договору перевозки между пользователями</p>
              <p>• ООО "Прайм-Групп" не несет ответственность за прерывание работы Приложения</p>
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Приложения к Пользовательскому соглашению</h2>
            <div className={styles.listContainer}>
              <p>Приложение № 1 – Согласие на обработку персональных данных</p>
              <p>Приложение № 2 – Форма договора перевозки груза</p>
              <p>Приложение № 3 – Форма договора независимой гарантии</p>
              <p>Приложение № 4 – Соглашение об использовании простой электронной подписи</p>
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Заключительные условия</h2>
            <div className={styles.textContent}>
              <p>Настоящее соглашение считается принятым Пользователем с момента регистрации в Приложении.</p>
              <p>Заключая настоящее Соглашение, Пользователь дает согласие на получение сообщений рекламного характера.</p>
              <p>Претензии направляются на электронную почту ООО "Прайм-Групп".</p>
            </div>
          </section>

        </div>

        {/* Accept Button */}
        <div className={styles.acceptSection}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} />
            <span className={styles.checkboxText}>Я прочитал(а) и согласен(на) с условиями пользовательского соглашения</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default UserAgreementPage;