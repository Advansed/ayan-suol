import type { LucideIcon } from 'lucide-react';
import {
  Home,
  ListOrdered,
  Package,
  Wallet,
  MessageCircle,
  Truck,
  LifeBuoy,
  FileText,
  Settings,
  User,
  BadgeCheck,
  Handshake,
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  /** 1 = заказчик, 2 = исполнитель; undefined = оба */
  roles?: number[];
  footer?: boolean;
  alert?: boolean;
  stub?: boolean;
};

export const MAIN_NAV: NavItem[] = [
  { id: 'home', label: 'Главная', path: '/', icon: Home },
  { id: 'feed', label: 'Лента заказов', path: '/feed', icon: ListOrdered },
  { id: 'orders', label: 'Мои заказы', path: '/orders', icon: Package },
  { id: 'finance', label: 'Финансы', path: '/finance', icon: Wallet },
  { id: 'chats', label: 'Чат', path: '/chats', icon: MessageCircle },
  { id: 'vehicles', label: 'Мои машины', path: '/vehicles', icon: Truck, roles: [2] },
  { id: 'support', label: 'Поддержка', path: '/support', icon: LifeBuoy, stub: true },
  { id: 'documents', label: 'Документы', path: '/documents', icon: FileText, stub: true },
  { id: 'settings', label: 'Настройки', path: '/settings', icon: Settings },
  { id: 'profile', label: 'Профиль', path: '/profile', icon: User },
];

export const FOOTER_NAV: NavItem[] = [
  { id: 'verification', label: 'Верификация', path: '/verification', icon: BadgeCheck, footer: true, alert: true, stub: true },
  { id: 'partners', label: 'Партнёрам', path: '/partners', icon: Handshake, footer: true, stub: true },
];

export const MOBILE_TABS: NavItem[] = [
  { id: 'home', label: 'Главная', path: '/', icon: Home },
  { id: 'orders', label: 'Заказы', path: '/orders', icon: Package },
  { id: 'chats', label: 'Чат', path: '/chats', icon: MessageCircle },
  { id: 'profile', label: 'Профиль', path: '/profile', icon: User },
];

export function filterNavByRole(items: NavItem[], userType: number): NavItem[] {
  return items.filter((item) => !item.roles || item.roles.includes(userType));
}

export function isNavActive(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/' || pathname === '';
  return pathname === path || pathname.startsWith(`${path}/`);
}
