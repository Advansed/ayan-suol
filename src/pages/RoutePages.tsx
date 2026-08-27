import React from 'react';
import { Download } from 'lucide-react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
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
import panelStyles from '../layout/PanelFrame.module.css';
import { PassportVerification } from '../components/Verification/PassportVerification';
/** Лента заказов */
export const FeedPage: React.FC = () => {
  const { user_type } = useUserType();

  if (user_type === 2) {
    return (
      <div className="web-performer-feed">
        <Works mode="feed" />
      </div>
    );
  }

  return (
    <div className="web-performer-feed">
      <Cargos />
    </div>
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
  const { user_type } = useUserType();
  const chatOpen = Boolean(id);

  return (
    <PanelFrame
      crumb={user_type === 2 ? 'Общение с заказчиками' : 'Общение с перевозчиками'}
      title="Чат"
      bare
      className="web-chats-frame"
    >
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
      crumb="Кошелёк и выплаты"
      title="Финансы"
      actions={
        <button
          type="button"
          className={panelStyles.refreshBtn}
          onClick={() => document.getElementById('statement')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Download size={16} strokeWidth={2} />
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
  return <TransportEditPage />;
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
