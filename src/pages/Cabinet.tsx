import { IonContent, IonPage } from '@ionic/react';
import { Cabinet } from '../components/Settings';

const CabinetPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <Cabinet />
      </IonContent>
    </IonPage>
  );
};

export default CabinetPage;
