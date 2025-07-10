import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import './Tab2.css';
import { Store } from '../components/Store';
import { useParams } from 'react-router';
import { Chats } from '../components/Chats';
import { ChatList } from '../components/ChatList';
import socketService from '../components/Sockets';
import { arrowUpCircleOutline} from 'ionicons/icons';

const Tab2: React.FC = () => {
  const swap = Store.getState().swap;

  const { name } = useParams<{ name: string; }>();
  
  // Функция обновления данных
  const handleRefresh = async (event: CustomEvent) => {
    try {
      console.log('🔄 Начинаем обновление данных...');
      
      const token = Store.getState().login?.token;
      
      if (!token) {
        console.error('❌ Токен не найден');
        event.detail.complete();
        return;
      }

      // Обновляем данные в зависимости от типа пользователя
      if (name === undefined) {
        console.log('🚛 Обновляем список чатов...');
        socketService.emit("get_chats", { token: token });
        console.log('emit... get_chats');
      } else {
        console.log('💬 Обновляем чат...');
        // Можно добавить специфичную логику для обновления чата
        const arr = name.split(":");
        socketService.emit("get_chat", {
          token: token,
          recipient: arr[0],
          cargo: arr[1]
        });
        console.log('emit... get_chat');
      }

      // Завершаем рефрешер через небольшую задержку для лучшего UX
      setTimeout(() => {
        console.log('✅ Обновление данных завершено');
        event.detail.complete();
      }, 1000);

    } catch (error) {
      console.error('❌ Ошибка при обновлении данных:', error);
      event.detail.complete();
    }
  };

  return (
    <IonPage>
      <IonContent>
        {/* Компонент рефрешера */}
        
        <IonRefresher
          className='bg-2'
          slot="fixed" 
          onIonRefresh={handleRefresh}
          pullFactor={0.5}
          pullMin={100}
          pullMax={200}
        >
          <IonRefresherContent
            className='bg-2'
            pullingIcon= { arrowUpCircleOutline}
            pullingText={swap ? "Потяните для обновления работ..." : "Потяните для обновления заказов..."}
            refreshingSpinner="circular"
            refreshingText="Обновление..."
          />
        </IonRefresher>

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
