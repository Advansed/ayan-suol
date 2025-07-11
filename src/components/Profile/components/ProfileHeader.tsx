import React from 'react'
import { IonIcon } from '@ionic/react'
import { personOutline } from 'ionicons/icons'
import { User } from '../types'
import { UI_TEXT } from '../constants'

interface Props {
  user: User
  isDriver: boolean
}

export const ProfileHeader: React.FC<Props> = React.memo(({ user, isDriver }) => (
  <div className="borders ml-1 mr-1 mt-1">
    <div className="flex fl-space fs-08">
      <div className="flex">
        <IonIcon icon={personOutline} className="w-15 h-15"/>
        <div className="ml-1">{user.name}</div>
      </div>
      <span>{user.driver ? UI_TEXT.DRIVER : UI_TEXT.CUSTOMER}</span>
    </div>
  </div>
))