import React from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, saveOutline } from 'ionicons/icons';
import styles from './WizardHeader.module.css';

interface WizardHeaderProps {
  title:          string;
  pages:          string;
  onBack:         () => void;
  onForward:      () => void;
  onSave:         () => void;
  isLastStep?:    boolean;
  canGoBack?:     boolean;
  canGoForward?:  boolean;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  title,
  pages,
  onBack,
  onForward,
  onSave,
  isLastStep = false,
  canGoBack = true,
  canGoForward = true
}) => {
  return (
    <div className={styles.stepHeader}>
      <button 
        className={`${styles.navButton} ${styles.navButtonLeft}`} 
        onClick={onBack}
        disabled={!canGoBack}
      >
        <IonIcon icon={chevronBackOutline} />
      </button>

      <div>
        <div><h3 className={styles.stepTitle}>{title}</h3></div>
        <div><h3 className={styles.pageTitle}>{pages}</h3></div>
      </div>
      
      
      {isLastStep ? (
        <button 
          className={`${styles.navButton} ${styles.navButtonRight}`} 
          onClick={onSave}
        >
          <IonIcon icon={saveOutline} />
        </button>
      ) : (
        <button 
          className={`${styles.navButton} ${styles.navButtonRight}`} 
          onClick={onForward}
          disabled={!canGoForward}
        >
          <IonIcon icon={chevronForwardOutline} />
        </button>
      )}
    </div>
  );
};
