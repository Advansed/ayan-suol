import React from 'react'
import { IonButton, IonIcon, IonLabel } from '@ionic/react'
import { cashOutline, personOutline } from 'ionicons/icons'
import { User } from '../types'
import { UI_TEXT } from '../constants'
import './ProfileHeader.css'
import { formatters } from '../../utils/utils'

interface Props {
  balance:  number,
  name:     string
  userType: number
  onClick?: () => void  // Добавляем обработчик клика
}

export const ProfileHeader: React.FC<Props> = React.memo(({ balance, name, userType, onClick }) => (
  

  <div className="profile-header-minimal" onClick={onClick}>
    <div className="flex fl-space">
      <div className="flex w-50">
        <div className="avatar-minimal">
          <IonIcon icon={personOutline} />
        </div>
        <div className="ml-05">
          <div className="name-minimal fs-09">{ name}</div>
          <div className="role-minimal fs-08">
            {userType === 2 ? UI_TEXT.DRIVER : userType === 1 ? UI_TEXT.CUSTOMER : "Партнер"}
          </div>
        </div>
      </div>
      <div className = { "topUpBalanceCard w-40" }>
          <div className='fs-08 a-center'>Баланс</div>
          <div className='fs-08 a-center'>{formatters.currency(balance)}</div>  
        </div>        
      </div>
  </div>
))