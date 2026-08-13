import React, { useState } from 'react';
import { IonIcon, IonToggle, IonButton } from '@ionic/react';
import {
  personOutline,
  carOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  notificationsOutline,
  volumeHighOutline,
  phonePortrait,
  lockClosedOutline,
  linkOutline,
  logOutOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { useLogin } from '../../../Store/useLogin';
import { useProfile } from '../../Profile/useProfile';
import { useHistory } from 'react-router-dom';
import styles from '../Settings.module.css';
import { SettingsAgreementsSection } from './SettingsAgreementsSection';

export interface SettingsPageProps {
  onToggleClick?: () => void;
  onBack?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onToggleClick,
}) => {
  const { logout } = useLogin();
  const { user_type } = useProfile();
  const history = useHistory();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  const handleToggle = () => {
    if (onToggleClick) {
      onToggleClick();
    }
  };

  return (
    <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} aria-hidden>
              <IonIcon icon={personOutline} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Режим работы</h3>
              <p className={styles.cardSub}>Заказчик или водитель</p>
            </div>
          </div>

          <div className={styles.verifiedBadge}>
            <IonIcon icon={checkmarkCircleOutline} />
            Аккаунт подтверждён
          </div>

          <div className={styles.roleSwitcher} role="radiogroup" aria-label="Режим работы">
            <button
              type="button"
              role="radio"
              aria-checked={user_type === 1}
              className={`${styles.roleItem} ${user_type === 1 ? styles.roleActive : ''}`}
              onClick={() => {
                if (user_type !== 1) handleToggle();
              }}
            >
              <IonIcon icon={personOutline} className={styles.roleIcon} />
              <span className={styles.roleText}>Заказчик</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={user_type === 2}
              className={`${styles.roleItem} ${user_type === 2 ? styles.roleActive : ''}`}
              onClick={() => {
                if (user_type !== 2) handleToggle();
              }}
            >
              <IonIcon icon={carOutline} className={styles.roleIcon} />
              <span className={styles.roleText}>Водитель</span>
            </button>
          </div>
          <p className={styles.instructionText}>
            {user_type === 1
              ? 'Создаёте заказы и выбираете водителей.'
              : 'Смотрите заказы и принимаете предложения.'}
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} aria-hidden>
              <IonIcon icon={notificationsOutline} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Уведомления</h3>
              <p className={styles.cardSub}>Push, звук и вибрация</p>
            </div>
          </div>

          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <IonIcon icon={notificationsOutline} className={styles.settingIcon} />
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>Push</span>
                <span className={styles.settingSubtext}>В приложении</span>
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
              </div>
              <IonToggle
                checked={vibration}
                onIonChange={(e) => setVibration(e.detail.checked)}
                className={styles.toggle}
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} aria-hidden>
              <IonIcon icon={lockClosedOutline} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Безопасность</h3>
              <p className={styles.cardSub}>Пароль и устройства</p>
            </div>
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
        </section>

        <section className={`${styles.section} ${styles.spanFull}`}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} aria-hidden>
              <IonIcon icon={documentTextOutline} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Согласия</h3>
              <p className={styles.cardSub}>Документы и рекламные рассылки</p>
            </div>
          </div>
          <SettingsAgreementsSection />
        </section>

        <div className={styles.logoutSection}>
          <IonButton color="danger" className={styles.logoutButton} onClick={handleLogout}>
            <IonIcon icon={logOutOutline} slot="start" />
            Выйти из аккаунта
          </IonButton>
        </div>
    </div>
  );
};
