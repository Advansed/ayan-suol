import React, { useState } from "react";
import styles from "./style.module.css";

// import styles from "./DropdownWithSubmenus.module.css";


const OfferSection = () => {
  const [price, setPrice] = useState(100000);
  const [comment, setComment] = useState('');

  const feePercentage = 0.05; // 5% комиссия
  const fee = price * feePercentage;
  const totalPrice = price - fee;

  const formatNumber = (num) => {
    return num.toLocaleString('ru-RU');
  };

  return (
    <div className={styles.offerSection}>
      <div className={styles.offerTitle}>Ваше предложение</div>

      <div className={styles.offerPriceWrapper}>
        <div className={styles.offerPriceLabel}>Предлагаемая цена (₽)</div>
        <input
          type="number"
          className={styles.offerPriceInput}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>

      <div className={styles.feeSection}>
        <div className={styles.feeRow}>
          <span>Комиссия сервиса (5%)</span>
          <span>-{formatNumber(fee)} ₽</span>
        </div>
        <div className={styles.totalPrice}>
          <span>Вы получите</span>
          <span>{formatNumber(totalPrice)} ₽</span>
        </div>
      </div>

      <div className={styles.commentSection}>
        <div className={styles.commentTitle}>Комментарий к предложению</div>
        <textarea
          className={styles.commentTextarea}
          placeholder="Опишите детали вашего предложения, особенности транспорта или другую важную информацию"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </div>
  );
};

// export default function DropdownWithSubmenus() {
//   const [openMenu, setOpenMenu] = useState(null);

//   const menuItems = [
//     {
//       title: "Якутск (4)",
//       subItems: ["ГО (4)", "Алдан (1)", "Амга (2)", "Депутатский (1)" ],
//     },
//     {
//       title: "Хабаровский край (100)",
//       subItems: ["Хабаровск (50)", "... (25)", "... (25)"],
//     },
//     // {
//     //   title: "Ягоды",
//     //   subItems: ["Клубника", "Черника"],
//     // },
//   ];

//   const toggleMenu = (index) => {
//     setOpenMenu(openMenu === index ? null : index);
//   };

//   return (
//     <div className={styles.container}>
//       <ul className={styles.list}>
//         {menuItems.map((item, index) => (
//           <li key={index} className={styles.listItem}>
//             <button className={styles.button} onClick={() => toggleMenu(index)}>
//               <span>{item.title}</span>
//               {/* {openMenu === index ? <ChevronDown size={20} /> : <ChevronRight size={20} />} */}
//             </button>
//             {openMenu === index && (
//               <ul className={styles.subList}>
//                 {item.subItems.map((subItem, subIndex) => (
//                   <li key={subIndex} className={styles.subListItem}>
//                     {subItem}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }



