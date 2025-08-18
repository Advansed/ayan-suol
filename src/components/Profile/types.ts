export interface User {
  guid:           string          // было id
  name:           string
  email:          string
  phone?:         string
  image?:         string        // упростить, в данных просто string
  token:          string
  user_type:      number       // было isDriver
  ratings: {
    orders:       number
    invoices:     number
    rate:         number
    payd:         number        // убрать invoices
  }
  description?:   string  // добавить
  notifications?: {     // добавить
    email: boolean
    sms: boolean
    orders: boolean
    market: boolean
  }
}

export interface UserRatings {
  orders:     number
  rate:       number
  invoices:   number
  payd:       number
}

export interface Company {
  id: string
  name: string
  inn?: string
  phone?: string
  address?: string
  description?: string
}

export interface Transport {
  id: string
  type: string
  model: string
  number: string
  capacity: number
}

export interface ProfileMenuItem {
  title: string
  onClick: () => void
  icon?: string
}