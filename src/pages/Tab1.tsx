import { IonButton, IonContent, IonModal, IonPage } from '@ionic/react';
import './Tab1.css';
import { Cargos }     from '../components/Cargos/';
import { useState }   from 'react';
import { Works } from '../components/Works';
import { useLogin } from '../Store/useLogin';

const Tab1: React.FC = () => {
  const { user_type } = useLogin()
  
  
  return (
    <IonPage>

      <IonContent className='bg-2'>
        {
          user_type === 2
            ? <Works />
          : user_type === 1
            ? <Cargos />
            : <></>

        }
      </IonContent>

    </IonPage>
  );
};

export default Tab1;