import { useState, useCallback } from 'react'
import socketService from '../../../Sockets'
import { Store, useStoreField } from '../../../Store'

export interface TransportData {
  name?: string
  license_plate?: string
  vin?: string
  manufacture_year?: number
  image?: string
  transport_type?: string
  experience?: number
  load_capacity?: number
}

export const useTransport = () => {
  const transportStore = useStoreField('transport', 12346)?.[0]
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Маппинг данных из Store в формат TransportData
  const transportData: TransportData | null = transportStore ? {
    name: transportStore.name,
    license_plate: transportStore.number,
    vin: transportStore.vin,
    manufacture_year: transportStore.year,
    image: transportStore.image,
    transport_type: transportStore.type,
    experience: transportStore.exp,
    load_capacity: transportStore.capacity
  } : null

  const load = useCallback(() => {
    // Данные загружаются автоматически из Store через useStoreField
  }, [])

  const save = useCallback((data: TransportData) => {
    setIsSaving(true)
    setError(null)

    const token = Store.getState().login?.token
    if (!token) {
      setError('Нет токена авторизации')
      setIsSaving(false)
      return
    }

    const payload = {
      name: data.name,
      number: data.license_plate,
      vin: data.vin,
      year: data.manufacture_year,
      image: data.image,
      type: data.transport_type,
      exp: data.experience,
      capacity: data.load_capacity,
      token,
      guid: transportStore?.guid
    }

    socketService.emit('set_transport', payload)
    
    // Обработчик ответа уже настроен в Store
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }, [transportStore?.guid])

  return {
    transportData,
    load,
    save,
    isSaving,
    isLoading: false,
    error
  }
}