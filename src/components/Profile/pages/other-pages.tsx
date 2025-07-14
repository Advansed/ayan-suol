import React from 'react'
import { IonIcon } from '@ionic/react'
import { arrowBackOutline } from 'ionicons/icons'
import { UI_TEXT, MENU_ITEMS } from '../constants'

interface PageProps {
  onBack: () => void
}

const PageWrapper: React.FC<{title: string, onBack: () => void}> = ({ title, onBack }) => (
  <div>
    <IonIcon 
      icon={arrowBackOutline} 
      className="ml-1 mt-1 w-15 h-15" 
      onClick={onBack}
    />
    <div className="mt-1 ml-1 mr-1 fs-09">
      <div className="fs-12"><b>{title}</b></div>
      <div className="mt-1 c-grey">{UI_TEXT.IN_DEVELOPMENT}</div>
    </div>
  </div>
)

// Security.tsx
export const Security: React.FC<PageProps> = ({ onBack }) => 
  <PageWrapper title={MENU_ITEMS.SECURITY} onBack={onBack} />

// Notifications.tsx  
export const Notifications: React.FC<PageProps> = ({ onBack }) =>
  <PageWrapper title={MENU_ITEMS.NOTIFICATIONS} onBack={onBack} />

// Company.tsx
export const Company: React.FC<PageProps> = ({ onBack }) =>
  <PageWrapper title={MENU_ITEMS.COMPANY} onBack={onBack} />

// Transport теперь импортируется отдельно
export { Transport } from './Transport'