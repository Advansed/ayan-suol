// src/App.jsx - Main routing component
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

// Import pages
import AuthPage from './pages/AuthPage';
import AvailableOrdersPage from './pages/AvailableOrdersPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import RecoverPasswordPage from './pages/RecoverPasswordPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

// Core CSS required for Ionic components
import '@ionic/react/css/core.css';

// Basic CSS for apps built with Ionic
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// Optional CSS imports
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

// Theme and custom CSS
import './theme/variables.css';
import './theme/custom.css';

setupIonicReact();

const App = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/auth" component={AuthPage} />
          <Route exact path="/register" component={RegisterPage} />
          <Route exact path="/recover-password" component={RecoverPasswordPage} />
          <Route exact path="/available-orders" component={AvailableOrdersPage} />
          <Route exact path="/my-orders" component={MyOrdersPage} />
          <Route exact path="/order-history" component={OrderHistoryPage} />
          <Route exact path="/profile" component={ProfilePage} />
          <Route exact path="/order/:id" component={OrderDetailsPage} />
          <Route exact path="/">
            <Redirect to="/auth" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

// src/theme/custom.css - Custom styles
:root {
  --ion-color-primary: #4285f4;
  --ion-color-primary-rgb: 66, 133, 244;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #3a75d7;
  --ion-color-primary-tint: #5591f5;

  --ion-color-secondary: #3dc2ff;
  --ion-color-secondary-rgb: 61, 194, 255;
  --ion-color-secondary-contrast: #ffffff;
  --ion-color-secondary-contrast-rgb: 255, 255, 255;
  --ion-color-secondary-shade: #36abe0;
  --ion-color-secondary-tint: #50c8ff;

  --ion-color-success: #4caf50;
  --ion-color-success-rgb: 76, 175, 80;
  --ion-color-success-contrast: #ffffff;
  --ion-color-success-contrast-rgb: 255, 255, 255;
  --ion-color-success-shade: #439a46;
  --ion-color-success-tint: #5eb762;

  --ion-color-warning: #ffc107;
  --ion-color-warning-rgb: 255, 193, 7;
  --ion-color-warning-contrast: #000000;
  --ion-color-warning-contrast-rgb: 0, 0, 0;
  --ion-color-warning-shade: #e0a800;
  --ion-color-warning-tint: #ffca2c;
}

.auth-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--ion-color-primary);
  padding: 20px;
}

.auth-title {
  color: white;
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 30px;
}

.auth-input {
  --background: #ffffff;
  --color: #333333;
  --border-radius: 8px;
  --padding-start: 15px;
  margin-bottom: 15px;
}

.auth-button {
  --background: var(--ion-color-warning);
  --color: #000000;
  --border-radius: 8px;
  margin-top: 20px;
  height: 50px;
  font-weight: bold;
  font-size: 16px;
}

.auth-links {
  margin-top: 20px;
  text-align: center;
}

.auth-link {
  color: white;
  text-decoration: none;
  font-size: 14px;
  display: block;
  margin-top: 15px;
}

.order-card {
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.order-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  margin-right: 8px;
}

.badge-new {
  background-color: var(--ion-color-success);
  color: white;
}

.badge-in-progress {
  background-color: var(--ion-color-primary);
  color: white;
}

.badge-completed {
  background-color: #9e9e9e;
  color: white;
}

.badge-negotiation {
  background-color: #673ab7;
  color: white;
}

.order-price {
  font-weight: bold;
  color: #000;
  float: right;
  font-size: 16px;
}

.order-id {
  color: #666;
  font-size: 14px;
}

.order-title {
  font-size: 16px;
  font-weight: bold;
  margin-top: 5px;
  color: #333;
}

.order-route {
  display: flex;
  margin-bottom: 10px;
}

.route-point {
  flex: 1;
}

.route-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 2px;
}

.route-value {
  font-weight: bold;
  color: #333;
}

.route-date {
  text-align: right;
}

.date-value {
  color: #333;
}

.date-time {
  font-size: 12px;
  color: #666;
}

.cargo-details {
  background-color: #e3f2fd;
  padding: 10px;
  border-radius: 4px;
}

.details-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.cargo-metrics {
  display: flex;
  margin-bottom: 5px;
}

.cargo-metric {
  flex: 1;
}

.metric-label {
  color: #666;
  font-size: 14px;
}

