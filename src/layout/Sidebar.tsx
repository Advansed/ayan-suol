import React from 'react';
import { NavLink } from 'react-router-dom';
import { FOOTER_NAV, MAIN_NAV, filterNavByRole, isNavActive } from './navConfig';
import { useLoginStore } from '../Store/loginStore';
import { resolveImageSrc } from '../utils/fileUpload';
import styles from './Sidebar.module.css';

type SidebarProps = {
  userType: number;
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ userType, pathname, onNavigate, compact }) => {
  const main = filterNavByRole(MAIN_NAV, userType);
  const footer = filterNavByRole(FOOTER_NAV, userType);
  const name = useLoginStore((s) => s.name);
  const image = useLoginStore((s) => s.image);
  const displayName = name?.trim() || 'Пользователь';
  const initial = displayName.charAt(0).toUpperCase() || 'П';
  const roleLabel = userType === 2 ? 'Перевозчик' : 'Заказчик';

  return (
    <aside className={`${styles.sidebar} ${compact ? styles.compact : ''}`}>
      <div className={styles.brand}>
        <div className={styles.logoMark} aria-hidden>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 2L25 8.5V19.5L14 26L3 19.5V8.5L14 2Z"
              fill="currentColor"
            />
            <path d="M14 8L20 11.5V18.5L14 22L8 18.5V11.5L14 8Z" fill="#fff" fillOpacity="0.35" />
          </svg>
        </div>
        <div className={styles.brandText}>
          <div className={styles.brandTitle}>ГРУЗ В РЕЙС</div>
          <div className={styles.brandSubtitle}>ЛОГИСТИЧЕСКАЯ ПЛАТФОРМА</div>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Основное меню">
        {main.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.path);
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
              onClick={onNavigate}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footerNav}>
        {footer.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.path);
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
              onClick={onNavigate}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span>{item.label}</span>
              {item.alert && <span className={styles.alertDot} aria-label="Требует внимания" />}
            </NavLink>
          );
        })}
      </div>

      <NavLink
        to="/profile"
        className={styles.userCard}
        onClick={onNavigate}
      >
        <span className={styles.userAvatar}>
          {image ? (
            <img src={resolveImageSrc(image)} alt="" />
          ) : (
            <span>{initial}</span>
          )}
        </span>
        <span className={styles.userMeta}>
          <span className={styles.userName}>{displayName}</span>
          <span className={styles.userRole}>{roleLabel}</span>
        </span>
      </NavLink>
    </aside>
  );
};
