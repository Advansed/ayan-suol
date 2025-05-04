import { IonPage } from '@ionic/react';
import './Tab2.css';
// import { Publics } from '../components/Publics';
import {PublicsLayout} from '../components/Driver/AvailableOrders';
import {ShipmentForm} from '../components/ShipmentForm-Layout';
import { Store } from '../components/Store';
import {OrderEdit} from '../components/OrderEdit';
import {OrderHistory} from '../components/OrderHistory';
import { MyOrders } from '../components/Driver/MyOrders';
import { DriverOrder } from '../components/Driver/DriverOrder';
import { DriverOrderHistory } from '../components/Driver/DriverOrderHistory';
import DriverChat from '../components/Driver/DriverChat';
import { PublicsLayoutCustomer } from '../components/Customer/AvailableOrders';
import {DriverOrderEdit} from '../components/Driver/DriverOrderEdit';

const Tab2: React.FC = () => {
  const swap = Store.getState().swap;

  return (
    <IonPage>
      {
        swap
          ? <></>
          :
          <div style={{height: '100vh', overflowY:'scroll'}}>            
          {/* // Tab2 */}
          <DriverChat />
          {/* // <PublicsLayoutCustomer /> //Заказчик Доступные заказы */}
        
          {/* // <OrderEdit /> // Заказчик редактирование заказа  */}
        
          {/* // <OrderHistory /> //Заказчик история заказов */}
        
          {/* // <ShipmentForm /> // Заказчик Создание и редакция заказа */}
        
        {/* // <PublicsLayout /> //Водитель Доступные заказы */}
        
        {/* // <MyOrders /> //Водитель Мои заказы */}
        
        {/* // <DriverOrder />//Водитель принятый заказ */}
        
        {/* // <DriverOrderHistory />//Водитель история заказов */}
        
        {/* <DriverOrderEdit />   */}
        {/* //Водитель редактирвоания заказа */}
        
        {/* // <DriverChat /> // Чат с заказчиком */}
        </div>
        }

    </IonPage>
  );
};

export default Tab2;
