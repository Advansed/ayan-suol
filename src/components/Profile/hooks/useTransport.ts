import { useState, useCallback, useEffect } from 'react'
import { Store, useStoreField } from '../../Store'
import socketService from '../../Sockets'

interface TransportInfo {
  guid?: string
  type?: string
  capacity?: number
  year?: number
  number?: string
  exp?: number
}

export const useTransport = () => {
  const transport = useStoreField('transport', 12346)?.[0]
  console.log( transport )
  const token = Store.getState().login?.token
  
  const [form, setForm] = useState<TransportInfo>(transport || {})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setForm(transport || {})
  }, [transport])

  useEffect(() => {
    const changed = JSON.stringify(form) !== JSON.stringify(transport || {})
    setHasChanges(changed)
  }, [form, transport])

  const updateField = useCallback((field: keyof TransportInfo, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const save = useCallback(async () => {
    if (!hasChanges) return true
    
    setIsSaving(true)
    setError(null)
    
    try {
      socketService.emit('transport', { 
        ...form, 
        token,
        guid: transport?.guid 
      })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSaving(false)
      return true
    } catch (err) {
      setError('Ошибка сохранения')
      setIsSaving(false)
      return false
    }
  }, [form, hasChanges, token, transport?.guid])

  const reset = useCallback(() => {
    setForm(transport || {})
  }, [transport])

  return {
    form,
    updateField,
    save,
    reset,
    isSaving,
    error,
    hasChanges
  }
}