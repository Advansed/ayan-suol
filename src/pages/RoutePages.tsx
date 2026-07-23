import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Cargos } from '../components/Cargos';
import { Works } from '../components/Works';
import CargoArchive from '../components/Cargos/components/CargoArchive';
import { WorkArchive } from '../components/Works/components';
import { useUserType } from '../Store/loginStore';
import Chats from '../components/Chats/Chats';
import { ChatsList } from '../components/Chats/ChatsList';
import { Settings } from '../components/Settings';
import { Profile } from '../components/Profile';
import { WalletPage } from '../components/Settings/components/WalletPage';
import { TransportEditPage } from '../components/Settings/components/TransportEditPage';
import { PanelFrame } from '../layout/PanelFrame';

/** Лента заказов — только новые */
export const FeedPage: React.FC = () => {
  const { user_type } = useUserType();
  return (
    <PanelFrame
      title="Лента заказов"
      subtitle={user_type === 2 ? 'Новые грузы для перевозки' : 'Ваши заказы'}
    >
      <div className="web-list-layout">
        {user_type === 2 ? <Works mode="feed" /> : <Cargos />}
      </div>
    </PanelFrame>
  );
};

/** Мои заказы — отклики и перевозки в работе */
export const OrdersPage: React.FC = () => {
  const { user_type } = useUserType();
  return (
    <PanelFrame
      title="Мои заказы"
      subtitle={
        user_type === 2
          ? 'Ваши отклики и заказы в работе'
          : 'Заказы, которые вы разместили'
      }
    >
      <div className="web-list-layout">
        {user_type === 2 ? <Works mode="mine" /> : <Cargos />}
      </div>
    </PanelFrame>
  );
};

/** Архив */
export const ArchivePage: React.FC = () => {
  const { user_type } = useUserType();
  return (
    <PanelFrame title="Архив" subtitle="Завершённые заказы и работы">
      <div className="web-list-layout">
        {user_type === 2 ? <WorkArchive /> : <CargoArchive />}
      </div>
    </PanelFrame>
  );
};

export const ChatsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  return (
    <PanelFrame title="Чат" subtitle="Переписка по заказам">
      <div className="web-chats-layout">
        {id === undefined ? <ChatsList /> : <Chats name={id} />}
      </div>
    </PanelFrame>
  );
};

export const SettingsRoutePage: React.FC = () => (
  <PanelFrame title="Настройки" subtitle="Параметры аккаунта и уведомлений">
    <Settings />
  </PanelFrame>
);

export const ProfileRoutePage: React.FC = () => (
  <PanelFrame title="Профиль" subtitle="Персональные данные">
    <Profile />
  </PanelFrame>
);

export const FinancePage: React.FC = () => {
  const history = useHistory();
  return (
    <PanelFrame title="Финансы" subtitle="Баланс, операции и счета" bare>
      <div className="web-finance-layout">
        <WalletPage onBack={() => history.push('/')} />
      </div>
    </PanelFrame>
  );
};

export const VehiclesPage: React.FC = () => {
  const history = useHistory();
  return (
    <PanelFrame title="Мои машины" subtitle="Транспорт и документы" bare>
      <TransportEditPage onBack={() => history.push('/')} />
    </PanelFrame>
  );
};
