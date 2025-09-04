// src/Store/types/auth.ts

export interface UserRatings {
  orders: number
  rate: number
  payd: number
}

export interface UserNotifications {
  personalData: boolean
  userAgreement: boolean
  marketing: boolean
  market: boolean
}

export interface AuthResponse {
  guid: string
  token: string
  phone: string
  name: string
  email: string
  image: string
  user_type: number
  description: string
  account: number
  ratings: UserRatings
  notifications: UserNotifications
}

export interface UserData {
  id: string | null
  name: string | null
  phone: string | null
  email: string | null
  image: string | null
  token: string | null
  user_type: number | null
  description: string | null
  account: number | null
  ratings: UserRatings | null
  notifications: UserNotifications | null
}

export interface UpdateUserData {
  name?: string
  email?: string
  description?: string
  password?: string
  image?: string
  user_type?: string
}