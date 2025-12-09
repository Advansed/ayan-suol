// src/Store/loginStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================
// ТИПЫ
// ============================================

export interface UserRatings {
  orders:             number
  rate:               number
  invoices:           number
  payd:               number
}

export interface Agreements {
  personalData:       boolean
  userAgreement:      boolean
  marketing:          boolean
}

export interface UserData {
  id:                 string
  name:               string
  phone:              string
  email:              string
  image:              string
  token:              string
  user_type:          number
  description:        string
  account:            string
  password:           string
  seller:             string
  gender:             boolean
  ratings:            UserRatings
  agreements:         Agreements
}

export interface AuthResponse extends UserData {
  // дополнительные поля ответа авторизации
}

interface LoginState {
  auth:               boolean
  isLoading:          boolean
  id:                 string
  logo:               boolean
  name:               string
  phone:              string
  email:              string
  image:              string
  token:              string
  user_type:          number
  description:        string
  account:            string
  seller:             string
  gender:             boolean
  ratings:            UserRatings
  agreements:         Agreements
}

interface LoginActions {
  setType:            ( user_type: number ) => void
  setLogo:            ( logo: boolean ) => void
  setAuth:            ( auth: boolean ) => void
  setToken:           ( token: string ) => void
  setLoading:         ( loading: boolean ) => void
  setUser:            ( userData: AuthResponse ) => void
  updateUser:         ( updates: Partial<UserData> ) => void
  clearAuth:          ( ) => void
  toggleAgreements:   ( agreementType: keyof Agreements ) => void
}

type LoginStore = LoginState & LoginActions

// ============================================
// ZUSTAND STORE
// ============================================
export const useLoginStore = create<LoginStore>()(
  devtools(
    (set) => ({
      // STATE
      auth:             false,
      isLoading:        false,
      logo:             true,
      id:               '',
      name:             '',
      phone:            '',
      email:            '',
      image:            '',
      token:            '',
      user_type:        0,
      description:      '',
      account:          '',
      seller:           '',
      gender:           true,
      ratings:          { orders: 0, rate: 0, invoices: 0, payd: 0 },
      agreements:       { personalData: false, userAgreement: false, marketing: false },

      // ACTIONS
      setType:          (user_type) => set({ user_type }),
      setLogo:          (logo) => set({ logo }),
      setAuth:          (auth) => set({ auth }),
      setToken:         (token) => set({ token }),
      setLoading:       (isLoading) => set({ isLoading }),
      setUser:          (userData) => set({ 
                        ...userData, 
                        isLoading: false 
      }),
      updateUser:       (updates) => set(updates),
      clearAuth:        () => set({
        auth:           false,
        isLoading:      false,
        id:             '',
        name:           '',
        phone:          '',
        email:          '',
        image:          '',
        token:          '',
        user_type:      0,
        description:    '',
        account:        '',
        seller:         '',
        gender:         true,
        ratings:        { orders: 0, rate: 0, invoices: 0, payd: 0 },
        agreements:     { personalData: false, userAgreement: false, marketing: false }
      }),
      toggleAgreements: (agreementType) => 
        set((state) => ({
          agreements: {
            ...state.agreements,
            [agreementType]: !state.agreements[agreementType]
          }
        }))
    }),
    { name: 'login-store' }
  )
)

// ============================================
// СЕЛЕКТИВНЫЕ ХУКИ
// ============================================
export const useToken = () => useLoginStore(state => state.token)

export const useAuth = () => useLoginStore(state => ({
  token: state.token,
  isAuthenticated: state.auth
}))

export const useAuthStatus = () => useLoginStore(state => state.auth)

export const useAuthLoading = () => useLoginStore(state => state.isLoading)

export const useCurrentUser = () => useLoginStore(state => ({
  id: state.id,
  name: state.name,
  phone: state.phone,
  email: state.email,
  image: state.image,
  user_type: state.user_type
}))

export const useUserProfile = () => useLoginStore(state => ({
  description: state.description,
  account: state.account,
  ratings: state.ratings,
  agreements: state.agreements
}))

export const useAgreements = () => useLoginStore(state => state.agreements)

export const useUserType = () => {
  const user_type = useLoginStore(state => state.user_type )
  const setType   = useLoginStore(state => state.setType )

  return  { user_type, setType }
}

// ============================================
// ГЕТТЕРЫ (совместимость)
// ============================================
export const loginGetters = {
  getToken: () => useLoginStore.getState().token,
  isAuthenticated: () => useLoginStore.getState().auth,
  getUserId: () => useLoginStore.getState().id,
  getCurrentUser: () => {
    const state = useLoginStore.getState()
    return {
      id: state.id,
      name: state.name,
      phone: state.phone,
      email: state.email,
      token: state.token
    }
  },
  hasValidToken: () => {
    const token = useLoginStore.getState().token
    return !!token && token.length > 0
  },
  getAgreements: () => useLoginStore.getState().agreements,
  getAgreement: (agreementType: keyof Agreements) => useLoginStore.getState().agreements[agreementType]

}

// ============================================
// ACTIONS (совместимость)
// ============================================
export const loginActions = {
  
  setAuth:            ( auth: boolean ) => useLoginStore.getState().setAuth(auth),
  setToken:           ( token: string ) => useLoginStore.getState().setToken( token ),
  setUser:            ( userData: AuthResponse ) => useLoginStore.getState().setUser(userData),
  clearAuth:          ( ) => useLoginStore.getState().clearAuth(),
  updateUser:         ( updates: Partial<UserData> ) => useLoginStore.getState().updateUser(updates),
  toggleAgreements:   ( agreementType: keyof Agreements ) => useLoginStore.getState().toggleAgreements(agreementType),
}

// ============================================
// УТИЛИТЫ
// ============================================
export const withToken = (callback: (token: string) => void) => {
  const token = loginGetters.getToken()
  if (token) {
    callback(token)
  } else {
    console.warn('No token available')
  }
}

