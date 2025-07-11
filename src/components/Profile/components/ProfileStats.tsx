import React from 'react'
import { UserRatings } from '../types'
import { STAT_LABELS } from '../constants'

interface Props {
  ratings: UserRatings
  isDriver: boolean
}

const StatBlock: React.FC<{value: number, label: string}> = ({ value, label }) => (
  <div className="bg-3 pb-05 pt-05 pl-05 pr-05">
    <div className="a-center"><b>{value}</b></div>
    <div className="fs-07 a-center mt-05">{label}</div>
  </div>
)

export const ProfileStats: React.FC<Props> = React.memo(({ ratings, isDriver }) => (
  <div className="flex mt-1 fl-space ml-1 mr-1">
    <StatBlock value={ratings.orders} label={STAT_LABELS.ORDERS} />
    <StatBlock value={ratings.rate} label={STAT_LABELS.RATING} />
    <StatBlock 
      value={isDriver ? ratings.invoices : ratings.payd} 
      label={isDriver ? STAT_LABELS.INVOICES : STAT_LABELS.PAID} 
    />
  </div>
))