// src/Store/loginStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================
// ТИПЫ
// ============================================
export interface UserData {
  id:             string
  name:           string
  phone:          string
  email:          string
  image:          string
  token:          string
  user_type:      number
  description:    string
  account:        string
  ratings:        number
  notifications:  any[]
}

export interface AuthResponse extends UserData {
  // дополнительные поля ответа авторизации
}

interface LoginState {
  auth:           boolean
  isLoading:      boolean
  id:             string
  name:           string
  phone:          string
  email:          string
  image:          string
  token:          string
  user_type:      number
  description:    string
  account:        string
  ratings:        number
  notifications:  any[]
}

interface LoginActions {
  setAuth: (auth: boolean) => void
  setLoading: (loading: boolean) => void
  setUser: (userData: AuthResponse) => void
  updateUser: (updates: Partial<UserData>) => void
  clearAuth: () => void
}

type LoginStore = LoginState & LoginActions

// ============================================
// ZUSTAND STORE
// ============================================
export const useLoginStore = create<LoginStore>()(
  devtools(
    (set) => ({
      // STATE
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
      ratings:        0,
      notifications:  [],

      // ACTIONS
      setAuth: (auth) => set({ auth }),
      setLoading: (isLoading) => set({ isLoading }),
      setUser: (userData) => set({ 
        ...userData, 
        auth: true, 
        isLoading: false 
      }),
      updateUser: (updates) => set(updates),
      clearAuth: () => set({
        auth: false,
        isLoading: false,
        id:             '',
        name:           '',
        phone:          '',
        email:          '',
        image:          '',
        token:          '',
        user_type:      0,
        description:    '',
        account:        '',
        ratings:        0,
        notifications:  []
      })
    }),
    { name: 'login-store' }
  )
)

// ============================================
// СЕЛЕКТИВНЫЕ ХУКИ
// ============================================
export const useToken = () => useLoginStore(state => state.token)

export const useUserType = () => useLoginStore(state => state.user_type)

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
  notifications: state.notifications
}))

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
  }
}

// ============================================
// ACTIONS (совместимость)
// ============================================
export const loginActions = {
  setAuth:      ( auth: boolean ) => useLoginStore.getState().setAuth(auth),
  setUser:      ( userData: AuthResponse ) => useLoginStore.getState().setUser(userData),
  clearAuth:    ( ) => useLoginStore.getState().clearAuth(),
  updateUser:   ( updates: Partial<UserData> ) => useLoginStore.getState().updateUser(updates)
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