import React from 'react'
import { IonIcon } from '@ionic/react'
import { 
  chevronForwardOutline, 
  personOutline, 
  cardOutline, 
  businessOutline, 
  carOutline 
} from 'ionicons/icons'
import { ProfileMenuItem } from '../types'
import './ProfileMenu.css'

interface Props {
    items:        ProfileMenuItem[]
    completion:   any
}

const getMenuIcon = (index: number) => {
  const icons = [personOutline, cardOutline, businessOutline, carOutline]
  return icons[index] || personOutline
}

const getCompletionColor = (completion: number) => {
  if (completion >= 70) return 'completion-high'
  if (completion >= 30) return 'completion-medium'
  return 'completion-low'
}

const getProgressColor = (completion: number) => {
  if (completion >= 70) return 'progress-high'
  if (completion >= 30) return 'progress-medium'
  return 'progress-low'
}

const MenuItem: React.FC<{item: ProfileMenuItem, index: number}> = React.memo(({ item, index }) => {
  const completion = parseInt(item.completion?.replace('%', '') || '0')
  
  return (
    <div 
      className="menu-card"
      onClick={item.onClick}
    > 
      <div className='flex fl-space w-100'>
        <div className="flex">
          <div className="menu-icon">
            <IonIcon icon={getMenuIcon(index)} />
          </div>
          
          <div className="menu-content">
            <div className="menu-title">{item.title}</div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${getProgressColor(completion)}`}
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex">
          <div className={`completion-badge ${getCompletionColor(completion)}`}>
            {item.completion}
          </div>
          <IonIcon icon={chevronForwardOutline} />
        </div>
      </div>
    </div>
  )
})

export const ProfileMenu: React.FC<Props> = React.memo(({ items }) => (
  <div className="profile-menu">
    {items.map((item, idx) => (
      <MenuItem key={idx} item={item} index={idx} />
    ))}
  </div>
))

// CSS стили для добавления в файл стилей
/*

*/