import React, { useState } from 'react'
import { useAgreements } from './useAgreements'
import styles from './Agreements.module.css'
import EULA from './eula'
import CargoAgree from './CargoAgree'
import { EscrowAgreement } from './Escrow'
import Signs from './Signs'

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
  const [isEulaOpen, setIsEulaOpen] = useState(false)
  const [isCargoOpen, setIsCargoOpen] = useState(false)
  const [isEscrowOpen, setIsEscrowOpen] = useState(false)
  const [isSignOpen, setIsSignOpen] = useState(false)

  const handleUserAgreementClick = () => {
    setIsEulaOpen(true)
  }

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
        >
          <div className={`${styles.checkbox} ${agreements.userAgreement ? styles.checked : styles.unchecked}`}
              onClick={handleUserAgreementClick}
          >
            <div className={styles.checkIcon}>✓</div>
          </div>
          <div className={styles.agreementText}>
            <div onClick={handleUserAgreementClick}>
              <b className='cl-blue t-underline'>{UI_TEXT.USER_AGREEMENT}</b>
            </div>
            <div className='ml-2 mt-1' onClick={()=>{ setIsCargoOpen(true) }}>
              <b className='cl-blue t-underline'>{ "- Договор перевозки груза" }</b>
            </div>
            <div className='ml-2 mt-1' onClick={()=>{ setIsEscrowOpen(true) }}>
              <b className='cl-blue t-underline'>{ "- Договор эскроу" }</b>
            </div>
            <div className='ml-2 mt-1' onClick={()=>{ setIsSignOpen(true) }}>
              <b className='cl-blue t-underline'>{ "- Об использовании ПЭП" }</b>
            </div>
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

      {isEulaOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEulaOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsEulaOpen(false)}>
              ×
            </button>
            <EULA />
          </div>
        </div>
      )}
      {isCargoOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCargoOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsCargoOpen(false)}>
              ×
            </button>
            <CargoAgree />
          </div>
        </div>
      )}
      {isEscrowOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEscrowOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsEscrowOpen(false)}>
              ×
            </button>
            <EscrowAgreement />
          </div>
        </div>
      )}
      {isSignOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsSignOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsSignOpen(false)}>
              ×
            </button>
            <Signs />
          </div>
        </div>
      )}
    </div>
  )
}