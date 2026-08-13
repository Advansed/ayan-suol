import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Cargos } from '../components/Cargos';
import { Works } from '../components/Works';
import { useWorks } from '../components/Works/useWorks';
import { useCargos } from '../components/Cargos/hooks/useCargos';
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
import panelStyles from '../layout/PanelFrame.module.css';
import { PassportVerification } from '../components/Verification/PassportVerification';
import { CargoStatus } from '../Store/cargoStore';
import { filterWorksByMode } from '../components/Works/statusFlow';

/** Лента заказов */
export const FeedPage: React.FC = () => {
  const { user_type } = useUserType();
  const { works, refreshWorks } = useWorks();
  const { cargos, refreshCargos } = useCargos();

  const handleRefresh = () => {
    if (user_type === 2) {
      void refreshWorks();
    } else {
      void refreshCargos();
    }
  };

  const customerActive = cargos.filter((cargo) => cargo.status !== CargoStatus.COMPLETED).length;
  const carrierActive = filterWorksByMode(works, 'feed').length;
  const isCustomer = user_type !== 2;
  const activeCount = isCustomer ? customerActive : carrierActive;

  return (
    <PanelFrame
      title="Лента заказов"
      crumb="Биржа грузоперевозок"
      subtitle={`${activeCount} активных заказов · обновлено только что`}
      bare
      actions={
        <button
          type="button"
          className={panelStyles.refreshBtn}
          onClick={handleRefresh}
          aria-label="Обновить"
        >
          <RefreshCw size={16} strokeWidth={2} />
          Обновить
        </button>
      }
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
  const { refreshWorks } = useWorks();
  const { refreshCargos } = useCargos();

  const handleRefresh = () => {
    if (user_type === 2) {
      void refreshWorks();
    } else {
      void refreshCargos();
    }
  };

  return (
    <PanelFrame
      title="Мои заказы"
      subtitle={
        user_type === 2
          ? 'Ваши отклики и заказы в работе'
          : 'Заказы, которые вы разместили'
      }
      actions={
        <button
          type="button"
          className={panelStyles.refreshBtn}
          onClick={handleRefresh}
          aria-label="Обновить"
        >
          <RefreshCw size={16} strokeWidth={2} />
          Обновить
        </button>
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
  const chatOpen = Boolean(id);

  return (
    <PanelFrame title="Сообщения" bare>
      <div
        className={`web-chats-layout ${chatOpen ? 'web-chats-open' : 'web-chats-list'}`}
      >
        <aside className="web-chats-sidebar">
          <ChatsList activeId={id} />
        </aside>
        <main className="web-chats-main">
          {id ? (
            <Chats name={id} />
          ) : (
            <div className="web-chats-empty">
              <p>Выберите диалог</p>
              <span>Переписка по заказу появится здесь</span>
            </div>
          )}
        </main>
      </div>
    </PanelFrame>
  );
};

export const SettingsRoutePage: React.FC = () => (
  <PanelFrame title="Настройки" subtitle="Параметры аккаунта и уведомлений" bare>
    <Settings />
  </PanelFrame>
);

export const ProfileRoutePage: React.FC = () => (
  <PanelFrame title="Профиль" subtitle="Персональные данные и организация">
    <Profile />
  </PanelFrame>
);

export const FinancePage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ amount?: number | string }>();
  const queryAmount = new URLSearchParams(location.search).get('amount');
  const initialAmount = location.state?.amount ?? queryAmount;

  return (
    <PanelFrame
      title="Финансы"
      crumb="Кошелёк и выплаты"
      actions={
        <button
          type="button"
          className={panelStyles.refreshBtn}
          onClick={() => document.getElementById('statement')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Выписка
        </button>
      }
      bare
    >
      <div className="web-finance-layout">
        <WalletPage
          onBack={() => history.push('/')}
          initialAmount={initialAmount}
        />
      </div>
    </PanelFrame>
  );
};

export const VehiclesPage: React.FC = () => {
  return (
    <PanelFrame title="Мои машины" subtitle="Транспорт и документы" bare>
      <TransportEditPage />
    </PanelFrame>
  );
};

export const VerificationPage: React.FC = () => {
  const history = useHistory();
  return (
    <PanelFrame
      title="Верификация"
      subtitle="Паспортные данные и фото для подтверждения"
      bare
    >
      <PassportVerification onBack={() => history.push('/profile')} />
    </PanelFrame>
  );
};
