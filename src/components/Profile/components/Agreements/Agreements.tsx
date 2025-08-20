import React from 'react'
import { useAgreements } from './useAgreements'

interface Props {
  userToken?: string
}

export const UI_TEXT = {
  MY_PROFILE: 'Мой профиль',
  DRIVER: 'Водитель',
  CUSTOMER: 'Заказчик',
  LOADING: 'Загрузка...',
  IN_DEVELOPMENT: 'Страница в разработке',
  
  // Добавить эти константы:
  AGREEMENTS_TITLE: 'Согласия',
  PERSONAL_DATA_AGREEMENT: 'Согласие на обработку персональных данных',
  USER_AGREEMENT: 'Пользовательское соглашение',
  MARKETING_AGREEMENT: 'Согласие на рекламные рассылки'
} as const

export const Agreements: React.FC<Props> = ({ userToken }) => {
  const { agreements, toggleAgreement, isLoading, error } = useAgreements(userToken)

  return (
    <div className="borders ml-1 mr-1 mt-1 p-1">
      <div className="fs-12 mb-1"><b>{UI_TEXT.AGREEMENTS_TITLE}</b></div>
      
      {error && (
        <div className="fs-08 text-red mb-05">{error}</div>
      )}
      
      <div className="flex fl-start mb-05">
        <input 
          type="checkbox"
          checked={agreements.personalData}
          onChange={() => toggleAgreement('personalData')}
          disabled={isLoading}
          className="mr-05"
        />
        <span className="fs-08">{UI_TEXT.PERSONAL_DATA_AGREEMENT}</span>
      </div>
      
      <div className="flex fl-start mb-05">
        <input 
          type="checkbox"
          checked={agreements.userAgreement}
          onChange={() => toggleAgreement('userAgreement')}
          disabled={isLoading}
          className="mr-05"
        />
        <span className="fs-08">{UI_TEXT.USER_AGREEMENT}</span>
      </div>
      
      <div className="flex fl-start">
        <input 
          type="checkbox"
          checked={agreements.marketing}
          onChange={() => toggleAgreement('marketing')}
          disabled={isLoading}
          className="mr-05"
        />
        <span className="fs-08">{UI_TEXT.MARKETING_AGREEMENT}</span>
      </div>
    </div>
  )
}