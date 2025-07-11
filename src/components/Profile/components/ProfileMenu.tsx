import React from 'react'
import { IonIcon } from '@ionic/react'
import { chevronForwardOutline } from 'ionicons/icons'
import { ProfileMenuItem } from '../types'

interface Props {
  items: ProfileMenuItem[]
}

const MenuItem: React.FC<{item: ProfileMenuItem}> = React.memo(({ item }) => (
  <div 
    className="flex mt-1 ml-1 mr-1 fl-space pb-1 pt-1 t-underline"
    onClick={item.onClick}
  >
    <div className="ml-1">{item.title}</div>
    <IonIcon icon={chevronForwardOutline} />
  </div>
))

export const ProfileMenu: React.FC<Props> = React.memo(({ items }) => (
  <>
    {items.map((item, idx) => (
      <MenuItem key={idx} item={item} />
    ))}
  </>
))
