import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { SettingsPage } from './components/SettingsPage';
import { useProfile } from './useProfile';

/**
 * Настройки: режим, уведомления, согласия, безопасность.
 * Профиль и организация — /profile.
 * Транспорт — /vehicles.
 * Кошелёк — /finance.
 */

export const Settings: React.FC = () => {
  const { user_type, setUser } = useProfile();
  const history = useHistory();
  const params = useParams<{ name?: string }>();
  const routeName = params.name;

  useEffect(() => {
    // Старый путь `/…/account` → отдельный раздел финансов
    if (routeName === 'account') {
      history.replace('/finance');
    }
  }, [routeName, history]);

  const handleDriverClick = () => {
    setUser({ user_type: user_type === 1 ? 2 : 1 });
  };

  return (
    <SettingsPage onToggleClick={handleDriverClick} onBack={undefined} />
  );
};

export { Cabinet } from './Cabinet';
export { SettingsPage } from './components/SettingsPage';
