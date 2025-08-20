import React from 'react'
import { useAgreements } from './useAgreements'
import styles from './Agreements.module.css'

interface Props {
  userToken?: string
}

export const UI_TEXT = {
  AGREEMENTS_TITLE: 'Согласия',
  PERSONAL_DATA_AGREEMENT: 'Согласие на обработку персональных данных',
  USER_AGREEMENT: 'Пользовательское соглашение', 
  MARKETING_AGREEMENT: 'Согласие на рекламные рассылки'
} as const

export const Agreements: React.FC<Props> = ({ userToken }) => {
  const { agreements, toggleAgreement, isLoading, error } = useAgreements(userToken)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {UI_TEXT.AGREEMENTS_TITLE}
      </div>
      
      <div className={styles.content}>
        {error && (
          <div className={styles.error}>{error}</div>
        )}
        
        <div 
          className={`${styles.agreementItem} ${isLoading ? styles.disabled : ''}`}
          onClick={() => !isLoading && toggleAgreement('personalData')}
        >
          <div className={`${styles.checkbox} ${agreements.personalData ? styles.checked : styles.unchecked}`}>
            <div className={styles.checkIcon}>✓</div>
          </div>
          <div className={styles.agreementText}>
            {UI_TEXT.PERSONAL_DATA_AGREEMENT}
          </div>
        </div>
        
        <div 
          className={`${styles.agreementItem} ${isLoading ? styles.disabled : ''}`}
          onClick={() => !isLoading && toggleAgreement('userAgreement')}
        >
          <div className={`${styles.checkbox} ${agreements.userAgreement ? styles.checked : styles.unchecked}`}>
            <div className={styles.checkIcon}>✓</div>
          </div>
          <div className={styles.agreementText}>
            {UI_TEXT.USER_AGREEMENT}
          </div>
        </div>
        
        <div 
          className={`${styles.agreementItem} ${isLoading ? styles.disabled : ''}`}
          onClick={() => !isLoading && toggleAgreement('marketing')}
        >
          <div className={`${styles.checkbox} ${agreements.marketing ? styles.checked : styles.unchecked}`}>
            <div className={styles.checkIcon}>✓</div>
          </div>
          <div className={styles.agreementText}>
            {UI_TEXT.MARKETING_AGREEMENT}
          </div>
        </div>
      </div>
    </div>
  )
}