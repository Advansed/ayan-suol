import { IonPage } from '@ionic/react';
import './Tab2.css';
// import { Publics } from '../components/Publics';
import {PublicsLayout} from '../components/Driver/AvailableOrders';
import {ShipmentForm} from '../components/ShipmentForm-Layout';
import { Store } from '../components/Store';
import {OrderEdit} from '../components/OrderEdit';
import {OrderHistory} from '../components/OrderHistory';
import { MyOrder } from '../components/Driver/MyOrders';

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

        // <PublicsLayout /> //Водитель Доступные заказы
        <MyOrder /> //Водитель Мои заказы
        }

    </IonPage>
  );
};

export default Tab2;
