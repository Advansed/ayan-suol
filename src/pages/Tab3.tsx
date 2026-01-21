import { IonPage } from '@ionic/react'
import './Tab3.css'
import { Profile } from '../components/ProfileOld'
import { useParams } from 'react-router-dom';

const Tab3: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  

  return (
    <IonPage className='mt-2'>
      <Profile name = { name }/>
    </IonPage>
  )
}

export default Tab3