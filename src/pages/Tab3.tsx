import { IonPage } from '@ionic/react'
import './Tab3.css'
import { Profile } from '../components/Profile'

const Tab3: React.FC = () => {
  return (
    <IonPage className='mt-2'>
      <Profile />
    </IonPage>
  )
}

export default Tab3