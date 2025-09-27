import { IonContent, IonPage } from '@ionic/react';
import './Tab2.css';
import { useParams } from 'react-router';
import Chats from '../components/Chats/Chats';
import { ChatsList } from '../components/Chats/ChatsList';



const Tab2: React.FC = () => {

  const { name } = useParams<{ name: string; }>();
  

  return (
    <IonPage className='mt-2'>
      <IonContent>

        {

          name === undefined

            ? <ChatsList />

            : <Chats name = { name } />

        }
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
