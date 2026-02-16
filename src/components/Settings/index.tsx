import React, { useState } from 'react';
import { SettingsPage } from './components/SettingsPage';
import { Cabinet } from './Cabinet';
import { useProfile } from './useProfile';

export type SettingsPageType = 'menu' | 'cabinet';

/**
 * Основной компонент Settings — точка входа.
 * Страница 1: Настройки (меню).
 * Страница 2: Личный кабинет заказчика или водителя.
 */

export const Settings: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<SettingsPageType>('menu');
  const { user_type, setUser } = useProfile()

  const handleDriverClick = () => {
    console.log( 'handleDriverClick', user_type )
    setUser({ user_type: user_type === 1 ? 2 : 1 }) 
  }
  
  return (
    <>
      {currentPage === 'menu' && (
        <SettingsPage
          onToggleClick = { () => handleDriverClick() }
          onProfileClick = { () => setCurrentPage('cabinet') }
          onBack        = { undefined }
        />
      )}
      {currentPage === 'cabinet' && (
        <Cabinet onBack={() => setCurrentPage('menu')} />
      )}
    </>
  );
};

// Реэкспорт для импорта из '../components/Settings'
export { Cabinet } from './Cabinet';
export { SettingsPage } from './components/SettingsPage';
