import React, { useState } from 'react'
import styles from './Agreements.module.css'
import EULA from './eula'
import CargoAgree from './CargoAgree'
import { EscrowAgreement } from './Escrow'
import Signs from './Signs'
import Oferta from './Oferta'
import { useAgreements } from './useAgreements'

export const UI_TEXT = {
  AGREEMENTS_TITLE: 'Согласия',
  PERSONAL_DATA_AGREEMENT: 'Согласие на обработку персональных данных',
  USER_AGREEMENT: 'Пользовательское соглашение', 
  MARKETING_AGREEMENT: 'Согласие на рекламные рассылки'
} as const

export const Agreements: React.FC = () => {
  const { agreements, toggleAgreement, isLoading } = useAgreements()
  const [isEulaOpen, setIsEulaOpen] = useState(false)
  const [isCargoOpen, setIsCargoOpen] = useState(false)
  const [isEscrowOpen, setIsEscrowOpen] = useState(false)
  const [isSignOpen, setIsSignOpen] = useState(false)
  const [isOferta, setIsOferta] = useState(false)

  const handleUserAgreementClick = () => {
    setIsEulaOpen(true)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {UI_TEXT.AGREEMENTS_TITLE}
      </div>
      
      <div className={styles.content}>
        
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
            <div className='ml-2 mt-1' onClick={()=>{ setIsOferta(true) }}>
              <b className='cl-blue t-underline'>{ "- Лицензионное соглашение" }</b>
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

      <EULA             isOpen = { isEulaOpen }   onClose = { () => setIsEulaOpen(false) } />
      <CargoAgree       isOpen = { isCargoOpen }  onClose = { () => setIsCargoOpen(false) } />
      <EscrowAgreement  isOpen = { isEscrowOpen } onClose = { () => setIsEscrowOpen(false) } />
      <Signs            isOpen = { isSignOpen }   onClose = { () => setIsSignOpen(false) } />
      <Oferta           isOpen = { isOferta }     onClose = { () => setIsOferta(false) } />
        
    </div>
  )
}