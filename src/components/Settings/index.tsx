import React, { useEffect, useState } from 'react';
import { SettingsPage } from './components/SettingsPage';
import { Cabinet } from './Cabinet';
import { OrganizationEditPage } from './components/OrganizationEditPage';
import { TransportEditPage } from './components/TransportEditPage';
import { WalletPage } from './components/WalletPage';
import { useProfile } from './useProfile';
import { useParams } from 'react-router-dom';

export type SettingsPageType = 'menu' | 'cabinet' | 'organization' | 'transport' | 'wallet';

/**
 * Основной компонент Settings — точка входа.
 * Меню настроек, персональные данные, организация и транспорт (водитель).
 */

export const Settings: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<SettingsPageType>('menu');
  const { user_type, setUser } = useProfile();
  const params = useParams<{ name?: string }>();
  const routeName = params.name;

  useEffect(() => {
    // Поддержка навигации вида `/tab3/account` (см. InsurancePage).
    if (routeName === 'account') setCurrentPage('wallet');
  }, [routeName]);

  const handleDriverClick = () => {
    setUser({ user_type: user_type === 1 ? 2 : 1 });
  };

  return (
    <>
      {currentPage === 'menu' && (
        <SettingsPage
          onToggleClick={handleDriverClick}
          onProfileClick={() => setCurrentPage('cabinet')}
          onOrganizationClick={() => setCurrentPage('organization')}
          onTransportClick={() => setCurrentPage('transport')}
          onWalletClick={() => setCurrentPage('wallet')}
          onBack={undefined}
        />
      )}
      {currentPage === 'cabinet' && <Cabinet onBack={() => setCurrentPage('menu')} />}
      {currentPage === 'organization' && (
        <OrganizationEditPage onBack={() => setCurrentPage('menu')} />
      )}
      {currentPage === 'transport' && (
        <TransportEditPage onBack={() => setCurrentPage('menu')} />
      )}
      {currentPage === 'wallet' && <WalletPage onBack={() => setCurrentPage('menu')} />}
    </>
  );
};

// Реэкспорт для импорта из '../components/Settings'
export { Cabinet } from './Cabinet';
export { SettingsPage } from './components/SettingsPage';
