// src/Store/loginStore.ts

import { UniversalStore, TState } from './Store'
import { UserData, AuthResponse, UpdateUserData } from './types/auth'

// ============================================
// ТИПЫ
// ============================================

export interface LoginState extends TState, UserData {
  auth: boolean
  isLoading: boolean
}

// ============================================
// STORE
// ============================================

export const loginStore = new UniversalStore<LoginState>({
  initialState: { 
    auth: false,
    id: null,
    name: null,
    phone: null,
    email: null,
    image: null,
    token: null,
    user_type: null,
    description: null,
    account: null,
    ratings: null,
    notifications: null,
    isLoading: false
  },
  enableLogging: true
})

// ============================================
// GETTERS
// ============================================

export const loginGetters = {
  getToken: (): string | null => {
    return loginStore.getState().token
  },

  getUser: () => {
    const state = loginStore.getState()
    return {
      id: state.id,
      name: state.name,
      phone: state.phone,
      email: state.email,
      image: state.image,
      token: state.token,
      user_type: state.user_type,
      description: state.description,
      account: state.account,
      ratings: state.ratings,
      notifications: state.notifications
    }
  },

  isAuthenticated: (): boolean => {
    return loginStore.getState().auth
  }
}

// ============================================
// ACTIONS
// ============================================

export const loginActions = {
  setAuth: (auth: boolean) => {
    loginStore.dispatch({ type: 'auth', data: auth })
  },

  setLoading: (loading: boolean) => {
    loginStore.dispatch({ type: 'isLoading', data: loading })
  },

  setUser: (authData: AuthResponse) => {
    loginStore.batchUpdate({
      auth: true,
      id: authData.guid,
      name: authData.name,
      phone: authData.phone,
      email: authData.email,
      image: authData.image,
      token: authData.token,
      user_type: authData.user_type,
      description: authData.description,
      account: authData.account,
      ratings: authData.ratings,
      notifications: authData.notifications,
      isLoading: false
    })
  },

  updateUser: (updates: UpdateUserData) => {
    const validUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    )
    loginStore.batchUpdate(validUpdates)
  },

  clearAuth: () => {
    loginStore.batchUpdate({
      auth: false,
      id: null,
      name: null,
      phone: null,
      email: null,
      image: null,
      token: null,
      user_type: null,
      description: null,
      account: null,
      ratings: null,
      notifications: null,
      isLoading: false
    })
  }
}