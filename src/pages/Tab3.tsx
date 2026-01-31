import { IonContent, IonPage } from '@ionic/react'
import './Tab3.css'
import { Profile } from '../components/Profile'
import { useParams } from 'react-router-dom';

const Tab3: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  

  return (
    <IonPage>
      <IonContent>
        <Profile />
      </IonContent>
    </IonPage>
  )
}

export default Tab3