export function DriverOrderEdit() {

  // return DropdownWithSubmenus();
  const mockData = {
    orderId: 12460,
    title: "Редактирование заказа #12460",
    mainInfo: {
      orderName: "Перевозка промышленного оборудования",
      cityFrom: "Казань",
      cityTo: "Уфа",
      loadingDate: "01.04.2025, 13:00 - 15:00",
      unloadingDate: "03.04.2025, 13:00 - 15:00",
      price: 120000
    },
    cargoInfo: {
      weight: 15,  // в тоннах
      volume: 45,  // в м³
      description: "Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов."
    },
    // Закомментированные разделы с адресами и контактами могут быть добавлены по аналогии, если нужно
    // addressesAndContacts: {
    //   loadingAddress: "Москва, ул. Промышленная, 15, Завод 'ПромТех'",
    //   unloadingAddress: "Нижний Новгород, ул. Индустриальная, 23, Промышленная зона",
    //   contactPerson: "Иванов Алексей",
    //   phone: "+7 (999) 123-45-67"
    // },
    actions: {
      saveButton: "Сохранить",
      deleteButton: "Удалить заказ"
    }
  };

  // return (
  //     <div className={styles.container}>
  //         {/* <button className={styles.backButton}>←</button> */}
  //         <h1 className={styles.pageTitle}>Редактирование заказа #12460</h1>

  //         <div className={styles.section}>
  //             <h2>Основная информация</h2>
  //             <label>
  //                 Название заказа
  //                 <div className={styles.orderEditInput} > Перевозка промышленного оборудования</div>
  //             </label>
  //             <label>
  //                 Город отправления
  //                 <div className={styles.orderEditInput} > Казань</div>
  //             </label>
  //             <label>
  //                 Город назначения
  //                 <div className={styles.orderEditInput} > Уфа</div>
  //             </label>
  //             <div className={styles.flexRow}>
  //                 <label className={styles.flexItem}>
  //                     Дата загрузки
  //                     <div className={styles.orderEditInput} > 01.04.2025, 13:00 - 15:00</div>
  //                 </label>
  //                 <label className={styles.flexItem}>
  //                     Дата разгрузки
  //                     <div className={styles.orderEditInput} > 03.04.2025, 13:00 - 15:00</div>
  //                 </label>
  //             </div>
  //             <label>
  //                 Цена (₽)
  //                 <div className={styles.orderEditInput} > 120000</div>
  //             </label>
  //         </div>

  //         <div className={styles.section}>
  //             <h2>Информация о грузе</h2>
  //             <label>
  //                 Вес (т)
  //                 <input type="text" value="15" className={styles.orderEditInput} />
  //             </label>
  //             <label>
  //                 Объем (м³)
  //                 <input type="text" value="45" className={styles.orderEditInput} />
  //             </label>
  //             <label>
  //                 Описание груза
  //                 <textarea rows={3} className={styles.orderEditInput} >
  //                     Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.
  //                 </textarea>
  //             </label>
  //         </div>

  //         {/* <div className={styles.section}>
  //             <h2>Адреса и контакты</h2>
  //             <label>
  //                 Адрес погрузки
  //                 <input type="text" value="Москва, ул. Промышленная, 15, Завод 'ПромТех'" className={styles.orderEditInput} />
  //             </label>
  //             <label>
  //                 Адрес разгрузки
  //                 <input
  //                     type="text"
  //                     value="Нижний Новгород, ул. Индустриальная, 23, Промышленная зона"
  //                     className={styles.orderEditInput}
  //                 />
  //             </label>
  //             <label>
  //                 Контактное лицо
  //                 <input type="text" value="Иванов Алексей" className={styles.orderEditInput} />
  //             </label>
  //             <label>
  //                 Телефон
  //                 <input type="text" value="+7 (999) 123-45-67" className={styles.orderEditInput} />
  //             </label>
  //         </div> */}
  //         <OfferSection />
  //         {/* <div className={styles.statusBox}>
  //             <span className={styles.statusBadge}>В ожидании</span>
  //             <span className={styles.orderId}>ID:12460</span>
  //             <p>
  //                 Ваш заказ находится в статусе ожидания. Водители могут видеть ваш заказ и предлагать свои услуги.
  //             </p>
  //         </div> */}

  //         <div className={styles.actions}>
  //             <button className={styles.saveButton}>Сохранить</button>
  //             <button className={styles.deleteButton}>Удалить заказ</button>
  //         </div>
  //     </div>
  // );


  return (<div className={styles.container}>
    <h1 className={styles.pageTitle}>{mockData.title}</h1>

    <div className={styles.section}>
      <h2>Основная информация</h2>
      <label>
        Название заказа
        <div className={styles.orderEditInput}>{mockData.mainInfo.orderName}</div>
      </label>
      <label>
        Город отправления
        <div className={styles.orderEditInput}>{mockData.mainInfo.cityFrom}</div>
      </label>
      <label>
        Город назначения
        <div className={styles.orderEditInput}>{mockData.mainInfo.cityTo}</div>
      </label>
      <div className={styles.flexRow}>
        <label className={styles.flexItem}>
          Дата загрузки
          <div className={styles.orderEditInput}>{mockData.mainInfo.loadingDate}</div>
        </label>
        <label className={styles.flexItem}>
          Дата разгрузки
          <div className={styles.orderEditInput}>{mockData.mainInfo.unloadingDate}</div>
        </label>
      </div>
      <label>
        Цена (₽)
        <div className={styles.orderEditInput}>{mockData.mainInfo.price}</div>
      </label>
    </div>


    <div className={styles.section}>
      <h2>Информация о грузе</h2>
      <label>
        Вес (т)
        <input type="text" value={mockData.cargoInfo.weight} className={styles.orderEditInput} />
      </label>
      <label>
        Объем (м³)
        <input type="text" value={mockData.cargoInfo.volume} className={styles.orderEditInput} />
      </label>
      <label>
        Описание груза
        <textarea rows={3} className={styles.orderEditInput}>
          {mockData.cargoInfo.description}
        </textarea>
      </label>
    </div>
    <OfferSection />
    <div className={styles.actions}>
      <button className={styles.saveButton}>{mockData.actions.saveButton}</button>
      <button className={styles.deleteButton}>{mockData.actions.deleteButton}</button>
    </div>
  </div>
  );
};
