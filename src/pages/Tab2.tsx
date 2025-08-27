import { IonContent, IonPage } from '@ionic/react';
import './Tab2.css';
import { useParams } from 'react-router';
import { ChatList } from '../components/Chats/ChatList';
import Chats from '../components/Chats/Chats';



const Tab2: React.FC = () => {

  const { name } = useParams<{ name: string; }>();
  

  return (
    <IonPage>
      <IonContent>

        {

          name === undefined

            ? <ChatList />

            : <Chats name = { name } />

        }
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
