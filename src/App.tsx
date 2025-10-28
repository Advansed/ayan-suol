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
import Tab4 from './pages/Tab4';
import { ToastProvider } from './components/Toast/ToastManager';
import { useLogin } from './Store/useLogin';
import { ServerConnectionGuard } from './components/ServerConnectionGuard';
import { Login } from './components/Login';
import { useSocketManager } from './services/useSocketManager';
import { useEffect } from 'react';
import { getVersion } from './Store/api';

setupIonicReact({
  mode: 'ios', // или 'md' для Material Design
  statusTap: true, // Позволяет скроллить наверх при тапе на статус бар
});


const AppContent: React.FC = () => {
  const { auth, user } = useLogin();

  useSocketManager()

  const get_Version = async () => {
    const res = await getVersion()
    console.log(res)
  }

  useEffect(()=>{
    console.log("useeffect")
     get_Version()
  },[])

  return (
    <ServerConnectionGuard>
      {auth ? (
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>

              <Route exact path="/tab1"> <Tab1 /> </Route>

              <Route exact path="/tab2"> <Tab2 /> </Route>

              <Route exact path="/tab2/:name"> <Tab2 /> </Route>

              <Route path="/tab3"> <Tab3 /> </Route>

              <Route path="/tab3/:name"> <Tab3 /> </Route>

              <Route path="/tab4"> <Tab4 /> </Route>

              <Route exact path="/"> <Redirect to="/tab1" /> </Route>

            </IonRouterOutlet>
            <IonTabBar slot="bottom">

              <IonTabButton tab="tab1" href="/tab1">
                <IonIcon aria-hidden="true" icon={ contractOutline } />
                <IonLabel>{user.user_type === 2 ? "Работы" : "Заказы"}</IonLabel>
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
                <IonLabel>{user.user_type === 2 ? "Чат" : "Чат"}</IonLabel>
              </IonTabButton>

              <IonTabButton tab="tab3" href="/tab3">
                <IonIcon aria-hidden="true" icon={personOutline} />
                <IonLabel>Профиль</IonLabel>
              </IonTabButton>

            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      ) : (
        <Login />
      )}
      {/* <ConnectionStatus /> */}
    </ServerConnectionGuard>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </IonApp>
  );
};

export default App;