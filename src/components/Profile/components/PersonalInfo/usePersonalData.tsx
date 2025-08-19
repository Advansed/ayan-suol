import { useState, useCallback } from 'react'

interface PersonalData {
  name: string
  phone: string
  email: string
  image: string
  newPassword: string
  confirmPassword: string
}

interface ValidationErrors {
  name?: string
  phone?: string
  email?: string
  password?: string
}

export const usePersonalData = (user: any) => {
  const [currentPage, setCurrentPage] = useState(0)
  
  const [formData, setFormData] = useState<PersonalData>({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    image: user?.image || '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  // Валидация
  const validateField = useCallback((field: string, value: string): string | null => {
    switch (field) {
      case 'name':
        return !value.trim() ? 'Введите ФИО' : 
               value.trim().split(' ').length < 2 ? 'Введите имя и фамилию' : null
      case 'phone':
        return !value ? 'Введите телефон' :
               !/^\+7\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/.test(value) ? 'Неверный формат телефона' : null
      case 'email':
        return !value ? 'Введите email' :
               !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Неверный формат email' : null
      case 'password':
        if (formData.newPassword && formData.confirmPassword) {
          return formData.newPassword !== formData.confirmPassword ? 'Пароли не совпадают' : null
        }
        return null
      default:
        return null
    }
  }, [formData.newPassword, formData.confirmPassword])

  // Валидация текущей страницы
  const validateCurrentPage = useCallback((): boolean => {
    let isValid = true
    const newErrors: ValidationErrors = {}

    switch (currentPage) {
      case 0: // Страница 1: основная информация
        ['name', 'phone', 'email'].forEach(field => {
          const error = validateField(field, formData[field as keyof PersonalData])
          if (error) {
            newErrors[field as keyof ValidationErrors] = error
            isValid = false
          }
        })
        break
      
      case 1: // Страница 2: фото (без валидации)
        break
        
      case 2: // Страница 3: пароли
        if (formData.newPassword || formData.confirmPassword) {
          const error = validateField('password', '')
          if (error) {
            newErrors.password = error
            isValid = false
          }
        }
        break
    }

    setErrors(newErrors)
    return isValid
  }, [currentPage, formData, validateField])

  // Обновление данных
  const updateField = useCallback((field: keyof PersonalData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Очистка ошибки при изменении поля
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error || undefined }))
  }, [validateField])

  // Загрузка фото
  const uploadPhoto = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setFormData(prev => ({ ...prev, image: result }))
    }
    reader.readAsDataURL(file)
  }, [])

  // Навигация между страницами
  const nextPage = useCallback(() => {
    if (validateCurrentPage() && currentPage < 2) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, validateCurrentPage])

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  // Сохранение всех данных
  const saveData = useCallback(async () => {
    if (!validateCurrentPage()) return

    setIsSaving(true)

    try {
      // Отправка данных на сервер
      const token = localStorage.getItem('serv-tm1.token')
      
      const response = await fetch('/api/profile/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          ...formData
        })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Ошибка сохранения')
      }
      
      console.log('Данные успешно сохранены')
      
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      setErrors({ name: 'Ошибка сохранения данных' })
    } finally {
      setIsSaving(false)
    }
  }, [formData, validateCurrentPage])

  return {
    formData,
    currentPage,
    updateField,
    uploadPhoto,
    nextPage,
    prevPage,
    saveData,
    isSaving,
    errors
  }
}