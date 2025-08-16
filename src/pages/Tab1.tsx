import { IonButton, IonContent, IonModal, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import './Tab1.css';
import { Cargos }     from '../components/Cargos/';
import { Store }      from '../components/Store';
import { useEffect, useState }   from 'react';
import socketService  from '../components/Sockets';
import { arrowUpCircleOutline } from 'ionicons/icons';
import { Works } from '../components/Works';

const Tab1: React.FC = () => {
  const [ message, setMessage ] = useState("");
  const [ swap, setSwap ] = useState( Store.getState().login.user_type )
  
 
  useEffect(()=>{
    
      Store.subscribe({ num: 501, type: "error", func: () => {
        console.log(Store.getState().error);
        setMessage(Store.getState().error);
      }});

      Store.subscribe({ num: 502, type: "login", func: () => {
        setSwap( Store.getState().login.user_type );
        console.log("swap 502")
        console.log(Store.getState().login.user_type )
      }});
      
      return ()=>{
        Store.unSubscribe( 501 )
        Store.unSubscribe( 502 )
      }

  },[])
  

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

  console.log("swap")
  console.log(swap)
  return (
    <IonPage>
      <IonContent className='bg-2'>
        {
          swap === 2
            ? <Works />
          : swap === 1
            ? <Cargos />
            : <></>

        }
      </IonContent>

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