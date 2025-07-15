import { IonButton, IonContent, IonModal, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import './Tab1.css';
import { Cargos }     from '../components/Cargos/';
import { Store }      from '../components/Store';
import { useState }   from 'react';
import socketService  from '../components/Sockets';
import { arrowUpCircleOutline } from 'ionicons/icons';
import { Works } from '../components/Works';

const Tab1: React.FC = () => {
  const [ message, setMessage ] = useState("");
  const [ swap, setSwap ] = useState( Store.getState().swap )
  
  Store.subscribe({ num: 501, type: "error", func: () => {
    console.log(Store.getState().error);
    setMessage(Store.getState().error);
  }});

  Store.subscribe({ num: 502, type: "swap", func: () => {
    setSwap( Store.getState().swap );
    console.log("swap 502")
    console.log(Store.getState().swap)
  }});
   
  

  // Функция обновления данных
  const handleRefresh = async (event: CustomEvent) => {
    try {
        console.log('🔄 Начинаем обновление данных...');
      
      const token = Store.getState().login?.token;
      
      if (!token) {
        console.error('❌ Токен не найден');
        event.detail.complete();
        return;
      }

      // Обновляем данные в зависимости от типа пользователя
      if (swap) {
        // Для водителей обновляем работы и транспорт
        console.log('🚛 Обновляем данные водителя...');
        socketService.emit("get_works", { token: token });
        console.log('emit... get_works');
        socketService.emit("get_transport", { token: token });
        console.log('emit... get_transport');
      } else {
        // Для заказчиков обновляем грузы
        console.log('📦 Обновляем данные заказчика...');
        socketService.emit("get_cargos", { token });
        console.log('📦 emit... get_cargos');
      }

      // Также обновляем организации для всех пользователей
      socketService.emit("get_orgs", { token });

      // Завершаем рефрешер через небольшую задержку для лучшего UX
      setTimeout(() => {
        console.log('✅ Обновление данных завершено');
        event.detail.complete();
      }, 1000);

    } catch (error) {
      console.error('❌ Ошибка при обновлении данных:', error);
      event.detail.complete();
    }
  };

  return (
    <IonPage>
      <IonContent className='bg-2'>
        {/* Компонент рефрешера */}
        {/* <IonRefresher 
          className='bg-2'
          slot="fixed" 
          onIonRefresh={handleRefresh}
          pullFactor={0.5}
          pullMin={100}
          pullMax={200}
        >
          <IonRefresherContent
            className='bg-2'
            pullingIcon={ arrowUpCircleOutline }
            pullingText={swap ? "Потяните для обновления работ..." : "Потяните для обновления заказов..."}
            refreshingSpinner="circular"
            refreshingText="Обновление..."
          />
        </IonRefresher> */}

        {/* Основной контент */}
        {
          swap
            ? <Works />
            : <Cargos />
        }
      </IonContent>

      {/* Модальное окно для ошибок */}
      <IonModal
        isOpen={message !== ""}
        onDidDismiss={() => setMessage("")}
        className="error-modal"
      >
        <div className="error-modal-container">
          <div className="error-modal-content">
            <div className="error-modal-title">Ошибка</div>
            <div className="error-modal-message">{message}</div>
            <IonButton
              className="error-modal-button"
              expand="block"
              onClick={() => setMessage("")}
            >
              Закрыть
            </IonButton>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default Tab1;