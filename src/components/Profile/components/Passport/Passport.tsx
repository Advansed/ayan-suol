import React, { useState, useEffect, useRef } from 'react'
import { IonIcon, IonButton } from '@ionic/react'
import { arrowBackOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons'
import { usePassport } from './usePassport'
import { Files } from '../../../Files'
import './Passport.css'

interface Props {
  onBack: () => void
}

export const Passport: React.FC<Props> = ({ onBack }) => {
  const { passportData, save, load, isSaving, error } = usePassport()
  const [currentStep, setCurrentStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const [form, setForm] = useState({
    series: '',
    number: '',
    issueDate: '',
    issuedBy: '',
    birthDate: '',
    birthPlace: '',
    regAddress: '',
    actualAddress: '',
    passportPhoto: '',
    passportRegPhoto: ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState({
    passportMain: null,
    passportReg: null
  })

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (passportData) {
      setForm({
        series: passportData.series || '',
        number: passportData.number || '',
        issueDate: passportData.issueDate || '',
        issuedBy: passportData.issuedBy || '',
        birthDate: passportData.birthDate || '',
        birthPlace: passportData.birthPlace || '',
        regAddress: passportData.regAddress || '',
        actualAddress: passportData.actualAddress || '',
        passportPhoto: passportData.passportPhoto || '',
        passportRegPhoto: passportData.passportRegPhoto || ''
      })
    }
  }, [passportData])

  // Валидация текущего шага
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}
    
    switch (currentStep) {
      case 1:
        if (!form.series.trim()) errors.series = 'Введите серию паспорта'
        if (!form.number.trim()) errors.number = 'Введите номер паспорта'
        if (!form.issueDate) errors.issueDate = 'Укажите дату выдачи'
        if (!form.issuedBy.trim()) errors.issuedBy = 'Укажите кем выдан'
        break
      case 2:
        if (!form.birthDate) errors.birthDate = 'Укажите дату рождения'
        if (!form.birthPlace.trim()) errors.birthPlace = 'Укажите место рождения'
        break
      case 3:
        if (!form.regAddress.trim()) errors.regAddress = 'Укажите адрес регистрации'
        break
      case 4:
        if (!uploadedFiles.passportMain) errors.passportMain = 'Загрузите фото паспорта'
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Переход к следующему шагу
  const handleNext = () => {
    if (validateCurrentStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1)
      scrollToActiveField()
    }
  }

  // Переход к предыдущему шагу
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      scrollToActiveField()
    }
  }

  // Прямой переход к шагу
  const goToStep = (step: number) => {
    setCurrentStep(step)
    scrollToActiveField()
  }

  // Автоскролл к активному полю
  const scrollToActiveField = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0
      }
    }, 100)
  }

  // Обработка файлов
  const handleFileUpload = async (type: 'passportMain' | 'passportReg') => {
    try {
      const { takePicture } = await import('../../../Files')
      const image = await takePicture()
      
      setUploadedFiles(prev => ({
        ...prev,
        [type]: image.dataUrl
      }))

      if (type === 'passportMain') {
        setForm(prev => ({ ...prev, passportPhoto: image.dataUrl || '' }))
      } else {
        setForm(prev => ({ ...prev, passportRegPhoto: image.dataUrl || '' }))
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
    }
  }

  // Удаление файла
  const removeFile = (type: 'passportMain' | 'passportReg') => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: null
    }))

    if (type === 'passportMain') {
      setForm(prev => ({ ...prev, passportPhoto: '' }))
    } else {
      setForm(prev => ({ ...prev, passportRegPhoto: '' }))
    }
  }

  // Сохранение данных
  const handleSave = () => {
    if (validateCurrentStep()) {
      save(form)
    }
  }

  // Индикатор прогресса
  const renderProgressIndicator = () => (
    <div className="progress-indicator">
      {[1, 2, 3, 4].map(step => (
        <div
          key={step}
          className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
          onClick={() => goToStep(step)}
        >
          {step}
        </div>
      ))}
    </div>
  )

  // Страница 1: Основные данные
  const renderBasicInfo = () => (
    <div className="step-content">
      <div><b>Основные данные паспорта</b></div>
      
      <div className="field-row">
        <div className="">
          <div className="label">Серия</div>
          <div className="passport-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              placeholder="ХХХХ"
              maxLength={4}
              value={form.series}
              onChange={e => setForm({...form, series: e.target.value})}
            />
          </div>
          {validationErrors.series && <div className="error-msg">{validationErrors.series}</div>}
        </div>

        <div className="">
          <div className="label">Номер</div>
          <div className="passport-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              placeholder="ХХХХХХ"
              maxLength={6}
              value={form.number}
              onChange={e => setForm({...form, number: e.target.value})}
            />
          </div>
          {validationErrors.number && <div className="error-msg">{validationErrors.number}</div>}
        </div>
      </div>

      <div className="">
        <div className="label">Дата выдачи</div>
        <div className="passport-input-wrapper">
          <input
            type="date"
            className="custom-text-input"
            value={form.issueDate}
            onChange={e => setForm({...form, issueDate: e.target.value})}
          />
        </div>
        {validationErrors.issueDate && <div className="error-msg">{validationErrors.issueDate}</div>}
      </div>

      <div className="">
        <div className="label">Кем выдан</div>
        <div className="passport-input-wrapper">
          <input
            type="text"
            className="custom-text-input"
            placeholder="Наименование органа"
            value={form.issuedBy}
            onChange={e => setForm({...form, issuedBy: e.target.value})}
          />
        </div>
        {validationErrors.issuedBy && <div className="error-msg">{validationErrors.issuedBy}</div>}
      </div>
    </div>
  )

  // Страница 2: Персональные данные
  const renderPersonalData = () => (
    <div className="step-content">
      <h3>Персональные данные</h3>
      
      <div className="field">
        <div className="label">Дата рождения</div>
        <div className="passport-input-wrapper">
          <input
            type="date"
            className="custom-text-input"
            value={form.birthDate}
            onChange={e => setForm({...form, birthDate: e.target.value})}
          />
        </div>
        {validationErrors.birthDate && <div className="error-msg">{validationErrors.birthDate}</div>}
      </div>

      <div className="field">
        <div className="label">Место рождения</div>
        <div className="passport-input-wrapper">
          <input
            type="text"
            className="custom-text-input"
            placeholder="Место рождения"
            value={form.birthPlace}
            onChange={e => setForm({...form, birthPlace: e.target.value})}
          />
        </div>
        {validationErrors.birthPlace && <div className="error-msg">{validationErrors.birthPlace}</div>}
      </div>
    </div>
  )

  // Страница 3: Адресная информация
  const renderAddressInfo = () => (
    <div className="step-content">
      <h3>Адресная информация</h3>
      
      <div className="field">
        <div className="label">Адрес регистрации</div>
        <div className="passport-input-wrapper">
          <input
            type="text"
            className="custom-text-input"
            placeholder="Адрес регистрации по паспорту"
            value={form.regAddress}
            onChange={e => setForm({...form, regAddress: e.target.value})}
          />
        </div>
        {validationErrors.regAddress && <div className="error-msg">{validationErrors.regAddress}</div>}
      </div>

      <div className="field">
        <div className="label">Фактический адрес</div>
        <div className="passport-input-wrapper">
          <input
            type="text"
            className="custom-text-input"
            placeholder="Фактический адрес проживания"
            value={form.actualAddress}
            onChange={e => setForm({...form, actualAddress: e.target.value})}
          />
        </div>
      </div>
    </div>
  )

  // Страница 4: Документы
  const renderDocuments = () => (
    <div className="step-content">
      <h3>Фотографии документов</h3>
      
      <div className="file-section">
        <div className="file-item">
          <div className="label">Фото основной страницы паспорта</div>
          {uploadedFiles.passportMain ? (
            <div className="file-preview">
              <img src={uploadedFiles.passportMain} alt="Паспорт" />
              <button 
                className="remove-file-btn"
                onClick={() => removeFile('passportMain')}
              >
                ×
              </button>
            </div>
          ) : (
            <button 
              className="upload-btn"
              onClick={() => handleFileUpload('passportMain')}
            >
              Загрузить фото
            </button>
          )}
          {validationErrors.passportMain && <div className="error-msg">{validationErrors.passportMain}</div>}
        </div>

        <div className="file-item">
          <div className="label">Фото страницы с регистрацией</div>
          {uploadedFiles.passportReg ? (
            <div className="file-preview">
              <img src={uploadedFiles.passportReg} alt="Регистрация" />
              <button 
                className="remove-file-btn"
                onClick={() => removeFile('passportReg')}
              >
                ×
              </button>
            </div>
          ) : (
            <button 
              className="upload-btn"
              onClick={() => handleFileUpload('passportReg')}
            >
              Загрузить фото
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // Навигационные кнопки
  const renderNavigation = () => (
    <div className="navigation-buttons">
      <IonButton
        fill="outline"
        disabled={currentStep === 1}
        onClick={handlePrev}
      >
        <IonIcon icon={chevronBackOutline} slot="start" />
        Назад
      </IonButton>

      {currentStep < 4 ? (
        <IonButton
          onClick={handleNext}
        >
          Далее
          <IonIcon icon={chevronForwardOutline} slot="end" />
        </IonButton>
      ) : (
        <IonButton
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </IonButton>
      )}
    </div>
  )

  return (
    <div className="passport-wizard">
      <IonIcon 
        icon={arrowBackOutline} 
        className="back-icon" 
        onClick={onBack}
      />
      
      <div className="wizard-content" ref={scrollRef}>
        {renderProgressIndicator()}
        
        <div className="step-container">
          {currentStep === 1 && renderBasicInfo()}
          {currentStep === 2 && renderPersonalData()}
          {currentStep === 3 && renderAddressInfo()}
          {currentStep === 4 && renderDocuments()}
        </div>

        {error && <div className="error-msg">{error}</div>}
      </div>

      {renderNavigation()}
    </div>
  )
}