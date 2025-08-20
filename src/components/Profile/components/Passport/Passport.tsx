import React, { useState, useEffect, useRef } from 'react'
import { IonIcon, IonButton } from '@ionic/react'
import { arrowBackOutline, chevronBackOutline, chevronForwardOutline, saveOutline } from 'ionicons/icons'
import { usePassport } from './usePassport'
import { Files } from '../../../Files'
import styles from './Passport.module.css'
import { WizardHeader } from '../Company/WizardHeader'

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
    console.log("load")
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
        // if (!uploadedFiles.passportMain) errors.passportMain = 'Загрузите фото паспорта'
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Обработка кнопки "Назад"
  const handleBackNavigation = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      scrollToActiveField()
    } else {
      onBack() // Выход в профиль
    }
  }

  // Обработка кнопки "Далее"
  const handleForwardNavigation = () => {
    if (currentStep < 4) {
      if (validateCurrentStep()) {
        setCurrentStep(currentStep + 1)
        scrollToActiveField()
      }
    } else {
      // Последний шаг - сохранение
      if (validateCurrentStep()) {
        save(form)
      }
    }
  }

  // Получение заголовка шага
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Основные данные паспорта'
      case 2: return 'Персональные данные'
      case 3: return 'Адресная информация'
      case 4: return 'Фотографии документов'
      default: return 'Паспортные данные'
    }
  }

  // Рендер заголовочной панели
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

  // Страница 1: Основные данные
  const renderBasicInfo = () => (
    <div className={styles.stepContent}>
      <div className={styles.fieldRow}>
        <div>
          <div className={styles.label}>Серия</div>
          <div className={styles.passportInputWrapper}>
            <input
              type="text"
              className={styles.customTextInput}
              placeholder="ХХХХ"
              maxLength={4}
              value={form.series}
              onChange={e => setForm({...form, series: e.target.value})}
            />
          </div>
          {validationErrors.series && <div className={styles.errorMsg}>{validationErrors.series}</div>}
        </div>

        <div>
          <div className={styles.label}>Номер</div>
          <div className={styles.passportInputWrapper}>
            <input
              type="text"
              className={styles.customTextInput}
              placeholder="ХХХХХХ"
              maxLength={6}
              value={form.number}
              onChange={e => setForm({...form, number: e.target.value})}
            />
          </div>
          {validationErrors.number && <div className={styles.errorMsg}>{validationErrors.number}</div>}
        </div>
      </div>

      <div>
        <div className={styles.label}>Дата выдачи</div>
        <div className={styles.passportInputWrapper}>
          <input
            type="date"
            className={styles.customTextInput}
            value={form.issueDate}
            onChange={e => setForm({...form, issueDate: e.target.value})}
          />
        </div>
        {validationErrors.issueDate && <div className={styles.errorMsg}>{validationErrors.issueDate}</div>}
      </div>

      <div>
        <div className={styles.label}>Кем выдан</div>
        <div className={styles.passportInputWrapper}>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="Наименование органа"
            value={form.issuedBy}
            onChange={e => setForm({...form, issuedBy: e.target.value})}
          />
        </div>
        {validationErrors.issuedBy && <div className={styles.errorMsg}>{validationErrors.issuedBy}</div>}
      </div>
    </div>
  )

  // Страница 2: Персональные данные
  const renderPersonalData = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Дата рождения</div>
        <div className={styles.passportInputWrapper}>
          <input
            type="date"
            className={styles.customTextInput}
            value={form.birthDate}
            onChange={e => setForm({...form, birthDate: e.target.value})}
          />
        </div>
        {validationErrors.birthDate && <div className={styles.errorMsg}>{validationErrors.birthDate}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Место рождения</div>
        <div className={styles.passportInputWrapper}>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="Место рождения"
            value={form.birthPlace}
            onChange={e => setForm({...form, birthPlace: e.target.value})}
          />
        </div>
        {validationErrors.birthPlace && <div className={styles.errorMsg}>{validationErrors.birthPlace}</div>}
      </div>
    </div>
  )

  // Страница 3: Адресная информация
  const renderAddressInfo = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Адрес регистрации</div>
        <div className={styles.passportInputWrapper}>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="Адрес регистрации по паспорту"
            value={form.regAddress}
            onChange={e => setForm({...form, regAddress: e.target.value})}
          />
        </div>
        {validationErrors.regAddress && <div className={styles.errorMsg}>{validationErrors.regAddress}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Фактический адрес</div>
        <div className={styles.passportInputWrapper}>
          <input
            type="text"
            className={styles.customTextInput}
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
    <div className={styles.stepContent}>
      <div className={styles.fileSection}>
        <div className={styles.fileItem}>
          <div className={styles.label}>Фото основной страницы паспорта</div>
          {uploadedFiles.passportMain ? (
            <div className={styles.filePreview}>
              <img src={uploadedFiles.passportMain} alt="Паспорт" />
              <button 
                className={styles.removeFileBtn}
                onClick={() => removeFile('passportMain')}
              >
                ×
              </button>
            </div>
          ) : (
            <button 
              className={styles.uploadBtn}
              onClick={() => handleFileUpload('passportMain')}
            >
              Загрузить фото
            </button>
          )}
          {validationErrors.passportMain && <div className={styles.errorMsg}>{validationErrors.passportMain}</div>}
        </div>

        <div className={styles.fileItem}>
          <div className={styles.label}>Фото страницы с регистрацией</div>
          {uploadedFiles.passportReg ? (
            <div className={styles.filePreview}>
              <img src={uploadedFiles.passportReg} alt="Регистрация" />
              <button 
                className={styles.removeFileBtn}
                onClick={() => removeFile('passportReg')}
              >
                ×
              </button>
            </div>
          ) : (
            <button 
              className={styles.uploadBtn}
              onClick={() => handleFileUpload('passportReg')}
            >
              Загрузить фото
            </button>
          )}
        </div>
      </div>
    </div>
  )

 return (
  <div className={styles.passportWizard}>
    <div className={styles.wizardContent} ref={scrollRef}>
      <div className={styles.stepContainer}>
        <WizardHeader
          title={getStepTitle()}
          onBack={handleBackNavigation}
          onForward={handleForwardNavigation}
          isLastStep={false} // У PersonalInfo каждый шаг сохраняется отдельно
          isSaving={isSaving}
        />
        
        {currentStep === 1 && renderBasicInfo()}
        {currentStep === 2 && renderPersonalData()}
        {currentStep === 3 && renderAddressInfo()}
        {currentStep === 4 && renderDocuments()}

        {error && <div className={styles.errorMsg}>{error}</div>}
      </div>
    </div>
  </div>
)
}