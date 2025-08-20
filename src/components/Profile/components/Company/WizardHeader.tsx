import React from 'react'
import { IonIcon } from '@ionic/react'
import { chevronBackCircle, chevronBackOutline, chevronForwardOutline, saveOutline } from 'ionicons/icons'
import styles from './WizardHeader.module.css'

interface WizardHeaderProps {
  title: string
  onBack: () => void
  onForward: () => void
  isLastStep?: boolean
  isSaving?: boolean
  disabled?: boolean
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  title,
  onBack,
  onForward,
  isLastStep = false,
  isSaving = false,
  disabled = false
}) => {
  return (
    <div className={styles.stepHeader}>
      <button className={`${styles.navButton} ${styles.navButtonLeft}`} onClick={onBack}>
        <IonIcon icon={chevronBackOutline} />
      </button>
      
      <h3 className={styles.stepTitle}>{ title }</h3>
      
      <button 
        className={`${styles.navButton} ${styles.navButtonRight}`} 
        onClick={onForward}
      >
          <IonIcon icon={chevronForwardOutline} />
      </button>
    </div>  )
}