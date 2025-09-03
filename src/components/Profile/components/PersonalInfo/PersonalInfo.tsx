import React, { useState, useEffect } from 'react'
import styles from './PersonalInfo.module.css'
import { WizardHeader } from '../Company/WizardHeader'
import { useLogin } from '../../../../Store/useLogin'

interface Props {
  onBack: () => void
}

export const PersonalInfo: React.FC<Props> = ({ onBack }) => {
  const { user, updateUser, isLoading } = useLogin()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [form, setForm] = useState({
    name:             '',
    email:            '',
    avatar:           '',
    newPassword:      '',
    confirmPassword:  ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [uploadedAvatar, setUploadedAvatar] = useState<string | undefined>(undefined)

  // Загружаем данные пользователя в форму
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        avatar: user.image || ''
      }))
      setUploadedAvatar(user.image || undefined)
    }
  }, [user])

  // Валидация текущего шага
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}
    
    switch (currentStep) {
      case 1:
        if (!form.name.trim()) errors.name = 'Введите ФИО'
        if (!form.email.trim()) errors.email = 'Введите email'
        else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Неверный формат email'
        break
      case 2:
        // Валидация для аватара (может быть пустой)
        break
      case 3:
        if (!form.newPassword) errors.newPassword = 'Введите новый пароль'
        else if (form.newPassword.length < 6) errors.newPassword = 'Минимум 6 символов'
        if (form.newPassword !== form.confirmPassword) errors.confirmPassword = 'Пароли не совпадают'
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Навигация назад
  const handleBackNavigation = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      onBack()
    }
  }

  // Навигация вперед
  const handleForwardNavigation = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Получение заголовка шага
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Личные данные'
      case 2: return 'Фото профиля'
      case 3: return 'Смена пароля'
      default: return 'Личные данные'
    }
  }

  // Загрузка фото
  const handleAvatarUpload = async () => {
    try {
      const { takePicture } = await import('../../../Files')
      const image = await takePicture()
      const avatarData = image.dataUrl
      setUploadedAvatar(avatarData)
      setForm(prev => ({ ...prev, avatar: avatarData || '' }))
    } catch (error) {
      console.error('Ошибка загрузки фото:', error)
    }
  }

  // Сохранение личных данных
  const savePersonalInfo = async () => {
    if (!validateCurrentStep()) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const success = await updateUser({
        name: form.name,
        email: form.email
      })

      if (success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError('Ошибка сохранения данных')
      }
    } catch (err) {
      setError('Ошибка сохранения данных')
    } finally {
      setIsSaving(false)
    }
  }

  // Сохранение аватара
  const saveAvatar = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const success = await updateUser({
        image: form.avatar
      })

      if (success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError('Ошибка сохранения фото')
      }
    } catch (err) {
      setError('Ошибка сохранения фото')
    } finally {
      setIsSaving(false)
    }
  }

  // Смена пароля
  const changePassword = async () => {
    if (!validateCurrentStep()) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const success = await updateUser({
        password: form.newPassword
      })

      if (success) {
        setSuccess(true)
        setForm(prev => ({ ...prev, newPassword: '', confirmPassword: '' }))
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError('Ошибка смены пароля')
      }
    } catch (err) {
      setError('Ошибка смены пароля')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = () => {
    if (currentStep === 1) {
      savePersonalInfo()
    }
  }

  // Удаление фото
  const removeAvatar = () => {
    setUploadedAvatar(undefined)
    setForm(prev => ({ ...prev, avatar: '' }))
    saveAvatar()
  }

  // Страница 1: Личные данные
  const renderPersonalData = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>ФИО</div>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="Фамилия Имя Отчество"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
        </div>
        {validationErrors.name && <div className={styles.errorMsg}>{validationErrors.name}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Email</div>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            className={styles.customTextInput}
            placeholder="example@email.com"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
        </div>
        {validationErrors.email && <div className={styles.errorMsg}>{validationErrors.email}</div>}
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}
      {success && <div className={styles.successMsg}>Данные сохранены!</div>}

      <div className={styles.saveSection}>
        <button 
          className={styles.saveBtn}
          onClick={savePersonalInfo}
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить данные'}
        </button>
      </div>
    </div>
  )

  // Страница 2: Фото аватара
  const renderAvatar = () => (
    <div className={styles.stepContent}>
      <div className={styles.avatarSection}>
        <div className={styles.label}>Фото профиля</div>
        {uploadedAvatar ? (
          <div className={styles.avatarPreview}>
            <img src={uploadedAvatar} alt="Аватар" className={styles.avatarImage} />
            <button 
              className={styles.removeBtn}
              onClick={removeAvatar}
            >
              ×
            </button>
          </div>
        ) : (
          <div className={styles.avatarPlaceholder}>
            <button 
              className={styles.uploadBtn}
              onClick={handleAvatarUpload}
            >
              Загрузить фото
            </button>
          </div>
        )}

        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>Фото сохранено!</div>}

        <div className={styles.saveSection}>
          <button 
            className={styles.saveBtn}
            onClick={saveAvatar}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить фото'}
          </button>
        </div>
      </div>
    </div>
  )

  // Страница 3: Смена пароля
  const renderPassword = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Новый пароль</div>
        <div className={styles.inputWrapper}>
          <input
            type="password"
            className={styles.customTextInput}
            placeholder="Введите новый пароль"
            value={form.newPassword}
            onChange={e => setForm({...form, newPassword: e.target.value})}
          />
        </div>
        {validationErrors.newPassword && <div className={styles.errorMsg}>{validationErrors.newPassword}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Подтвердите пароль</div>
        <div className={styles.inputWrapper}>
          <input
            type="password"
            className={styles.customTextInput}
            placeholder="Повторите новый пароль"
            value={form.confirmPassword}
            onChange={e => setForm({...form, confirmPassword: e.target.value})}
          />
        </div>
        {validationErrors.confirmPassword && <div className={styles.errorMsg}>{validationErrors.confirmPassword}</div>}
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}
      {success && <div className={styles.successMsg}>Пароль изменен!</div>}

      <div className={styles.saveSection}>
        <button 
          className={styles.saveBtn}
          onClick={changePassword}
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : 'Изменить пароль'}
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.personalWizard}>
      <div className={styles.wizardContent}>
        <div className={styles.stepContainer}>
          <WizardHeader
            title={getStepTitle()}
            onBack={handleBackNavigation}
            onForward={handleForwardNavigation}
            onSave={handleSave}
            isLastStep={currentStep === 3}
          />
          
          {isLoading ? (
            <div className={styles.stepContent}>
              <div style={{textAlign: 'center', padding: '20px'}}>
                Загрузка...
              </div>
            </div>
          ) : (
            <>
              {currentStep === 1 && renderPersonalData()}
              {currentStep === 2 && renderAvatar()}
              {currentStep === 3 && renderPassword()}
            </>
          )}
        </div>
      </div>
    </div>
  )
}