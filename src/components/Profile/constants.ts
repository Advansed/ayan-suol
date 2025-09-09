export const PROFILE_PAGES = {
  MAIN:                   0,
  PERSONAL:               1,
  PASSPORT:               2,
  TRANSPORT:              3,
  SECURITY:               4,
  NOTIFICATIONS:          5,
  COMPANY:                6,
  ACCOUNT:                7
} as const

export const ROLE_TYPES = {
  DRIVER:                 'driver',
  CUSTOMER:               'customer'
} as const

export const MENU_ITEMS = {
  BUY_REQUESTS:           'Купить заявки',
  PERSONAL_DATA:          'Личные данные',
  PASSPORT:               'Паспорт',
  SECURITY:               'Безопасность',
  NOTIFICATIONS:          'Уведомления',
  TRANSPORT:              'Транспорт',
  COMPANY:                'Компания'
} as const

export const UI_TEXT = {
  MY_PROFILE:             'Мой профиль',
  DRIVER:                 'Водитель',
  CUSTOMER:               'Заказчик',
  LOADING:                'Загрузка...',
  IN_DEVELOPMENT:         'Страница в разработке'
} as const

export const STAT_LABELS = {
  ORDERS:                 'Выполнено заказов',
  RATING:                 'Рейтинг',
  INVOICES:               'Заявки',
  PAID:                   'Оплачено'
} as const

export const FIELD_LABELS = {
  TITLE:                  'Личная информация',
  NAME:                   'Имя, Фамилия',
  EMAIL:                  'Email',
  PHONE:                  'Телефон',
  SAVE:                   'Сохранить',
  SAVING:                 'Сохранение...',
  CANCEL:                 'Отменить'
} as const

export const ERROR_MESSAGES = {
  NO_CONNECTION:          'Нет подключения',
  SAVE_ERROR:             'Ошибка сохранения',
  UPLOAD_ERROR:           'Ошибка загрузки'
} as const

export const IMAGE_CONFIG = {
  MAX_WIDTH:              200,
  MAX_HEIGHT:             200,
  QUALITY:                0.9,
  FORMAT:                 'image/jpeg'
} as const

export const SAVE_DEBOUNCE_MS = 500

export type ProfilePageType = typeof PROFILE_PAGES[keyof typeof PROFILE_PAGES]
export type RoleType = typeof ROLE_TYPES[keyof typeof ROLE_TYPES]