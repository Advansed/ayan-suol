import { useState, useCallback, useMemo } from 'react'
import socketService from '../../../Sockets'
import { Store, useSelector, useStoreField } from '../../../Store'
import { useToast } from '../../../Toast'

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
  const transportStore = useSelector((state) => state.transport[0], 71)
  const [isSaving, setIsSaving] = useState(false)

  const toast = useToast()

  // Мемоизация данных для предотвращения спама
  const transportData: TransportData | null = useMemo(() => {
    return transportStore ? {
      name:               transportStore.name,
      license_plate:      transportStore.license_plate,
      vin:                transportStore.vin,
      manufacture_year:   transportStore.manufacture_year,
      image:              transportStore.image,
      transport_type:     transportStore.transport_type,
      experience:         transportStore.experience,
      load_capacity:      transportStore.load_capacity
    } : null
  }, [transportStore])

  const load = useCallback(() => {
    // Данные загружаются автоматически из Store через useStoreField
  }, [])

  const save = useCallback((data: TransportData) => {
    setIsSaving(true)

    const token = Store.getState().login?.token
    if (!token) {
      toast.error('Нет токена авторизации')
      setIsSaving(false)
      return
    }

    const payload = {

      name:               data.name,
      license_plate:      data.license_plate,
      vin:                data.vin,
      manufacture_year:   data.manufacture_year,
      image:              data.image,
      transport_type:     data.transport_type,
      experience:         data.experience,
      load_capacity:      data.load_capacity,
      token:              token,
      guid:               transportStore?.guid

    }

    socketService.emit('set_transport', payload)
    
    toast.success('Данные по транспорту сохранены')
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
    isLoading: false
  }
}