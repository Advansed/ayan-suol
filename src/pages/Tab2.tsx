import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import './Tab2.css';
import { Store, useStoreField } from '../components/Store';
import { useParams } from 'react-router';
import { Chats } from '../components/Chats';
import { ChatList } from '../components/ChatList';
import socketService from '../components/Sockets';
import { arrowUpCircleOutline} from 'ionicons/icons';

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