.metric-value {
  font-weight: bold;
  color: #333;
}

.cargo-description {
  font-size: 14px;
  color: #555;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.tab-bar {
  border-top: 1px solid #eee;
}

// src/pages/AuthPage.jsx - Login page
import React, { useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonInput, 
  IonButton, 
  IonItem, 
  IonLabel,
  useIonRouter
} from '@ionic/react';

const AuthPage = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const router = useIonRouter();

  const handleLogin = () => {
    // Implement login logic here
    router.push('/available-orders');
  };

  const goToRegister = () => {
    router.push('/register');
  };

  const goToRecoverPassword = () => {
    router.push('/recover-password');
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="auth-container">
          <h1 className="auth-title">Авторизация</h1>
          
          <IonItem className="auth-input">
            <IonLabel position="stacked">Номер</IonLabel>
            <IonInput
              type="tel"
              placeholder="+7 (XXX) XXX - XXXX"
              value={phone}
              onIonChange={e => setPhone(e.detail.value)}
            />
          </IonItem>
          
          <IonItem className="auth-input">
            <IonLabel position="stacked">Пароль</IonLabel>
            <IonInput
              type="password"
              placeholder="****************"
              value={password}
              onIonChange={e => setPassword(e.detail.value)}
            />
          </IonItem>
          
          <IonButton expand="block" className="auth-button" onClick={handleLogin}>
            Войти
          </IonButton>
          
          <div className="auth-links">
            <a href="#" className="auth-link" onClick={goToRecoverPassword}>
              Забыли пароль? Восстановить аккаунт
            </a>
            <a href="#" className="auth-link" onClick={goToRegister}>
              Зарегистрироваться
            </a>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthPage;

// src/pages/AvailableOrdersPage.jsx - Available orders page
import React from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle,
  IonFooter,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  useIonRouter
} from '@ionic/react';
import { 
  listOutline, 
  filterOutline, 
  timeOutline, 
  personOutline 
} from 'ionicons/icons';
import OrderCard from '../components/OrderCard';
import { AVAILABLE_ORDERS } from '../data/mockData';

const AvailableOrdersPage = () => {
  const router = useIonRouter();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Доступные заказы</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '10px' }}>
          {AVAILABLE_ORDERS.map((order) => (
            <OrderCard 
              key={`${order.id}-${order.status}`} 
              order={order}
              onClick={() => router.push(`/order/${order.id}`)}
            />
          ))}
        </div>
      </IonContent>
      <IonFooter>
        <IonTabBar slot="bottom" className="tab-bar">
          <IonTabButton tab="my-orders" href="/my-orders">
            <IonIcon icon={listOutline} />
            <IonLabel>Мои заказы</IonLabel>
          </IonTabButton>
          <IonTabButton tab="filters" href="/filters">
            <IonIcon icon={filterOutline} />
            <IonLabel>Фильтры</IonLabel>
          </IonTabButton>
          <IonTabButton tab="history" href="/order-history">
            <IonIcon icon={timeOutline} />
            <IonLabel>История</IonLabel>
          </IonTabButton>
          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>Профиль</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonFooter>
    </IonPage>
  );
};

export default AvailableOrdersPage;

// src/pages/MyOrdersPage.jsx - My orders page
import React from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle,
  IonFooter,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonButtons,
  IonBackButton,
  useIonRouter
} from '@ionic/react';
import { 
  searchOutline, 
  filterOutline, 
  timeOutline, 
  personOutline 
} from 'ionicons/icons';
import OrderCard from '../components/OrderCard';
import { MY_ORDERS } from '../data/mockData';

const MyOrdersPage = () => {
  const router = useIonRouter();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/available-orders" />
          </IonButtons>
          <IonTitle>Мои заказы</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '10px' }}>
          {MY_ORDERS.map((order) => (
            <OrderCard 
              key={`${order.id}-${order.status}`} 
              order={order}
              onClick={() => router.push(`/order/${order.id}`)}
            />
          ))}
        </div>
      </IonContent>
      <IonFooter>
        <IonTabBar slot="bottom" className="tab-bar">
          <IonTabButton tab="search" href="/search">
            <IonIcon icon={searchOutline} />
            <IonLabel>Поиск заказа</IonLabel>
          </IonTabButton>
          <IonTabButton tab="filters" href="/filters">
            <IonIcon icon={filterOutline} />
            <IonLabel>Фильтры</IonLabel>
          </IonTabButton>
          <IonTabButton tab="history" href="/order-history">
            <IonIcon icon={timeOutline} />
            <IonLabel>История</IonLabel>
          </IonTabButton>
          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>Профиль</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonFooter>
    </IonPage>
  );
};

