import React, { useState, useEffect } from 'react'
import { IonIcon } from '@ionic/react'
import { chevronBackOutline, chevronForwardOutline, saveOutline } from 'ionicons/icons'
import { usePersonalData } from './usePersonalData'
import styles from './PersonalInfo.module.css'

interface Props {
  user: any
  onBack: () => void
}

export const PersonalInfo: React.FC<Props> = ({ user, onBack }) => {
  const { 
    personalData, 
    isLoading, 
    isSaving, 
    error, 
    success,
    loadData,
    savePersonalInfo,
    saveAvatar,
    changePassword,
    resetStates
  } = usePersonalData()
  
  const [currentStep, setCurrentStep] = useState(1)
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    avatar: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [uploadedAvatar, setUploadedAvatar] = useState<string | undefined>( undefined )

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (personalData) {
      setForm(prev => ({
        ...prev,
        name: personalData.name || '',
        email: personalData.email || '',
        avatar: personalData.image || ''
      }))
      setUploadedAvatar(personalData.image || undefined )
    }
  }, [personalData])

  // Показать уведомление об успехе
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        onBack()
      }, 1500)
    }
  }, [success, onBack])

  // Валидация текущего шага
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}
    
    switch (currentStep) {
      case 1:
        if (!form.name.trim()) errors.name = 'Введите ФИО'
        if (!form.email.trim()) errors.email = 'Введите email'
        else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Неверный формат email'
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

  // Удаление фото
  const removeAvatar = () => {
    setUploadedAvatar( undefined )
    setForm(prev => ({ ...prev, avatar: '' }))
    saveAvatar('') // Сохранить удаление аватара
  }

  // Рендер заголовка
  const renderStepHeader = () => (
    <div className={styles.stepHeader}>
      <button className={`${styles.navButton} ${styles.navButtonLeft}`} onClick={handleBackNavigation}>
        <IonIcon icon={chevronBackOutline} />
      </button>
      
      <h3 className={styles.stepTitle}>{getStepTitle()}</h3>
      
      <button 
        className={`${styles.navButton} ${styles.navButtonRight}`} 
        onClick={handleForwardNavigation}
        disabled={currentStep === 4 && isSaving}
      >
        {currentStep === 4 ? (
          <IonIcon icon={saveOutline} />
        ) : (
          <IonIcon icon={chevronForwardOutline} />
        )}
      </button>
    </div>
  )

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
          onClick={() => {
            if (validateCurrentStep()) {
              savePersonalInfo(form.name, form.email)
            }
          }}
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
            onClick={() => saveAvatar(form.avatar)}
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
          onClick={() => {
            if (validateCurrentStep()) {
              changePassword(form.newPassword)
            }
          }}
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
          {renderStepHeader()}
          
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