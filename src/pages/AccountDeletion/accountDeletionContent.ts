export type AccountLocale = 'ru' | 'en' | 'zh'

export type AccountDeletionCopy = {
  title: string
  back: string
  stepsTitle: string
  steps: string[]
  emailTitle: string
  emailBefore: string
  emailAfter: string
  deletedTitle: string
  deleted: string[]
  keptTitle: string
  kept: string[]
}

const EMAIL = 'paitza.group@gmail.com'

export const ACCOUNT_DELETION_EMAIL = EMAIL

const COPY: Record<AccountLocale, AccountDeletionCopy> = {
  ru: {
    title: 'Удаление аккаунта PAITZA',
    back: 'На главную',
    stepsTitle: 'Как запросить удаление',
    steps: [
      'Откройте приложение PAITZA или сайт paitza.com и войдите в аккаунт.',
      'Откройте раздел «Настройки».',
      'Нажмите «Удалить аккаунт» и подтвердите удаление.',
    ],
    emailTitle: 'Без входа в аккаунт',
    emailBefore: 'Напишите на ',
    emailAfter: '. Укажите номер телефона аккаунта и попросите удалить его.',
    deletedTitle: 'Что удаляется сразу',
    deleted: [
      'Телефон, пароль, имя, почта и фото.',
      'Паспорт, дата и место рождения.',
      'Push-токен.',
      'Имя и телефон водителя в карточках транспорта.',
    ],
    keptTitle: 'Что сохраняется и как долго',
    kept: [
      'Карточка компании, банк и налоговый номер, договоры, счета, платежи и сведения о завершённых рейсах хранятся 5 лет после последней операции по этому документу.',
      'Если есть претензия, эти сведения хранятся до её закрытия.',
      'После этого срока сведения удаляются или обезличиваются.',
      'Пока рейс не завершён или на счёте есть деньги, запрос не выполняется. Данные остаются до вывода денег и завершения рейса.',
    ],
  },
  en: {
    title: 'Delete your PAITZA account',
    back: 'Back to home',
    stepsTitle: 'How to request deletion',
    steps: [
      'Open the PAITZA app or paitza.com and sign in.',
      'Open Settings.',
      'Tap Delete account and confirm.',
    ],
    emailTitle: 'Without signing in',
    emailBefore: 'Email ',
    emailAfter: '. Include the account phone number and ask to delete the account.',
    deletedTitle: 'Deleted immediately',
    deleted: [
      'Phone, password, name, email, and photo.',
      'Passport, date of birth, and place of birth.',
      'Push token.',
      'Driver name and phone on vehicle cards.',
    ],
    keptTitle: 'What is kept, and for how long',
    kept: [
      'The company card, bank details, tax number, contracts, invoices, payments, and records of completed trips are kept for 5 years after the last operation on that document.',
      'If there is a claim, these records are kept until the claim is closed.',
      'After that period the records are deleted or anonymized.',
      'While a trip is still open or the account balance is not zero, the request is not completed. The data stays until the money is withdrawn and the trip is finished.',
    ],
  },
  zh: {
    title: '删除 PAITZA 账户',
    back: '返回首页',
    stepsTitle: '如何申请删除',
    steps: [
      '打开 PAITZA 应用或网站 paitza.com 并登录。',
      '打开「设置」。',
      '点击「删除账户」并确认。',
    ],
    emailTitle: '不登录也可以申请',
    emailBefore: '发送邮件至 ',
    emailAfter: '。请写明账户电话号码，并请求删除账户。',
    deletedTitle: '立即删除的数据',
    deleted: [
      '电话、密码、姓名、邮箱和照片。',
      '护照、出生日期和出生地。',
      '推送令牌。',
      '车辆资料中的司机姓名和电话。',
    ],
    keptTitle: '保留的数据及期限',
    kept: [
      '公司资料、银行信息、税号、合同、账单、付款以及已完成运单的记录，自该文件最后一次业务起保留 5 年。',
      '如有索赔，这些记录保留至索赔结束。',
      '期限届满后，这些记录会被删除或去标识化。',
      '运单尚未完成或账户仍有余额时，申请不会执行。数据会保留到资金提现且运单完成。',
    ],
  },
}

export function accountDeletionLocale(language: string | undefined): AccountLocale {
  const code = (language || 'ru').slice(0, 2)
  if (code === 'en' || code === 'zh') return code
  return 'ru'
}

export function accountDeletionCopy(language: string | undefined): AccountDeletionCopy {
  return COPY[accountDeletionLocale(language)]
}
