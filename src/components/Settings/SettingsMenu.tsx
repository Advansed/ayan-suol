import React, { useState } from 'react';
import { IonIcon, IonToggle, IonButton } from '@ionic/react';
import { 
  personOutline, 
  phonePortraitOutline, 
  checkmarkCircleOutline,
  walletOutline,
  documentTextOutline,
  moonOutline,
  languageOutline,
  powerOutline,
  notificationsOutline,
  volumeHighOutline,
  phonePortrait,
  lockClosedOutline,
  linkOutline,
  logOutOutline,
  chevronForwardOutline,
  personCircleOutline
} from 'ionicons/icons';
import { WizardHeader } from '../Header/WizardHeader';
import { useLogin } from '../../Store/useLogin';
import { useProfile } from '../Profile/useProfile';
import { useHistory } from 'react-router-dom';
import styles from './Settings.module.css';

export const SettingsMenu: React.FC = () => {
  const { user, logout } = useLogin();
  const { user_type } = useProfile();
  const history = useHistory();

  const [darkMode, setDarkMode] = useState(false);
  const [keepScreenOn, setKeepScreenOn] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  const handleMenuClick = () => {
    history.goBack();
  };

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  return (
    <div className={styles.settingsContainer}>
      <WizardHeader 
        title="Настройки"
        onMenu={handleMenuClick}
      />

      <div className={styles.content}>
        {/* Секция: Профиль */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <IonIcon icon={personOutline} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Профиль</h3>
          </div>

          <div className={styles.settingsList}>
            <div className={styles.settingItem} onClick={() => history.push('/settings')}>
              <IonIcon icon={ personCircleOutline } className={styles.settingIcon} color='primary'/>
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Профиль</span>
                <span className={styles.settingSubtext}>{user.phone || '+123 456 789'}</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>

            <div className={styles.settingItem}>
              <IonIcon icon={phonePortraitOutline} className={styles.settingIcon} color='primary' />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Номер телефона</span>
                <span className={styles.settingSubtext}>{user.phone || '+123 456 789'}</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>

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
              onIonChange={(e) => {
                history.push('/settings');
              }}
              className={styles.toggle}
            />
          </div>
          <p className={styles.instructionText}>
            {user_type === 1 
              ? "Вы работаете в режиме заказчика. Можете создавать заказы и выбирать водителей."
              : "Вы работаете в режиме водителя. Можете просматривать и принимать заказы."}
          </p>
        </div>

        {/* Секция: Мой кошелёк */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <IonIcon icon={walletOutline} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Мой кошелёк</h3>
          </div>

          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <IonIcon icon={walletOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Баланс счёта</span>
                <span className={styles.settingSubtext}>125 450 ₽</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>

            <div className={styles.settingItem}>
              <IonIcon icon={documentTextOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>История транзакций</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>
          </div>
        </div>

        {/* Секция: Внешний вид */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <IonIcon icon={moonOutline} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Внешний вид</h3>
          </div>

          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <IonIcon icon={moonOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Тёмный режим</span>
                <span className={styles.settingSubtext}>Тёмная тема интерфейса</span>
              </div>
              <IonToggle
                checked={darkMode}
                onIonChange={(e) => setDarkMode(e.detail.checked)}
                className={styles.toggle}
              />
            </div>

            <div className={styles.settingItem}>
              <IonIcon icon={languageOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Язык</span>
              </div>
              <IonIcon icon={chevronForwardOutline} className={styles.chevronIcon} />
            </div>

            <div className={styles.settingItem}>
              <IonIcon icon={powerOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Не выключать экран</span>
                <span className={styles.settingSubtext}>Экран всегда активен в приложении</span>
              </div>
              <IonToggle
                checked={keepScreenOn}
                onIonChange={(e) => setKeepScreenOn(e.detail.checked)}
                className={styles.toggle}
              />
            </div>
          </div>
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
          <IonButton
            color="danger"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Выйти из аккаунта
          </IonButton>
        </div>
      </div>
    </div>
  );
};