export default MyOrdersPage;

// src/pages/OrderHistoryPage.jsx - Order history page
import React from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle,
  IonFooter,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonButtons,
  IonBackButton,
  useIonRouter
} from '@ionic/react';
import { 
  searchOutline, 
  filterOutline, 
  timeOutline, 
  personOutline 
} from 'ionicons/icons';
import OrderCard from '../components/OrderCard';
import { HISTORY_ORDERS } from '../data/mockData';

const OrderHistoryPage = () => {
  const router = useIonRouter();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/available-orders" />
          </IonButtons>
          <IonTitle>История</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '10px' }}>
          {HISTORY_ORDERS.map((order) => (
            <OrderCard 
              key={`${order.id}-${order.status}`} 
              order={order}
              onClick={() => router.push(`/order/${order.id}`)}
            />
          ))}
        </div>
      </IonContent>
      <IonFooter>
        <IonTabBar slot="bottom" className="tab-bar">
          <IonTabButton tab="search" href="/search">
            <IonIcon icon={searchOutline} />
            <IonLabel>Поиск заказа</IonLabel>
          </IonTabButton>
          <IonTabButton tab="filters" href="/filters">
            <IonIcon icon={filterOutline} />
            <IonLabel>Фильтры</IonLabel>
          </IonTabButton>
          <IonTabButton tab="history" href="/order-history">
            <IonIcon icon={timeOutline} />
            <IonLabel>История</IonLabel>
          </IonTabButton>
          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>Профиль</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonFooter>
    </IonPage>
  );
};

export default OrderHistoryPage;

// src/pages/RegisterPage.jsx - Register page
import React, { useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonInput, 
  IonButton, 
  IonItem, 
  IonLabel,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  useIonRouter
} from '@ionic/react';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useIonRouter();

  const handleRegister = () => {
    // Implement registration logic here
    router.push('/auth');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/auth" />
          </IonButtons>
          <IonTitle>Регистрация</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '20px' }}>
          <IonItem className="auth-input">
            <IonLabel position="stacked">ФИО</IonLabel>
            <IonInput
              type="text"
              placeholder="Введите ваше полное имя"
              value={fullName}
              onIonChange={e => setFullName(e.detail.value)}
            />
          </IonItem>
          
          <IonItem className="auth-input">
            <IonLabel position="stacked">Номер телефона</IonLabel>
            <IonInput
              type="tel"
              placeholder="+7 (XXX) XXX - XXXX"
              value={phone}
              onIonChange={e => setPhone(e.detail.value)}
            />
          </IonItem>
          
          <IonItem className="auth-input">
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              placeholder="example@mail.com"
              value={email}
              onIonChange={e => setEmail(e.detail.value)}
            />
          </IonItem>
          
          <IonItem className="auth-input">
            <IonLabel position="stacked">Пароль</IonLabel>
            <IonInput
              type="password"
              placeholder="Минимум 8 символов"
              value={password}
              onIonChange={e => setPassword(e.detail.value)}
            />
          </IonItem>
          
          <IonItem className="auth-input">
            <IonLabel position="stacked">Подтвердите пароль</IonLabel>
            <IonInput
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onIonChange={e => setConfirmPassword(e.detail.value)}
            />
          </IonItem>
          
          <IonButton expand="block" className="auth-button" onClick={handleRegister}>
            Зарегистрироваться
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;

// src/pages/RecoverPasswordPage.jsx - Recover password page
import React, { useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonInput, 
  IonButton, 
  IonItem, 
  IonLabel,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  useIonRouter
} from '@ionic/react';

const RecoverPasswordPage = () => {
  const [phone, setPhone] = useState('');
  const router = useIonRouter();

  const handleRecover = () => {
    // Implement recovery logic here
    router.push('/auth');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/auth" />
          </IonButtons>
          <IonTitle>Восстановление пароля</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '20px' }}>
          <p style={{ textAlign: 'center', margin: '20px 0' }}>
            Введите номер телефона, к которому привязан аккаунт
          </p>
          
          <IonItem className="auth-input">
            <IonLabel position="stacked">Номер телефона</IonLabel>
            <IonInput
              type="tel"
              placeholder="+7 (XXX) XXX - XXXX"
              value={phone}
              onIonChange={e => setPhone(e.detail.value)}
            />
          </IonItem>
          
          <IonButton expand="block" className="auth-button" onClick={handleRecover}>
            Восстановить
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RecoverPasswordPage;

