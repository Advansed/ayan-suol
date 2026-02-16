import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import CargoArchive from '../components/Cargos/components/CargoArchive';
import { WorkArchive } from '../components/Works/components';
import { useUserType } from '../Store/loginStore';

const Tab4: React.FC = () => {
  const { user_type } = useUserType()

  return (
    <IonPage>
      <IonContent fullscreen>
        {user_type == 2 ? <WorkArchive /> : <CargoArchive />}
      </IonContent>
    </IonPage>
  );
};

export default Tab4;