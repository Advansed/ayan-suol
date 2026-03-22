import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IonIcon, IonToggle, IonButton } from '@ionic/react';
import {
  personOutline,
  businessOutline,
  carOutline,
  checkmarkCircleOutline,
  walletOutline,
  documentTextOutline,
  notificationsOutline,
  volumeHighOutline,
  phonePortrait,
  lockClosedOutline,
  linkOutline,
  logOutOutline,
  chevronForwardOutline,
  personCircleOutline
} from 'ionicons/icons';
import { WizardHeader } from '../../Header/WizardHeader';
import { useLogin } from '../../../Store/useLogin';
import { useProfile } from '../../Profile/useProfile';
import { useHistory } from 'react-router-dom';
import styles from '../Settings.module.css';
import { SettingsAgreementsSection } from './SettingsAgreementsSection';
import { useWallet } from '../hooks/useWallet';

export interface SettingsPageProps {
  onProfileClick?: () => void;
  onOrganizationClick?: () => void;
  onTransportClick?: () => void;
  onWalletClick?: () => void;
  onToggleClick?: () => void;
  onBack?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onProfileClick,
  onOrganizationClick,
  onTransportClick,
  onWalletClick,
  onToggleClick,
  onBack
}) => {
  const { user, logout } = useLogin();
  const { user_type, companyData, transportData } = useProfile();
  const history = useHistory();

  const { accountData, isLoading: accountLoading, transactions, load } = useWallet();

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    load();
  }, [load]);

  const [pushNotifications, setPushNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  const handleMenuClick = () => {
    if (onBack) {
      onBack();
    } else {
      history.goBack();
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  const handleToggle = () => {
    if (onToggleClick) {
      onToggleClick();
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      history.push('/cabinet');
    }
  };

  const handleOrganizationClick = () => {
    if (onOrganizationClick) {
      onOrganizationClick();
    }
  };

  const handleTransportClick = () => {
    if (onTransportClick) {
      onTransportClick();
    }
  };

  const handleWalletClick = () => {
    if (onWalletClick) onWalletClick();
  };

  const profileSubtext =
    [user.name?.trim(), user.email?.trim()].filter(Boolean).join(' · ') || '—';

  const organizationSubtext =
    companyData?.name?.trim() ||
    companyData?.inn ||
    'Указать реквизиты';

  const transportSubtext = transportData
    ? [transportData.license_plate || transportData.number, transportData.transport_type || transportData.type]
        .filter(Boolean)
        .join(' · ') || 'Транспорт'
    : 'Добавить транспорт';

  const balanceText = useMemo(() => {
    if (!accountData) return '—';
    if (accountLoading) return 'Загрузка...';
    try {
      return accountData.balance.toLocaleString('ru-RU', {
        style: 'currency',
        currency: accountData.currency || 'RUB',
        maximumFractionDigits: 0
      });
    } catch {
      return `${accountData.balance} ${accountData.currency || 'RUB'}`;
    }
  }, [accountData, accountLoading]);

  const transactionsText = useMemo(() => {
    if (!transactions) return '—';
    if (transactions.length === 0) return 'Пока нет транзакций';
    return `${transactions.length} операций`;
  }, [transactions]);

  return (
    <div className={styles.settingsContainer}>
      <WizardHeader title="Настройки" onMenu={handleMenuClick} />

      <div className={styles.content}>
        {/* Секция: Профиль */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <IonIcon icon={personOutline} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Профиль</h3>
          </div>

          <div className={styles.settingsList}>
            <div className={styles.settingItem} onClick={handleProfileClick}>
              <IonIcon icon={personCircleOutline} className={styles.settingIcon} color="primary" />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Профиль</span>
                <span className={styles.settingSubtext}>{profileSubtext}</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>

            <div className={styles.settingItem} onClick={handleOrganizationClick}>
              <IonIcon icon={businessOutline} className={styles.settingIcon} color="primary" />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Организация</span>
                <span className={styles.settingSubtext}>{organizationSubtext}</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>

            {user_type === 2 && (
              <div className={styles.settingItem} onClick={handleTransportClick}>
                <IonIcon icon={carOutline} className={styles.settingIcon} color="primary" />
                <div className={styles.settingContent}>
                  <span className={styles.settingLabel}>Транспорт</span>
                  <span className={styles.settingSubtext}>{transportSubtext}</span>
                </div>
                <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
              </div>
            )}

            <div className={styles.settingItem}>
              <IonIcon icon={checkmarkCircleOutline} className={styles.settingIconVerified} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Подтверждённый аккаунт</span>
                <span className={styles.settingSubtext}>Аккаунт верифицирован</span>
              </div>
            </div>
          </div>
        </div>

        {/* Секция: Режим работы */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <IonIcon icon={personOutline} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Режим работы</h3>
          </div>
          <p className={styles.sectionDescription}>
            Переключение между ролями заказчика и водителя
          </p>
          <div className={styles.roleSwitcher}>
            <div className={styles.roleContainer}>
              <div className={`${styles.roleItem} ${user_type === 1 ? styles.roleActive : ''}`}>
                <IonIcon icon={personOutline} className={styles.roleIcon} />
                <span className={styles.roleText}>Заказчик</span>
              </div>
              <div className={styles.roleSeparator}></div>
              <div className={`${styles.roleItem} ${user_type === 2 ? styles.roleActive : ''}`}>
                <IonIcon icon={phonePortrait} className={styles.roleIcon} />
                <span className={styles.roleText}>Водитель</span>
              </div>
            </div>
            <IonToggle
              checked={user_type === 2}
              onIonChange={() => handleToggle()}
              className={styles.toggle}
            />
          </div>
          <p className={styles.instructionText}>
            {user_type === 1
              ? 'Вы работаете в режиме заказчика. Можете создавать заказы и выбирать водителей.'
              : 'Вы работаете в режиме водителя. Можете просматривать и принимать заказы.'}
          </p>
        </div>

        {/* Секция: Мой кошелёк */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <IonIcon icon={walletOutline} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Мой кошелёк</h3>
          </div>

          <div className={styles.settingsList}>
            <div className={styles.settingItem} onClick={handleWalletClick}>
              <IonIcon icon={walletOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Баланс счёта</span>
                <span className={styles.settingSubtext}>{balanceText}</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>

            <div className={styles.settingItem} onClick={handleWalletClick}>
              <IonIcon icon={documentTextOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>История транзакций</span>
                <span className={styles.settingSubtext}>{transactionsText}</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>
          </div>
        </div>

        {/* Секция: пользовательское соглашение и маркетинг (ProfileOld Agreements) */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <IonIcon icon={documentTextOutline} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Согласия</h3>
          </div>
          <p className={styles.sectionDescription}>
            Пользовательское соглашение, документы к нему и согласие на рекламные рассылки
          </p>
          <SettingsAgreementsSection />
        </div>

        {/* Секция: Уведомления */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <IonIcon icon={notificationsOutline} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Уведомления</h3>
          </div>
          <p className={styles.sectionDescription}>
            Управление способами получения уведомлений
          </p>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <IonIcon icon={notificationsOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Push-уведомления</span>
                <span className={styles.settingSubtext}>Уведомления в приложении</span>
              </div>
              <IonToggle
                checked={pushNotifications}
                onIonChange={(e) => setPushNotifications(e.detail.checked)}
                className={styles.toggle}
              />
            </div>
            <div className={styles.settingItem}>
              <IonIcon icon={volumeHighOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Звук</span>
                <span className={styles.settingSubtext}>Звуковые уведомления</span>
              </div>
              <IonToggle
                checked={sound}
                onIonChange={(e) => setSound(e.detail.checked)}
                className={styles.toggle}
              />
            </div>
            <div className={styles.settingItem}>
              <IonIcon icon={phonePortrait} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Вибрация</span>
                <span className={styles.settingSubtext}>Вибрация при уведомлениях</span>
              </div>
              <IonToggle
                checked={vibration}
                onIonChange={(e) => setVibration(e.detail.checked)}
                className={styles.toggle}
              />
            </div>
          </div>
        </div>

        {/* Секция: Безопасность */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <IonIcon icon={lockClosedOutline} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Безопасность</h3>
          </div>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <IonIcon icon={lockClosedOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Изменить пароль</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>
            <div className={styles.settingItem}>
              <IonIcon icon={linkOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Привязанные устройства</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>
          </div>
        </div>

        {/* Кнопка выхода */}
        <div className={styles.logoutSection}>
          <IonButton color="danger" className={styles.logoutButton} onClick={handleLogout}>
            <IonIcon icon={logOutOutline} slot="start" />
            Выйти из аккаунта
          </IonButton>
        </div>
      </div>
    </div>
  );
};
