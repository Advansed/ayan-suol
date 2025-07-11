export interface User {
  id: string
  name: string
  email: string
  phone?: string
  image?: {
    dataUrl: string
    format: string
  }
  token: string
  ratings: UserRatings
  isDriver: boolean
}

export interface UserRatings {
  orders: number
  rate: number
  invoices: number
  payd: number
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