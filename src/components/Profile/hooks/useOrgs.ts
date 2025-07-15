import { useState, useCallback, useEffect } from 'react'
import { Store, useStoreField } from '../../Store'
import socketService from '../../Sockets'

interface OrgInfo {
  name?: string
  inn?: string
  kpp?: string
  address?: string
  description?: string
}

export const useOrgs = () => {
  const orgs = useStoreField('orgs', 12345)
  const token = Store.getState().login?.token
  
  const [orgInfo, setOrgInfo] = useState<OrgInfo>(orgs?.[0] || {})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setOrgInfo(orgs?.[0] || {})
  }, [orgs])

  const updateField = useCallback((field: keyof OrgInfo, value: string) => {
    setOrgInfo(prev => ({ ...prev, [field]: value }))
  }, [])

  const save = useCallback(async () => {
    setIsSaving(true)
    setError(null)
    
    try {
      socketService.emit('set_orgs', { ...orgInfo, token })
      
      // Ждем ответа через таймаут
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSaving(false)
      return true
    } catch (err) {
      setError('Ошибка сохранения')
      setIsSaving(false)
      return false
    }
  }, [orgInfo, token])

  return {
    orgInfo,
    updateField,
    save,
    isSaving,
    error
  }
}