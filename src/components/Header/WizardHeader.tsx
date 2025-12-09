import React from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, closeOutline, refreshOutline, saveOutline } from 'ionicons/icons';
import styles from './WizardHeader.module.css';

interface WizardHeaderProps {
  title:            string;
  pages?:           string;
  onBack?:          () => void;
  onClose?:         () => void;
  onRefresh?:       () => void;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  title,
  pages     = "",
  onBack,
  onClose,
  onRefresh   
}) => {

  return (
    <div className={styles.stepHeader}>
        <button 
            className = { `${styles.navButton} ${styles.navButtonLeft}` } 
            onClick   = { () => { if(onBack) onBack() } }
        >
            { onBack !== undefined && ( <IonIcon icon={chevronBackOutline} />)}
        </button>

        <div className=''>
            <div><h3 className={styles.stepTitle}>{title}</h3></div>
            <div><h3 className={styles.pageTitle}>{pages}</h3></div>
        </div>

        <button 
            className={`${styles.navButton} ${styles.navButtonRight}`} 
            onClick={ () => { if(onClose) onClose();if(onRefresh) onRefresh(); } }
            disabled={ false }
        >
            { onClose !== undefined && (<IonIcon icon={ closeOutline } />)  }
            { onRefresh !== undefined && (<IonIcon icon={ refreshOutline } />)  }
        </button>
    </div>
  );
};
