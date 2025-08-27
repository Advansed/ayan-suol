import { Redirect, Route, useHistory } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonCard,
  IonButton,
  IonSpinner,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { archiveOutline, bicycleOutline, chatboxEllipses, chatboxEllipsesOutline, contractOutline, ellipse, giftOutline, personOutline, square, triangle, walkOutline } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './app.css';

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { useState, useEffect } from 'react';
import { setupSocketHandlers, Store } from './components/Store';
import socketService from './components/Sockets';

import { StatusBar, Style } from '@capacitor/status-bar';
import { isPlatform } from '@ionic/react';
import { Login } from './components/Login';
import Tab4 from './pages/Tab4';
import { ToastContext, ToastProvider } from './components/Toast/ToastManager';

setupIonicReact({
  mode: 'ios', // или 'md' для Material Design
  statusTap: true, // Позволяет скроллить наверх при тапе на статус бар
});

const setupStatusBar = async () => {
  if (isPlatform('capacitor')) {
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#086CA2' }); // Ваш основной цвет
      await StatusBar.setOverlaysWebView({ overlay: false }); // Важно! Не перекрывать контент
    } catch (error) {
      console.log('StatusBar API not available');
    }
  }
};

// Компонент ожидания подключения к сокету
const SocketConnectionWaiter: React.FC<{ onConnected: () => void; onDisconnected: () => void }> = ({ onConnected, onDisconnected }) => {
    const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 5;
        
        const connectToSocket = async () => {
            try {
                setConnectionStatus('connecting');
                setError('');
                
                // Попытка подключения к сокету
                await socketService.connect(''); // Пустой токен для первичного подключения
                
                const socket = socketService.getSocket();
                if (!socket) {
                    throw new Error('Socket не инициализирован');
                }

                setupSocketHandlers()
                
                // Слушаем событие подключения
                socket.on('connect', () => {
                    console.log('Socket подключен успешно');
                    setConnectionStatus('connected');
                    retryCount = 0; // Сбрасываем счетчик при успешном подключении
                    onConnected();
                });

                // Слушаем ошибки подключения
                socket.on('connect_error', (error) => {
                    console.error('Ошибка подключения к Socket:', error);
                    setConnectionStatus('error');
                    setError('Ошибка подключения к серверу');
                    
                    // Повторная попытка подключения
                    if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(() => {
                            console.log(`Повторная попытка подключения ${retryCount}/${maxRetries}`);
                            connectToSocket();
                        }, 2000 * retryCount); // Увеличиваем задержку с каждой попыткой
                    }
                });

                socket.on('disconnect', (reason) => {
                    console.log('Socket отключен:', reason);
                    setConnectionStatus('disconnected');
                    
                    // Уведомляем родительский компонент о разрыве соединения
                    onDisconnected();
                    
                    // Автоматически пытаемся переподключиться при неожиданном разрыве
                    if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
                        setTimeout(() => {
                            console.log('Попытка автоматического переподключения...');
                            connectToSocket();
                        }, 2000);
                    }
                });

                // Проверяем, подключен ли уже сокет
                if (socket.connected) {
                    setConnectionStatus('connected');
                    onConnected();
                }

            } catch (error) {
                console.error('Ошибка при подключении к сокету:', error);
                setConnectionStatus('error');
                setError('Не удалось подключиться к серверу');
                
                // Повторная попытка
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(() => {
                        connectToSocket();
                    }, 2000 * retryCount);
                }
            }
        };

        connectToSocket();

        // Cleanup
        return () => {
            const socket = socketService.getSocket();
            if (socket) {
                socket.off('connect');
                socket.off('connect_error');
                socket.off('disconnect');
            }
        };
    }, [onConnected, onDisconnected]);

    const handleRetry = () => {
        setConnectionStatus('connecting');
        setError('');
        window.location.reload(); // Простой способ перезапустить процесс подключения
    };

    if (connectionStatus === 'connecting') {
        return (
            <div className='container'>
                <IonCard className="login-container">
                    <div className='a-center'>
                        <IonSpinner name="crescent" />
                        <h3 className='mt-1'>Подключение к серверу...</h3>
                        <p className='fs-09 cl-gray'>Пожалуйста, подождите</p>
                    </div>
                </IonCard>
            </div>
        );
    }


    if (connectionStatus === 'disconnected') {
        return (
            <div className='container'>
                <IonCard className="login-container">
                    <div className='a-center'>
                        <h3 className='cl-yellow'>Соединение потеряно</h3>
                        <p className='fs-09 cl-gray mt-1'>Попытка переподключения...</p>
                        <IonSpinner name="crescent" />
                        <IonButton 
                            className='mt-2' 
                            onClick={handleRetry}
                            color="primary"
                        >
                            Переподключиться
                        </IonButton>
                    </div>
                </IonCard>
            </div>
        );
    }
       

    if (connectionStatus === 'error') {
        return (
          <div className='container'>
              <IonCard className="login-container">
                  <div className='a-center'>
                      <h3 className='cl-red'>Ошибка подключения</h3>
                      <p className='fs-09 cl-gray mt-1'>{error}</p>
                      <IonButton 
                          className='mt-2' 
                          onClick={handleRetry}
                          color="primary"
                      >
                          Повторить попытку
                      </IonButton>
                  </div>
              </IonCard>
          </div>
      );
  }

    return null;

};

