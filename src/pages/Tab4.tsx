import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { CargoArchive } from '../components/Cargos';
import { WorkArchive } from '../components/Works/components';
import { useStoreField } from '../components/Store';
import { useProfile } from '../components/Profile/hooks/useProfile';

const Tab4: React.FC = () => {
  const { userType } = useProfile()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <div className='a-center fs-09'><b>{userType == 2 ? 'Архив работ' : 'Архив заказов'}</b></div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {userType == 2 ? <WorkArchive /> : <CargoArchive />}
      </IonContent>
    </IonPage>
  );
};

export default Tab4;