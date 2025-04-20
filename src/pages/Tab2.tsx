import { IonPage } from '@ionic/react';
import './Tab2.css';
// import { Publics } from '../components/Publics';
import {PublicsLayout} from '../components/Publics-Layout';
import {ShipmentForm} from '../components/ShipmentForm-Layout';
import { Store } from '../components/Store';
import {OrderEdit} from '../components/OrderEdit';
import {OrderHistory} from '../components/OrderHistory';

const Tab2: React.FC = () => {
  const swap = Store.getState().swap;

  return (
    <IonPage>
      {
        swap
          ? <></>
          :
          // <OrderEdit /> // Заказчик редактирование заказа
          // <OrderHistory /> //Заказчик история заказов
          // <ShipmentForm /> // Заказчик Создание и редакция заказа

        <PublicsLayout /> //Водитель Доступные заказы
        }

    </IonPage>
  );
};

export default Tab2;