// src/pages/ProfilePage.jsx - Profile page
import React from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle,
  IonFooter,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonItem,
  IonAvatar,
  IonList,
  IonButton,
  useIonRouter
} from '@ionic/react';
import { 
  searchOutline, 
  filterOutline, 
  timeOutline, 
  personOutline,
  chevronForward,
  logOutOutline
} from 'ionicons/icons';

const ProfilePage = () => {
  const router = useIonRouter();

  const handleLogout = () => {
    router.push('/auth');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/available-orders" />
          </IonButtons>
          <IonTitle>Профиль</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '20px' }}>
          <IonItem lines="none" className="profile-header">
            <IonAvatar slot="start" style={{ width: '70px', height: '70px' }}>
              <img src="https://gravatar.com/avatar/placeholder?d=mp" alt="Avatar" />
            </IonAvatar>
            <div>
              <h2 style={{ margin: '0', fontWeight: 'bold' }}>Иван Иванов</h2>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>+7 (999) 999-9999</p>
              <p style={{ margin: '2px 0 0 0', color: '#666' }}>example@mail.com</p>
            </div>
          </IonItem>

          <IonList style={{ marginTop: '20px' }}>
            <IonItem detail={true} detailIcon={chevronForward}>
              <IonLabel>Личные данные</IonLabel>
            </IonItem>
            <IonItem detail={true} detailIcon={chevronForward}>
              <IonLabel>Мои транспортные средства</IonLabel>
            </IonItem>
            <IonItem detail={true} detailIcon={chevronForward}>
              <IonLabel>Настройки уведомлений</IonLabel>
            </IonItem>
            <IonItem detail={true} detailIcon={chevronForward}>
              <IonLabel>О приложении</IonLabel>
            </IonItem>
            <IonItem detail={true} detailIcon={chevronForward}>
              <IonLabel>Служба поддержки</IonLabel>
            </IonItem>
          </IonList>

          <IonButton 
            expand="block" 
            color="danger" 
            fill="outline"
            style={{ marginTop: '30px' }}
            onClick={handleLogout}
          >
            <IonIcon slot="start" icon={logOutOutline} />
            Выйти из аккаунта
          </IonButton>
        </div>
      </IonContent>
      <IonFooter>
        <IonTabBar slot="bottom" className="tab-bar">
          <IonTabButton tab="search" href="/search">
            <IonIcon icon={searchOutline} />
            <IonLabel>Поиск заказа</IonLabel>
          </IonTabButton>
          <IonTabButton tab="filters" href="/filters">
            <IonIcon icon={filterOutline} />
            <IonLabel>Фильтры</IonLabel>
          </IonTabButton>
          <IonTabButton tab="history" href="/order-history">
            <IonIcon icon={timeOutline} />
            <IonLabel>История</IonLabel>
          </IonTabButton>
          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>Профиль</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonFooter>
    </IonPage>
  );
};

export default ProfilePage;

