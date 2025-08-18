import { useState, useEffect, useCallback } from 'react'

interface PersonalInfo {
  name?: string
  phone?: string
  email?: string
  image?: string
}

interface PassportData {
  series?: string
  number?: string
  issueDate?: string
  issuedBy?: string
}

interface Documents {
  passport?: string
  license?: string
}

interface ValidationErrors {
  name?: string
  phone?: string
  email?: string
  passport?: string
}

export const usePersonalData = (user: any) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    image: user?.image || ''
  })

  const [passportData, setPassportData] = useState<PassportData>({
    series: user?.passport?.series || '',
    number: user?.passport?.number || '',
    issueDate: user?.passport?.issueDate || '',
    issuedBy: user?.passport?.issuedBy || ''
  })

  const [documents, setDocuments] = useState<Documents>({
    passport: user?.documents?.passport || '',
    license: user?.documents?.license || ''
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)

  // Валидация полей
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
      case 'passport':
        return passportData.series && passportData.number && 
               (passportData.series.length !== 4 || passportData.number.length !== 6) ? 
               'Неверный формат паспорта' : null
      default:
        return null
    }
  }, [passportData])

  // Расчет процента заполненности
  const calculateCompletion = useCallback(() => {
    const fields = [
      personalInfo.name,
      personalInfo.phone, 
      personalInfo.email,
      personalInfo.image,
      passportData.series,
      passportData.number,
      passportData.issueDate,
      passportData.issuedBy,
      documents.passport,
      documents.license
    ]
    
    const filledFields = fields.filter(field => field && field.toString().trim()).length
    return Math.round((filledFields / fields.length) * 100)
  }, [personalInfo, passportData, documents])

  // Обновление процента при изменении данных
  useEffect(() => {
    setCompletionPercentage(calculateCompletion())
    
    // Обновляем CSS переменную для анимации круга
    const progressElement = document.querySelector('.progress-circle') as HTMLElement
    if (progressElement) {
      progressElement.style.setProperty('--progress', `${calculateCompletion()}%`)
    }
  }, [calculateCompletion])

  // Обновление основной информации
  const updatePersonalInfo = useCallback((field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }))
    
    // Валидация с задержкой
    setTimeout(() => {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error || undefined }))
    }, 500)
  }, [validateField])

  // Обновление паспортных данных  
  const updatePassportData = useCallback((field: keyof PassportData, value: string) => {
    setPassportData(prev => ({ ...prev, [field]: value }))
    
    // Форматирование серии и номера
    if (field === 'series') {
      value = value.replace(/\D/g, '').slice(0, 4)
    } else if (field === 'number') {
      value = value.replace(/\D/g, '').slice(0, 6)
    }
    
    setPassportData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Сжатие изображения
  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        const maxWidth = 800
        const maxHeight = 600
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      
      img.src = URL.createObjectURL(file)
    })
  }, [])

  // Загрузка документа
  const uploadDocument = useCallback(async (type: string, file: File) => {
    try {
      const compressedImage = await compressImage(file)
      
      if (type === 'photo') {
        setPersonalInfo(prev => ({ ...prev, image: compressedImage }))
      } else {
        setDocuments(prev => ({ ...prev, [type]: compressedImage }))
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
    }
  }, [compressImage])

  // Удаление документа
  const deleteDocument = useCallback((type: string) => {
    if (type === 'photo') {
      setPersonalInfo(prev => ({ ...prev, image: '' }))
    } else {
      setDocuments(prev => ({ ...prev, [type]: '' }))
    }
  }, [])

  // Сохранение всех данных
  const saveAllData = useCallback(async () => {
    // Валидация всех полей
    const newErrors: ValidationErrors = {}
    
    Object.keys(personalInfo).forEach(key => {
      const error = validateField(key, (personalInfo as any)[key] || '')
      if (error) newErrors[key as keyof ValidationErrors] = error
    })
    
    const passportError = validateField('passport', '')
    if (passportError) newErrors.passport = passportError
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSaving(true)
    setErrors({})
    
    try {
      const token = localStorage.getItem('serv-tm1.token')
      
      const response = await fetch('/api/profile/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          personalInfo,
          passportData,
          documents
        })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Ошибка сохранения')
      }
      
      // Показать успешное сообщение
      console.log('Данные успешно сохранены')
      
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      setErrors({ name: 'Ошибка сохранения данных' })
    } finally {
      setIsSaving(false)
    }
  }, [personalInfo, passportData, documents, validateField])

  return {
    personalInfo,
    passportData,
    documents,
    completionPercentage,
    updatePersonalInfo,
    updatePassportData,
    uploadDocument,
    deleteDocument,
    saveAllData,
    isSaving,
    errors
  }
}