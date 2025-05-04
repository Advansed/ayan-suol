import { IonPage } from '@ionic/react';
import './Tab2.css';
import { Publics } from '../components/Publics';
import { Store } from '../components/Store';

const Tab2: React.FC = () => {
  const swap = Store.getState().swap;

  return (
    <IonPage>
      {
        swap 
          ? <>
            <div>

            </div>
          </>
          : <>
          </>
      }
        
    </IonPage>
  );
};

export default Tab2;
