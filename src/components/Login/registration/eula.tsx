import React from 'react';
import { ArrowLeft } from 'lucide-react';

const UserAgreementPage = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center">
        <ArrowLeft className="w-6 h-6 text-gray-600 mr-3" />
        <h1 className="text-lg font-semibold text-gray-900">Пользовательское соглашение</h1>
      </div>

      {/* Content */}
      {/* <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Общие положения</h2>
            <div className="text-gray-700 text-sm leading-relaxed space-y-3">
              <p>Настоящее пользовательское соглашение является публичной офертой ООО "Прайм-Групп" и определяет условия использования мобильного приложения "Название приложения" пользователями данного приложения.</p>
              <p>Приложение создано в целях оказания содействия по заключению договоров перевозки грузов между заказчиками и перевозчиками, которые зарегистрированы в качестве пользователей Приложения, путем создания возможности для Заказчика создать заказ на перевозку груза с правом выбора Перевозчика, а для Перевозчиков – по поиску и принятию размещенного заказа на грузоперевозку на условиях, предложенных Заказчиком или на согласованных между сторонами условиях.</p>
              <p>ООО "Прайм-Групп" и Приложение не являются диспетчерской службой и не осуществляют распределение Заказов на перевозку груза между Пользователями Приложения. Пользователи Приложения самостоятельно принимают решение о выборе контрагента для заключения договора перевозки груза.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Термины, используемые в настоящем соглашении</h2>
            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">Приложение "Название приложения"</h3>
                <p className="text-gray-700">программное обеспечение, применяемое физическими и юридическими лицами с использованием технического устройства, функционирующее на базе инфраструктуры взаимодействия Заказчика и Грузоперевозчика</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">Пользователь</h3>
                <p className="text-gray-700">юридическое или физическое лицо, прошедшее регистрацию в Приложении, и имеющее свой личный кабинет в Приложении в качестве Заказчика или Перевозчика</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">Пользователь-Заказчик</h3>
                <p className="text-gray-700">юридическое или физическое лицо (в том числе ИП), прошедшее регистрацию в Приложении в качестве Заказчика с целью создания заказов на перевозку грузов</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">Пользователь-Перевозчик</h3>
                <p className="text-gray-700">юридическое лицо или индивидуальный предприниматель, прошедшее регистрацию в Приложении в качестве Перевозчика с целью поиска и выбора заказов на перевозку груза</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">Регистрационный платеж</h3>
                <p className="text-gray-700">денежные средства, перечисляемые юридическим лицом на расчетный счет ООО "Прайм-Групп" на безвозвратной основе для подтверждения регистрации Пользователя-юридического лица</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">Сервисное вознаграждение от Перевозчика</h3>
                <p className="text-gray-700">денежные средства, списываемые в безакцептном порядке в собственность ООО "Прайм-групп" из баланса Перевозчика в качестве вознаграждения за заключение договора перевозки груза с Пользователем-Заказчиком с использованием Приложения и составляет 3,88 % от стоимости заключенного с Пользователем-Заказчиком договора на перевозку груза</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Регистрация Пользователя в Приложении</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Этап регистрации</th>
                    <th className="border border-gray-300 p-2 text-left">Для физических лиц</th>
                    <th className="border border-gray-300 p-2 text-left">Для юридических лиц</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">1-ый этап: выбор статуса</td>
                    <td className="border border-gray-300 p-2" colSpan={2}>В качестве Заказчика или Перевозчика</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">2-ой этап: заполнение сведений</td>
                    <td className="border border-gray-300 p-2">ФИО, дата и место рождения, паспортные данные, место регистрации и проживания, email, телефон, ИНН, данные ТС</td>
                    <td className="border border-gray-300 p-2">Наименование, ОГРН, ИНН, адреса, данные руководителя, банковские реквизиты</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">3-ий этап: создание логина и пароля</td>
                    <td className="border border-gray-300 p-2" colSpan={2}>Логин из латинских букв от 6 до 20 символов</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">4-ый этап: подтверждение</td>
                    <td className="border border-gray-300 p-2">SMS-подтверждение на телефон</td>
                    <td className="border border-gray-300 p-2">Регистрационный платеж 100 рублей в течение 2 рабочих дней</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">5-ый этап: подтверждение успешной регистрации</td>
                    <td className="border border-gray-300 p-2">Сообщение на email или телефон</td>
                    <td className="border border-gray-300 p-2">Сообщение на email в течение 2 рабочих дней</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-gray-700 text-sm leading-relaxed space-y-2 mt-4">
              <p>Созданный Пользователем индивидуальный логин и пароль для аутентификации в личном кабинете Приложения используются в качестве простой электронной подписи.</p>
              <p>С момента присоединения к Соглашению Пользователь заверяет ООО "Прайм-Групп" о достоверности информации, внесенной в регистрационную форму и обязуется поддерживать указанные сведения в актуальном состоянии.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Порядок пользования Приложением</h2>
            <div className="text-gray-700 text-sm leading-relaxed space-y-4">
              <p>Любые операции, выполненные в Приложении через авторизацию личного кабинета вне зависимости от статуса считаются выполненными Пользователем.</p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Права Пользователя-Перевозчика по балансу:</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Баланс ≥ 1 000 ₽</span><span>заказы до 30 000 ₽</span></div>
                  <div className="flex justify-between"><span>Баланс ≥ 2 000 ₽</span><span>заказы до 80 000 ₽</span></div>
                  <div className="flex justify-between"><span>Баланс ≥ 3 200 ₽</span><span>заказы до 200 000 ₽</span></div>
                  <div className="flex justify-between"><span>Баланс ≥ 20 000 ₽</span><span>заказы до 500 000 ₽</span></div>
                  <div className="flex justify-between"><span>Баланс ≥ 40 000 ₽</span><span>заказы до 1 000 000 ₽</span></div>
                  <div className="flex justify-between"><span>Баланс ≥ 60 000 ₽</span><span>заказы свыше 1 млн ₽</span></div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Создание заказа на перевозку груза включает:</h3>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Наименование, количество, габариты и параметры груза</li>
                  <li>Маршрут перевозки (пункт А и пункт Б)</li>
                  <li>Сроки осуществления перевозки</li>
                  <li>Предлагаемая плата за перевозку</li>
                  <li>Требования к транспортному средству</li>
                  <li>Требования к экипажу</li>
                  <li>Указание на наличие независимой гарантии</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Основания возврата денежных средств</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              ООО "Прайм-Групп" по заявлению Пользователя-Перевозчика должен произвести возврат денежных средств, перечисленных для пополнения баланса Перевозчика в течение 5 банковских дней с момента поступления заявки, за исключением случая, если запрашиваемая сумма списана в качестве сервисного вознаграждения.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Внесение изменений в Пользовательское соглашение</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              ООО "Прайм-Групп" вправе в одностороннем порядке изменять условия настоящего Соглашения путем публикации на главной странице Приложения новой редакции. В случае несогласия Пользователь должен в течение 10 календарных дней прекратить использование Приложения и направить письменное уведомление об отказе.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ответственность сторон</h2>
            <div className="text-gray-700 text-sm space-y-2">
              <p>• Пользователь использует Приложение на условиях «как есть» («as is»), без гарантий любого рода</p>
              <p>• Пользователь самостоятельно несет ответственность за соответствие размещаемой информации требованиям законодательства</p>
              <p>• Пользователь самостоятельно несет ответственность за безопасность средств доступа к учетной записи</p>
              <p>• ООО "Прайм-Групп" не несет ответственность за неисполнение обязательств по Договору перевозки между пользователями</p>
              <p>• ООО "Прайм-Групп" не несет ответственность за прерывание работы Приложения</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Приложения к Пользовательскому соглашению</h2>
            <div className="text-gray-700 text-sm space-y-1">
              <p>Приложение № 1 – Согласие на обработку персональных данных</p>
              <p>Приложение № 2 – Форма договора перевозки груза</p>
              <p>Приложение № 3 – Форма договора независимой гарантии</p>
              <p>Приложение № 4 – Соглашение об использовании простой электронной подписи</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Заключительные условия</h2>
            <div className="text-gray-700 text-sm leading-relaxed space-y-2">
              <p>Настоящее соглашение считается принятым Пользователем с момента регистрации в Приложении.</p>
              <p>Заключая настоящее Соглашение, Пользователь дает согласие на получение сообщений рекламного характера.</p>
              <p>Претензии направляются на электронную почту ООО "Прайм-Групп". Срок рассмотрения претензии составляет 30 календарных дней.</p>
              <p>В случае невозможности урегулирования споров путем переговоров спор рассматривается по месту нахождения ООО "Прайм-Групп".</p>
            </div>
          </section>

        </div>

        <div className="mt-6 space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="mr-3"/>
            <span className="text-sm text-gray-700">Я прочитал(а) и согласен(на) с условиями пользовательского соглашения</span>
          </label>
        </div>
      </div> */}

    </div>
  );
};

export default UserAgreementPage;