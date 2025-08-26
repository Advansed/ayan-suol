import { IonContent, IonPage } from '@ionic/react';
import './Tab2.css';
import { useParams } from 'react-router';
import { Chats } from '../components/Chats';
import { ChatList } from '../components/ChatList';

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
