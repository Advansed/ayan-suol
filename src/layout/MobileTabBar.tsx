import React from 'react';
import { NavLink } from 'react-router-dom';
import { MOBILE_TABS, filterNavByRole, isNavActive } from './navConfig';
import styles from './MobileTabBar.module.css';

type MobileTabBarProps = {
  userType: number;
  pathname: string;
};

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ userType, pathname }) => {
  const tabs = filterNavByRole(MOBILE_TABS, userType).map((tab) => {
    if (tab.id === 'orders') {
      return { ...tab, label: 'Лента', path: '/feed' };
    }
    return tab;
  });

  return (
    <nav className={styles.bar} aria-label="Мобильная навигация">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isNavActive(pathname, tab.path);
        return (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={`${styles.tab} ${active ? styles.active : ''}`}
          >
            <Icon size={22} strokeWidth={1.75} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
