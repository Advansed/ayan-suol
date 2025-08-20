import React, { useState, useEffect, useRef } from 'react'
import { IonIcon } from '@ionic/react'
import { chevronBackOutline, chevronForwardOutline, saveOutline } from 'ionicons/icons'
import { useCompany } from './useCompany'
import styles from './Company.module.css'

interface Props {
  onBack: () => void
}

export const Company: React.FC<Props> = ({ onBack }) => {
  const { 
    companyData, 
    isLoading, 
    isSaving, 
    error, 
    success,
    loadData,
    saveData,
    resetStates
  } = useCompany()
  
  const [currentStep, setCurrentStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const [form, setForm] = useState({
    guid: '',
    company_type: 0,
    inn: '',
    kpp: '',
    ogrn: '',
    name: '',
    short_name: '',
    address: '',
    postal_address: '',
    phone: '',
    email: '',
    description: '',
    bank_name: '',
    bank_bik: '',
    bank_account: '',
    bank_corr_account: ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<{
    certificate: string | null
    charter: string | null
    registration: string | null
  }>({
    certificate: null,
    charter: null,
    registration: null
  })

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (companyData) {
      setForm(prev => ({
        ...prev,
        guid: companyData.guid || '',
        company_type: companyData.company_type || 0,
        inn: companyData.inn || '',
        kpp: companyData.kpp || '',
        ogrn: companyData.ogrn || '',
        name: companyData.name || '',
        short_name: companyData.short_name || '',
        address: companyData.address || '',
        postal_address: companyData.postal_address || '',
        phone: companyData.phone || '',
        email: companyData.email || '',
        description: companyData.description || '',
        bank_name: companyData.bank_name || '',
        bank_bik: companyData.bank_bik || '',
        bank_account: companyData.bank_account || '',
        bank_corr_account: companyData.bank_corr_account || ''
      }))
    }
  }, [companyData])

  // Валидация текущего шага
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}
    
    switch (currentStep) {
      case 1:
        if (!form.company_type) errors.company_type = 'Выберите тип компании'
        if (!form.inn.trim()) errors.inn = 'Введите ИНН'
        else if (!/^\d{10}$|^\d{12}$/.test(form.inn)) errors.inn = 'ИНН должен содержать 10 или 12 цифр'
        break
      case 2:
        if (!form.name.trim()) errors.name = 'Введите наименование'
        if (form.company_type === 3 && !form.kpp.trim()) errors.kpp = 'КПП обязателен для ООО'
        break
      case 3:
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Неверный формат email'
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Навигация назад
  const handleBackNavigation = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      scrollToActiveField()
    } else {
      onBack()
    }
  }

  // Навигация вперед
  const handleForwardNavigation = () => {
    if (currentStep < 4) {
      if (validateCurrentStep()) {
        setCurrentStep(currentStep + 1)
        scrollToActiveField()
      }
    } else {
      if (validateCurrentStep()) {
        saveData(form)
      }
    }
  }

  // Получение заголовка шага
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Тип компании и ИНН'
      case 2: return 'Основные данные'
      case 3: return 'Контакты и банк'
      case 4: return 'Документы'
      default: return 'Данные компании'
    }
  }

  // Автоскролл к активному полю
  const scrollToActiveField = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0
      }
    }, 100)
  }

  // Поиск по ИНН через dadata (заглушка)
  const searchByInn = async () => {
    // TODO: Интеграция с dadata API
    console.log('Поиск по ИНН:', form.inn)
  }

  // Обработка файлов
  const handleFileUpload = async (type: 'certificate' | 'charter' | 'registration') => {
    try {
      const { takePicture } = await import('../../../Files')
      const image = await takePicture()
      
      setUploadedFiles(prev => ({
        ...prev,
        [type]: image.dataUrl
      }))
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
    }
  }

  // Удаление файла
  const removeFile = (type: 'certificate' | 'charter' | 'registration') => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: null
    }))
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

  // Шаг 1: Тип компании и ИНН
  const renderCompanyType = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Тип компании</div>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="company_type"
              value="1"
              checked={form.company_type === 1}
              onChange={e => setForm({...form, company_type: 1})}
            />
            <span>Самозанятый</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="company_type"
              value="2"
              checked={form.company_type === 2}
              onChange={e => setForm({...form, company_type: 2})}
            />
            <span>ИП</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="company_type"
              value="3"
              checked={form.company_type === 3}
              onChange={e => setForm({...form, company_type: 3})}
            />
            <span>ООО</span>
          </label>
        </div>
        {validationErrors.company_type && <div className={styles.errorMsg}>{validationErrors.company_type}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>ИНН</div>
        <div className={styles.innInputWrapper}>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="ИНН компании"
            value={form.inn}
            onChange={e => setForm({...form, inn: e.target.value})}
            maxLength={12}
          />
          <button 
            className={styles.searchBtn}
            onClick={searchByInn}
            disabled={!form.inn || form.inn.length < 10}
          >
            Найти
          </button>
        </div>
        {validationErrors.inn && <div className={styles.errorMsg}>{validationErrors.inn}</div>}
      </div>
    </div>
  )

  // Шаг 2: Основные данные
  const renderBasicData = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Наименование</div>
        <input
          type="text"
          className={styles.customTextInput}
          placeholder="Полное наименование"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
        />
        {validationErrors.name && <div className={styles.errorMsg}>{validationErrors.name}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Сокращенное наименование</div>
        <input
          type="text"
          className={styles.customTextInput}
          placeholder="Краткое наименование"
          value={form.short_name}
          onChange={e => setForm({...form, short_name: e.target.value})}
        />
      </div>

      {form.company_type === 3 && (
        <div className={styles.field}>
          <div className={styles.label}>КПП</div>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="КПП организации"
            value={form.kpp}
            onChange={e => setForm({...form, kpp: e.target.value})}
            maxLength={9}
          />
          {validationErrors.kpp && <div className={styles.errorMsg}>{validationErrors.kpp}</div>}
        </div>
      )}

      <div className={styles.field}>
        <div className={styles.label}>ОГРН/ОГРНИП</div>
        <input
          type="text"
          className={styles.customTextInput}
          placeholder="ОГРН или ОГРНИП"
          value={form.ogrn}
          onChange={e => setForm({...form, ogrn: e.target.value})}
          maxLength={15}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Юридический адрес</div>
        <input
          type="text"
          className={styles.customTextInput}
          placeholder="Адрес регистрации"
          value={form.address}
          onChange={e => setForm({...form, address: e.target.value})}
        />
      </div>
    </div>
  )

  // Шаг 3: Контакты и банк
  const renderContactsAndBank = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Телефон</div>
        <input
          type="tel"
          className={styles.customTextInput}
          placeholder="+7 (999) 123-45-67"
          value={form.phone}
          onChange={e => setForm({...form, phone: e.target.value})}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Email</div>
        <input
          type="email"
          className={styles.customTextInput}
          placeholder="company@example.com"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
        />
        {validationErrors.email && <div className={styles.errorMsg}>{validationErrors.email}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Описание деятельности</div>
        <textarea
          className={styles.customTextarea}
          placeholder="Краткое описание деятельности компании"
          value={form.description}
          onChange={e => setForm({...form, description: e.target.value})}
          rows={3}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Банк</div>
        <input
          type="text"
          className={styles.customTextInput}
          placeholder="Название банка"
          value={form.bank_name}
          onChange={e => setForm({...form, bank_name: e.target.value})}
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.label}>БИК</div>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="БИК банка"
            value={form.bank_bik}
            onChange={e => setForm({...form, bank_bik: e.target.value})}
            maxLength={9}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.label}>Расчетный счет</div>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="Номер счета"
            value={form.bank_account}
            onChange={e => setForm({...form, bank_account: e.target.value})}
            maxLength={20}
          />
        </div>
      </div>
    </div>
  )

  // Шаг 4: Документы
  const renderDocuments = () => (
    <div className={styles.stepContent}>
      <div className={styles.fileSection}>
        {/* Документы для самозанятого */}
        {form.company_type === 1 && (
          <div className={styles.fileItem}>
            <div className={styles.label}>Справка о статусе самозанятого</div>
            {uploadedFiles.certificate ? (
              <div className={styles.filePreview}>
                <img src={uploadedFiles.certificate} alt="Справка" />
                <button 
                  className={styles.removeFileBtn}
                  onClick={() => removeFile('certificate')}
                >
                  ×
                </button>
              </div>
            ) : (
              <button 
                className={styles.uploadBtn}
                onClick={() => handleFileUpload('certificate')}
              >
                Загрузить справку
              </button>
            )}
          </div>
        )}

        {/* Документы для ИП */}
        {form.company_type === 2 && (
          <div className={styles.fileItem}>
            <div className={styles.label}>Свидетельство о регистрации ИП</div>
            {uploadedFiles.registration ? (
              <div className={styles.filePreview}>
                <img src={uploadedFiles.registration} alt="Свидетельство" />
                <button 
                  className={styles.removeFileBtn}
                  onClick={() => removeFile('registration')}
                >
                  ×
                </button>
              </div>
            ) : (
              <button 
                className={styles.uploadBtn}
                onClick={() => handleFileUpload('registration')}
              >
                Загрузить свидетельство
              </button>
            )}
          </div>
        )}

        {/* Документы для ООО */}
        {form.company_type === 3 && (
          <>
            <div className={styles.fileItem}>
              <div className={styles.label}>Устав организации</div>
              {uploadedFiles.charter ? (
                <div className={styles.filePreview}>
                  <img src={uploadedFiles.charter} alt="Устав" />
                  <button 
                    className={styles.removeFileBtn}
                    onClick={() => removeFile('charter')}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button 
                  className={styles.uploadBtn}
                  onClick={() => handleFileUpload('charter')}
                >
                  Загрузить устав
                </button>
              )}
            </div>

            <div className={styles.fileItem}>
              <div className={styles.label}>Свидетельство о регистрации</div>
              {uploadedFiles.registration ? (
                <div className={styles.filePreview}>
                  <img src={uploadedFiles.registration} alt="Свидетельство" />
                  <button 
                    className={styles.removeFileBtn}
                    onClick={() => removeFile('registration')}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button 
                  className={styles.uploadBtn}
                  onClick={() => handleFileUpload('registration')}
                >
                  Загрузить свидетельство
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )

  // Основной рендер
  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  return (
    <div className={styles.wizardContainer}>
      {renderStepHeader()}
      
      <div className={styles.wizardContent} ref={scrollRef}>
        {success && (
          <div className={styles.successMessage}>
            ✓ Данные успешно сохранены
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>{error}</div>
        )}

        {currentStep === 1 && renderCompanyType()}
        {currentStep === 2 && renderBasicData()}
        {currentStep === 3 && renderContactsAndBank()}
        {currentStep === 4 && renderDocuments()}
      </div>
    </div>
  )
}