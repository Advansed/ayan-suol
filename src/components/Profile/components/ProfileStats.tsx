import React from 'react'
import { UserRatings } from '../types'
import { STAT_LABELS } from '../constants'
import './ProfileStats.css'
interface Props {
  ratings: UserRatings
  userType: number
}

const StatBlock: React.FC<{value: number, label: string, index: number}> = ({ value, label, index }) => (
  <div className={`cr-status-${index + 1} profile-stat-enhanced`}>
    <div className="a-center fs-13"><b>{value}</b></div>
    <div className="fs-09 a-center mt-05">{label}</div>
  </div>
)

export const ProfileStats: React.FC<Props> = React.memo(({ ratings, userType }) => (
  <div className="flex mt-1 fl-space ml-1 mr-1">
    <StatBlock 
        value={ratings.orders} 
        label={STAT_LABELS.ORDERS} 
        index={0} 
    />
    <StatBlock 
        value={ratings.rate} 
        label={STAT_LABELS.RATING} 
        index={1} 
    />
    <StatBlock 
      value={userType == 2 ? ratings.invoices : ratings.payd} 
      label={userType === 2 ? STAT_LABELS.INVOICES : STAT_LABELS.PAID} 
      index={2}
    />
  </div>
))