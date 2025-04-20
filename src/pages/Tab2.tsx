import { IonPage } from '@ionic/react';
import './Tab2.css';
// import { Publics } from '../components/Publics';
import PublicsLayout from '../components/Publics-Layout';
import ShipmentForm from '../components/ShipmentForm-Layout';
import { Store } from '../components/Store';
import OrderEdit from '../components/OrderEdit';
import OrderHistory from '../components/OrderHistory';

const Tab2: React.FC = () => {
  const swap = Store.getState().swap;

  return (
    <IonPage>
      {
        swap
          ? <></>
          :
          // <OrderEdit />
          <OrderHistory />
          // <PublicsLayout />
        // <ShipmentForm />
      }

    </IonPage>
  );
};

export default Tab2;
