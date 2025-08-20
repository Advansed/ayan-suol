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

// Новый расширенный интерфейс компании
export interface CompanyData {
  guid?: string
  company_type: number           // 1=Самозанятый, 2=ИП, 3=ООО
  inn: string
  kpp?: string
  ogrn?: string
  name: string
  short_name?: string
  address?: string
  postal_address?: string
  phone?: string
  email?: string
  description?: string
  bank_name?: string
  bank_bik?: string
  bank_account?: string
  bank_corr_account?: string
  is_verified?: boolean
  created_at?: string
  updated_at?: string
  files?: Array<{
    file_guid: string
    file_type: string
    file_name: string
    file_path: string
    file_size?: number
    mime_type?: string
    uploaded_at?: string
  }>
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