// src/pages/OrderDetailsPage.jsx - Order details page
import React from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonButton,
  IonIcon,
  useIonRouter
} from '@ionic/react';
import { 
  locationOutline, 
  locationSharp,
  callOutline
} from 'ionicons/icons';
import { useParams } from 'react-router';
import { AVAILABLE_ORDERS, MY_ORDERS, HISTORY_ORDERS } from '../data/mockData';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const router = useIonRouter();
  
  // Find the order in all order lists
  const order = [...AVAILABLE_ORDERS, ...MY_ORDERS, ...HISTORY_ORDERS].find(
    order => order.id === id
  );

  if (!order) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/available-orders" />
            </IonButtons>
            <IonTitle>Детали заказа</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Заказ не найден</h2>
            <IonButton onClick={() => router.push('/available-orders')}>
              К списку заказов
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/available-orders" />
          </IonButtons>
          <IonTitle>Детали заказа</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '10px' }}>
          <IonCard className="order-card">
            <IonCardHeader>
              <div>
                <span className={`order-badge badge-${order.status}`}>
                  {order.statusText}
                </span>
                <span className="order-id">ID:{order.id}</span>
                <span className="order-price">₽ {order.price}</span>
              </div>
              <div className="order-title">{order.title}</div>
            </IonCardHeader>
            
            <IonCardContent>
              <div className="order-route">
                <div className="route-point">
                  <IonIcon icon={locationOutline} color="primary" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  <div className="route-label">Откуда:</div>
                  <div className="route-value">{order.from}</div>
                </div>
                <div className="route-date">
                  <div className="route-label">Дата загрузки:</div>
                  <div className="date-value">{order.loadingDate}</div>
                  <div className="date-time">{order.loadingTime}</div>
                </div>
              </div>
              
              <div className="order-route">
                <div className="route-point">
                  <IonIcon icon={locationSharp} color="danger" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  <div className="route-label">Куда:</div>
                  <div className="route-value">{order.to}</div>
                </div>
                <div className="route-date">
                  <div className="route-label">Дата выгрузки:</div>
                  <div className="date-value">{order.unloadingDate}</div>
                  <div className="date-time">{order.unloadingTime}</div>
                </div>
              </div>
              
              <div className="cargo-details" style={{ marginTop: '15px' }}>
                <div className="details-title">Детали груза:</div>
                <div className="cargo-metrics">
                  <div className="cargo-metric">
                    <div className="metric-label">Вес (т):</div>
                    <div className="metric-value">{order.weight}</div>
                  </div>
                  <div className="cargo-metric">
                    <div className="metric-label">Объем (м³):</div>
                    <div className="metric-value">{order.volume}</div>
                  </div>
                </div>
                <div className="cargo-description">{order.details}</div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <h4>Информация о заказчике:</h4>
                <p>ООО "ТрансЛогистик"</p>
                <p>Контактное лицо: Алексей Петров</p>
                <p>Телефон: +7 (XXX) XXX-XX-XX</p>
              </div>
              
              {order.status === 'new' && (
                <div className="action-buttons">
                  <IonButton expand="block" fill="outline" size="default">
                    <IonIcon slot="start" icon={callOutline} />
                    Связаться с заказчиком
                  </IonButton>
                  <IonButton expand="block" color="primary" size="default">
                    Предложить свою цену
                  </IonButton>
                </div>
              )}
              
              {(order.status === 'in-progress' || order.status === 'negotiation') && (
                <IonButton expand="block" fill="outline" size="default">
                  <IonIcon slot="start" icon={callOutline} />
                  Связаться с заказчиком
                </IonButton>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OrderDetailsPage;

// src/components/OrderCard.jsx - Reusable order card component
import React from 'react';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardContent, 
  IonIcon, 
  IonButton 
} from '@ionic/react';
import { locationOutline, locationSharp } from 'ionicons/icons';

const OrderCard = ({ order, onClick }) => {
  return (
    <IonCard className="order-card" onClick={onClick}>
      <IonCardHeader>
        <div>
          <span className={`order-badge badge-${order.status}`}>
            {order.statusText}
          </span>
          <span className="order-id">ID:{order.id}</span>
          <span className="order-price">₽ {order.price}</span>
        </div>
        <div className="order-title">{order.title}</div>
      </IonCardHeader>
      
      <IonCardContent>
        <div className="order-route">
          <div className="route-point">
            <IonIcon icon={locationOutline} color="primary" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            <div className="route-label">Откуда:</div>
            <div className="route-value">{order.from}</div>
          </div>
          <div className="route-date">
            <div className="route-label">Дата загрузки:</div>
            <div className="date-value">{order.loadingDate}</div>
            <div className="date-time">{order.loadingTime}</div>
          </div>
        </div>
        
        <div className="order-route">
          <div className="route-point">
            <IonIcon icon={locationSharp} color="danger" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            <div className="route-label">Куда:</div>
            <div className="route-value">{order.to}</div>
          </div>
          <div className="route-date">
            <div className="route-label">Дата выгрузки:</div>
            <div className="date-value">{order.unloadingDate}</div>
            <div className="date-time">{order.unloadingTime}</div>
          </div>
        </div>
        
        <div className="cargo-details" style={{ marginTop: '15px' }}>
          <div className="details-title">Детали груза:</div>
          <div className="cargo-metrics">
            <div className="cargo-metric">
              <div className="metric-label">Вес (т):</div>
              <div className="metric-value">{order.weight}</div>
            </div>
            <div className="cargo-metric">
              <div className="metric-label">Объем (м³):</div>
              <div className="metric-value">{order.volume}</div>
            </div>
          </div>
          <div className="cargo-description">{order.details}</div>
        </div>
        
        {order.status === 'new' && (
          <div className="action-buttons">
            <IonButton expand="block" fill="outline" size="small" onClick={(e) => {
              e.stopPropagation();
              // Handle contact action
            }}>
              Связаться с заказчиком
            </IonButton>
            <IonButton expand="block" color="primary" size="small" onClick={(e) => {
              e.stopPropagation();
              // Handle offer action
            }}>
              Предложить свою цену
            </IonButton>
          </div>
        )}
        
        {(order.status === 'in-progress' || order.status === 'negotiation') && (
          <IonButton expand="block" fill="outline" size="small" onClick={(e) => {
            e.stopPropagation();
            // Handle contact action
          }}>
            Связаться с заказчиком
          </IonButton>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default OrderCard;

// src/data/mockData.js - Sample data for the app
// Mock data for orders
export const AVAILABLE_ORDERS = [
  {
    id: '12460',
    status: 'new',
    statusText: 'Новый',
    price: '120 000',
    title: 'Перевозка промышленного оборудования',
    from: 'Казань',
    to: 'Уфа',
    loadingDate: '01.04.2025',
    loadingTime: '09:00-15:00',
    unloadingDate: '03.04.2025',
    unloadingTime: '09:00-15:00',
    weight: '15',
    volume: '45',
    details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.'
  },
  {
    id: '12461',
    status: 'in-progress',
    statusText: 'В работе',
    price: '40 000',
    title: 'Перевозка промышленного оборудования',
    from: 'Казань',
    to: 'Уфа',
    loadingDate: '01.04.2025',
    loadingTime: '09:00-15:00',
    unloadingDate: '03.04.2025',
    unloadingTime: '09:00-15:00',
    weight: '5',
    volume: '15',
    details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.'
  },
  {
    id: '12462',
    status: 'negotiation',
    statusText: 'Торг',
    price: '120 000',
    title: 'Перевозка промышленного оборудования',
    from: 'Казань',
    to: 'Уфа',
    loadingDate: '01.04.2025',
    loadingTime: '09:00-15:00',
    unloadingDate: '03.04.2025',
    unloadingTime: '09:00-15:00',
    weight: '15',
    volume: '45',
    details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.'
  }
];

export const MY_ORDERS = [
  {
    id: '12461',
    status: 'in-progress',
    statusText: 'В работе',
    price: '40 000',
    title: 'Перевозка промышленного оборудования',
    from: 'Казань',
    to: 'Уфа',
    loadingDate: '01.04.2025',
    loadingTime: '09:00-15:00',
    unloadingDate: '03.04.2025',
    unloadingTime: '09:00-15:00',
    weight: '5',
    volume: '15',
    details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.'
  }
];

export const HISTORY_ORDERS = [
  {
    id: '12450',
    status: 'completed',
    statusText: 'Выполнено',
    price: '120 000',
    title: 'Перевозка промышленного оборудования',
    from: 'Казань',
    to: 'Уфа',
    loadingDate: '01.04.2025',
    loadingTime: '09:00-15:00',
    unloadingDate: '03.04.2025',
    unloadingTime: '09:00-15:00',
    weight: '15',
    volume: '45',
    details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.'
  },
  {
    id: '12451',
    status: 'completed',
    statusText: 'Выполнено',
    price: '120 000',
    title: 'Перевозка промышленного оборудования',
    from: 'Казань',
    to: 'Уфа',
    loadingDate: '01.04.2025',
    loadingTime: '09:00-15:00',
    unloadingDate: '03.04.2025',
    unloadingTime: '09:00-15:00',
    weight: '15',
    volume: '45',
    details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.'
  },
  {
    id: '12452',
    status: 'completed',
    statusText: 'Выполнено',
    price: '120 000',
    title: 'Перевозка промышленного оборудования',
    from: 'Казань',
    to: 'Уфа',
    loadingDate: '01.04.2025',
    loadingTime: '09:00-15:00',
    unloadingDate: '03.04.2025',
    unloadingTime: '09:00-15:00',
    weight: '15',
    volume: '45',
    details: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.'
  }
];