const App: React.FC = () => {
  const [auth, setAuth] = useState(false);
  const [swap, setSwap] = useState(false);
  const [alert, setAlert] = useState<any>();
  const [socketConnected, setSocketConnected] = useState(false);


  // Проверяем, подключен ли уже сокет при загрузке компонента
  useEffect(() => {

    console.log("useeffect app" )

    Store.subscribe({num: 9, type: "socketConnected", func: ()=>{
      console.log("subScribe 9 " + Store.getState().socketConnected )
      setSocketConnected( Store.getState().socketConnected )
    }})

    Store.subscribe({ num: 101, type: "auth", func: () => {
      console.log( "auth:" + auth )
      setAuth(Store.getState().auth);
    }});

    Store.subscribe({ num: 102, type: "swap", func: () => {
      setSwap(Store.getState().swap);
    }});

    Store.subscribe({ num: 103, type: "message", func: () => {
      setAlert(Store.getState().message);
    }});

   setupStatusBar();
  
  // Также можно добавить класс для определения типа устройства
  const addDeviceClasses = () => {
    const root = document.documentElement;
    
    if (isPlatform('ios')) {
      root.classList.add('platform-ios');
      
      // Определяем устройства с вырезом
      if (window.screen.height >= 812 && window.devicePixelRatio >= 2) {
        root.classList.add('device-notch');
      }
    }
    
    if (isPlatform('android')) {
      root.classList.add('platform-android');
    }
    
    if (isPlatform('pwa')) {
      root.classList.add('platform-pwa');
    }
  };
  
  addDeviceClasses();

    return ()=>{
        Store.unSubscribe( 9 )
        Store.unSubscribe( 101 )
        Store.unSubscribe( 102 )
        Store.unSubscribe( 103 )
    }

  }, []);




  // Функция для обработки разрыва соединения
  const handleSocketDisconnect = () => {
    console.log('Обработка разрыва соединения сокета');
    
    // Выход из системы при разрыве соединения
    setAuth(false);
    setSocketConnected(false);
    
    // Очищаем localStorage (опционально, в зависимости от требований)
    // localStorage.removeItem("serv-tm1.token");
    
    // Обновляем Store
    Store.dispatch({ type: "auth", data: false });
    Store.dispatch({ type: "socketConnected", data: false });
    Store.dispatch({ type: "socketAuthenticated", data: false });

  };



  function App1() {
    return (
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>

            <Route exact path="/tab1">
              <Tab1 />
            </Route>

            <Route exact path="/tab2">
              <Tab2 />
            </Route>

            <Route exact path="/tab2/:name">
              <Tab2 />
            </Route>

            <Route path="/tab3">
              <Tab3 />
            </Route>

            <Route path="/tab4">
              <Tab4 />
            </Route>

            <Route exact path="/">
              <Redirect to="/tab1" />
            </Route>

          </IonRouterOutlet>
          <IonTabBar slot="bottom">

            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon aria-hidden="true" icon={ contractOutline } />
              <IonLabel>{swap ? "Работы" : "Заказы"}</IonLabel>
            </IonTabButton>

            <IonTabButton tab="tab4" href="/tab4">
              <IonIcon aria-hidden="true" icon={ archiveOutline } />
              <IonLabel>Архив</IonLabel>
            </IonTabButton>

            <IonTabButton tab="tab2" href="/tab2"
              onClick={()=>{
                console.log("/tab2")
              }}
            >
              <IonIcon aria-hidden="true" icon={ chatboxEllipsesOutline } />
              <IonLabel>{swap ? "Чат" : "Чат"}</IonLabel>
            </IonTabButton>

            <IonTabButton tab="tab3" href="/tab3">
              <IonIcon aria-hidden="true" icon={personOutline} />
              <IonLabel>Профиль</IonLabel>
            </IonTabButton>

          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    );
  }

  // Показываем компонент ожидания подключения, если сокет не подключен
  if (!socketConnected) {
    return (
      <IonApp>
        <SocketConnectionWaiter 
          onConnected={() => setSocketConnected(true)}
          onDisconnected={handleSocketDisconnect}
        />
      </IonApp>
    );
  }

  return (
    <ToastProvider>
      <IonApp>
        {auth ? <App1 /> : <Login />}
      </IonApp>
    </ToastProvider>
  );
};

export default App;