import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { CargoArchive } from '../components/Cargos';
import { WorkArchive } from '../components/Works/components';
import { useLogin } from '../Store/useLogin';

const Tab4: React.FC = () => {
  const { user_type } = useLogin()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <div className='a-center fs-09'><b>{user_type == 2 ? 'Архив работ' : 'Архив заказов'}</b></div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {user_type == 2 ? <WorkArchive /> : <CargoArchive />}
      </IonContent>
    </IonPage>
  );
};

export default Tab4;