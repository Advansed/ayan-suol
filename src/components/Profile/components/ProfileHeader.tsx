import React from 'react'
import { IonIcon } from '@ionic/react'
import { personOutline } from 'ionicons/icons'
import { User } from '../types'
import { UI_TEXT } from '../constants'
import './ProfileHeader.css'

interface Props {
  user: User
  userType: number
}

export const ProfileHeader: React.FC<Props> = React.memo(({ user, userType }) => (
  <div className="profile-header-minimal">
    <div className="flex fl-space">
      <div className="flex">
        <div className="avatar-minimal">
          <IonIcon icon={personOutline} />
        </div>
        <div className="ml-1">
          <div className="name-minimal">{user.name}</div>
          <div className="role-minimal">
            {userType === 2 ? UI_TEXT.DRIVER : userType === 1 ? UI_TEXT.CUSTOMER : "Партнер"}
          </div>
        </div>
      </div>
      <div className="status-dot"></div>
    </div>
  </div>
))
