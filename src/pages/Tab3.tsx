import { IonContent, IonPage } from '@ionic/react'
import './Tab3.css'
import { Settings } from '../components/Settings'
import { useParams } from 'react-router-dom';

const Tab3: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  

  return (
    <IonPage>
      <IonContent>
        <Settings />
      </IonContent>
    </IonPage>
  )
}

export default Tab3