import { IonPage } from '@ionic/react';
import './Tab1.css';
import { Cargos } from '../components/Cargos';
import { Store } from '../components/Store';

const Tab1: React.FC = () => {
  const swap = Store.getState().swap;

  return (
    <IonPage>
      {
        swap
          ? <></>
          : <Cargos />
      }
      
    </IonPage>
  );
};

export default Tab1;
