import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Bell, Menu, Search, X } from 'lucide-react';
import { RoleToggle } from './RoleToggle';
import styles from './AppHeader.module.css';

type AppHeaderProps = {
  userType: number;
  userName: string;
  userImage?: string;
  onRoleChange: (userType: number) => void;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  userType,
  userName,
  userImage,
  onRoleChange,
  onMenuToggle,
  showMenuButton,
}) => {
  const history = useHistory();
  const [query, setQuery] = useState('');
  const initial = (userName || 'П').trim().charAt(0).toUpperCase() || 'П';

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Chrome only — global search wired later
  };

  return (
    <header className={styles.header}>
      {showMenuButton && (
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onMenuToggle}
          aria-label="Открыть меню"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
      )}

      <form className={styles.search} onSubmit={onSearchSubmit} role="search">
        <Search size={18} className={styles.searchIcon} strokeWidth={1.75} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск заказов, машин, документов..."
          className={styles.searchInput}
          aria-label="Поиск"
        />
        {query && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => setQuery('')}
            aria-label="Очистить"
          >
            <X size={16} />
          </button>
        )}
      </form>

      <div className={styles.actions}>
        <div className={styles.roleWrap}>
          <RoleToggle userType={userType} onChange={onRoleChange} />
        </div>

        <button type="button" className={styles.iconBtn} aria-label="Уведомления">
          <Bell size={20} strokeWidth={1.75} />
          <span className={styles.notifDot} />
        </button>

        <button
          type="button"
          className={styles.avatar}
          onClick={() => history.push('/profile')}
          aria-label="Профиль"
          title={userName || 'Профиль'}
        >
          {userImage ? (
            <img src={userImage} alt="" />
          ) : (
            <span>{initial}</span>
          )}
        </button>
      </div>
    </header>
  );
};
