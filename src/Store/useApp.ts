// src/Store/useApp.ts
import { useEffect, useRef } from 'react'
import { useLoginStore } from './loginStore'
import { useSocket } from './useSocket'
import { companyActions, CompanyData } from './companyStore'
import { transportActions, TransportData } from './transportStore'

// ============================================
// HOOK
// ============================================

export const useApp = () => {
  const { auth, token, user_type } = useLoginStore()
  const { isConnected, emit, once } = useSocket()
  const hasLoadedCompany = useRef(false)
  const hasLoadedTransport = useRef(false)

  // Загрузка данных компании при авторизации для заказчика
  useEffect(() => {
    if (auth && isConnected && token && user_type === 1 && !hasLoadedCompany.current) {
      console.log('Loading company data after authorization...')
      
      companyActions.setLoading(true)
      hasLoadedCompany.current = true

      const handleGetCompany = (response: { success: boolean; data?: CompanyData; message?: string }) => {
        companyActions.setLoading(false)
        
        if (response.success) {
          console.log('Company data loaded:', response.data)
          companyActions.setData(response.data || null)
        } else {
          console.error('Failed to load company data:', response.message)
          // Не показываем ошибку, так как данные компании могут отсутствовать
        }
      }

      once('get_company', handleGetCompany)
      emit('get_company', { token })
    }

    // Сброс флага при выходе
    if (!auth) {
      hasLoadedCompany.current = false
      companyActions.reset()
    }
  }, [auth, isConnected, token, user_type, emit, once])

  // Загрузка данных транспорта при авторизации для водителя
  useEffect(() => {
    if (auth && isConnected && token && user_type === 2 && !hasLoadedTransport.current) {
      console.log('Loading transport data after authorization...')
      
      transportActions.setLoading(true)
      hasLoadedTransport.current = true

      const handleGetTransport = (response: { success: boolean; data?: TransportData | TransportData[]; message?: string }) => {
        transportActions.setLoading(false)
        
        if (response.success) {
          const data = Array.isArray(response.data) ? response.data[0] : response.data
          console.log('Transport data loaded:', data)
          transportActions.setData(data || null)
        } else {
          console.error('Failed to load transport data:', response.message)
          // Не показываем ошибку, так как данные транспорта могут отсутствовать
        }
      }

      once('get_transport', handleGetTransport)
      emit('get_transport', { token })
    }

    // Сброс флага при выходе
    if (!auth) {
      hasLoadedTransport.current = false
      transportActions.reset()
    }
  }, [auth, isConnected, token, user_type, emit, once])

  return {
    // Можно добавить другие данные, которые нужно загружать при авторизации
  }
}
