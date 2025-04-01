import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab3.css';
import { Profile } from '../components/profile';

const Tab3: React.FC = () => {
  return (
    <IonPage>
      <Profile />
    </IonPage>
  );
};

export default Tab3;
