import React from 'react'
import { IonIcon } from '@ionic/react'
import { arrowBackOutline } from 'ionicons/icons'

interface PageProps {
  onBack: () => void
}

export const Security: React.FC<PageProps> = ({ onBack }) => (
  <div style={{ padding: '1rem' }}>
    <IonIcon 
      icon={arrowBackOutline} 
      style={{ width: '24px', height: '24px', cursor: 'pointer' }}
      onClick={onBack}
    />
    <h2 style={{ textAlign: 'center' }}>Безопасность</h2>
    <p style={{ textAlign: 'center', color: '#666' }}>В разработке</p>
  </div>
)

export const Notifications: React.FC<PageProps> = ({ onBack }) => (
  <div style={{ padding: '1rem' }}>
    <IonIcon 
      icon={arrowBackOutline} 
      style={{ width: '24px', height: '24px', cursor: 'pointer' }}
      onClick={onBack}
    />
    <h2 style={{ textAlign: 'center' }}>Уведомления</h2>
    <p style={{ textAlign: 'center', color: '#666' }}>В разработке</p>
  </div>
)