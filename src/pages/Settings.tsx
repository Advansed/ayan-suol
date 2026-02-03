import { IonContent, IonPage } from '@ionic/react';
import { Settings } from '../components/Settings';

const SettingsPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <Settings />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
