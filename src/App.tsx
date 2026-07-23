import { Redirect, Route, Switch, useParams } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/design-tokens.css';
import './app.css';
import './theme/variables.css';
import './theme/web-layout.css';

import { ToastProvider } from './components/Toast/ToastManager';
import { useLogin } from './Store/useLogin';
import { ServerConnectionGuard } from './components/ServerConnectionGuard';
import { Login } from './components/Login';
import { useSocketManager } from './services/useSocketManager';
import { useApp } from './Store/useApp';
import { useEffect } from 'react';
import { getVersion } from './Store/api';
import { AppShell } from './layout';
import { HomePage } from './pages/Home/HomePage';
import { StubPage } from './pages/Stub/StubPage';
import {
  ArchivePage,
  ChatsPage,
  FeedPage,
  FinancePage,
  OrdersPage,
  ProfileRoutePage,
  SettingsRoutePage,
  VehiclesPage,
} from './pages/RoutePages';
import { useLoginStore } from './Store/loginStore';

setupIonicReact({
  mode: 'ios',
  statusTap: true,
});

const LegacyTab1Redirect: React.FC = () => {
  const userType = useLoginStore((s) => s.user_type);
  return <Redirect to={userType === 2 ? '/feed' : '/orders'} />;
};

const LegacyChatRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Redirect to={`/chats/${id}`} />;
};

const AppContent: React.FC = () => {
  const { auth } = useLogin();

  useSocketManager();
  useApp();

  useEffect(() => {
    getVersion().then((res) => console.log(res));
  }, []);

  return (
    <ServerConnectionGuard>
      {auth ? (
        <IonReactRouter>
          <AppShell>
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/feed" component={FeedPage} />
              <Route exact path="/applications">
                <Redirect to="/orders" />
              </Route>
              <Route exact path="/orders" component={OrdersPage} />
              <Route exact path="/archive" component={ArchivePage} />
              <Route exact path="/finance" component={FinancePage} />
              <Route exact path="/chats" component={ChatsPage} />
              <Route exact path="/chats/:id" component={ChatsPage} />
              <Route exact path="/vehicles" component={VehiclesPage} />
              <Route exact path="/settings" component={SettingsRoutePage} />
              <Route exact path="/profile" component={ProfileRoutePage} />
              <Route exact path="/cabinet">
                <Redirect to="/profile" />
              </Route>

              <Route exact path="/support">
                <StubPage title="Поддержка" description="Служба поддержки скоро будет доступна. Напишите нам на info@gruzreis.ru." />
              </Route>
              <Route exact path="/documents">
                <StubPage title="Документы" description="Раздел документов и договоров в разработке." />
              </Route>
              <Route exact path="/verification">
                <StubPage title="Верификация" description="Пройдите верификацию паспорта и документов — раздел скоро откроется." />
              </Route>
              <Route exact path="/partners">
                <StubPage title="Партнёрам" description="Партнёрская программа в разработке." />
              </Route>

              {/* Legacy tabs */}
              <Route exact path="/tab1" component={LegacyTab1Redirect} />
              <Route exact path="/tab2">
                <Redirect to="/chats" />
              </Route>
              <Route exact path="/tab2/:id" component={LegacyChatRedirect} />
              <Route exact path="/tab3">
                <Redirect to="/settings" />
              </Route>
              <Route exact path="/tab3/:name">
                <Redirect to="/settings" />
              </Route>
              <Route exact path="/tab4">
                <Redirect to="/archive" />
              </Route>

              <Route>
                <Redirect to="/" />
              </Route>
            </Switch>
          </AppShell>
        </IonReactRouter>
      ) : (
        <Login />
      )}
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
