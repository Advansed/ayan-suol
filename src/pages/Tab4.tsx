import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { CargoArchive } from '../components/Cargos';
import { WorkArchive } from '../components/Works/components';
import { useStoreField } from '../components/Store';

const Tab4: React.FC = () => {
  const swap = useStoreField('swap', 503);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{swap ? 'Архив работ' : 'Архив заказов'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {swap ? <WorkArchive /> : <CargoArchive />}
      </IonContent>
    </IonPage>
  );
};

export default Tab4;