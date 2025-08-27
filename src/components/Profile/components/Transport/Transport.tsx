import React, { useState, useEffect, useRef } from 'react'
import { IonIcon, IonButton } from '@ionic/react'
import { arrowBackOutline, chevronBackOutline, chevronForwardOutline, saveOutline } from 'ionicons/icons'
import { TransportData, useTransport } from './useTransport'
import { takePicture } from '../../../Files'
import styles from './Transport.module.css'
import { WizardHeader } from '../Company/WizardHeader'

interface Props {
  onBack: () => void
}

export const Transport: React.FC<Props> = ({ onBack }) => {
  const { transportData, save, load, isSaving, error } = useTransport()
  const [currentStep, setCurrentStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const [form, setForm] = useState({
    name:                   '',
    license_plate:          '',
    vin:                    '',
    manufacture_year:       0,
    image:                  '',
    transport_type:         '',
    experience:             0,
    load_capacity:          0
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<{image: string}>({
    image: ''
  })

  useEffect(() => {
    console.log("load")
    load()
  }, [load])

    // Заменить useEffect для transportData
    useEffect(() => {
        console.log("transportData updated:", transportData)
        if (transportData) {
            const newForm = {
                name: transportData.name || '',
                license_plate: transportData.license_plate || '',
                vin: transportData.vin || '',
                manufacture_year: transportData.manufacture_year || 0,
                image: transportData.image || '',
                transport_type: transportData.transport_type || '',
                experience: transportData.experience || 0,
                load_capacity: transportData.load_capacity || 0
            }
            setForm(newForm)
            setUploadedFiles({ image: transportData.image || '' })
        }
    }, [transportData])

    // Если данные все еще не приходят, заменить load() на принудительную загрузку
    useEffect(() => {
        console.log("Component mounted, loading transport data")
        if (!transportData) {
            load()
        }
    }, [])

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}
    
    switch (currentStep) {
      case 1:
        if (!form.name.trim()) errors.name = 'Введите название транспорта'
        if (!form.transport_type.trim()) errors.transport_type = 'Выберите тип транспорта'
        if (!form.license_plate.trim()) errors.license_plate = 'Введите гос.номер'
        break
      case 2:
        if (!form.vin.trim()) errors.vin = 'Введите VIN'
        if (!form.manufacture_year) errors.manufacture_year = 'Введите год выпуска'
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleBackNavigation = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    } else {
      onBack()
    }
  }

  const handleForwardNavigation = () => {
    if (validateCurrentStep()) {
      if (currentStep < 2) {
        setCurrentStep(prev => prev + 1)
      } else {
        handleSave()
      }
    }
  }

  const handleSave = () => {
    if (validateCurrentStep()) {
      const dataToSave = {
        ...form,
        manufacture_year:   form.manufacture_year   ? form.manufacture_year : 0,
        experience:         form.experience         ? form.experience : 0,
        load_capacity:      form.load_capacity      ? form.load_capacity : 0
      }
      save(dataToSave)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Основная информация'
      case 2: return 'Дополнительные данные'
      default: return 'Транспорт'
    }
  }

  // Функция для ресайза изображения
  const resizeImage = (photoData: any, maxWidth = 400, maxHeight = 400): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.src = photoData.dataUrl
      img.onload = function() {
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)
        
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
        resolve(resizedDataUrl)
      }
    })
  }

  // Обработка загрузки файлов
  const handleFileUpload = async () => {
    try {
      const photo = await takePicture()
      if (photo?.dataUrl) {
        const resizedImage = await resizeImage(photo)
        setUploadedFiles(prev => ({ ...prev, image: resizedImage }))
        setForm(prev => ({ ...prev, image: resizedImage }))
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
    }
  }

  const removeFile = () => {
    setUploadedFiles(prev => ({ ...prev, image: '' }))
    setForm(prev => ({ ...prev, image: '' }))
  }

  // Страница 1: Основная информация
  const renderBasicInfo = () => (
    <div className={styles.stepContent}>

      <div className={styles.field}>
        <div className={styles.label}>Название транспорта</div>
        <div className={styles.transportInputWrapper}>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="Название или описание"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
        </div>
        {validationErrors.name && <div className={styles.errorMsg}>{validationErrors.name}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Тип транспорта</div>
        <div className={styles.transportInputWrapper}>
          <select
            className={styles.customTextInput}
            value={form.transport_type}
            onChange={e => setForm({...form, transport_type: e.target.value})}
          >
            <option value="">Выберите тип</option>
            <option value="car">Легковой автомобиль</option>
            <option value="truck">Грузовой автомобиль</option>
            <option value="motorcycle">Мотоцикл</option>
            <option value="bus">Автобус</option>
          </select>
        </div>
        {validationErrors.transport_type && <div className={styles.errorMsg}>{validationErrors.transport_type}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Государственный номер</div>
        <div className={styles.transportInputWrapper}>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="А123БВ777"
            value={form.license_plate}
            onChange={e => setForm({...form, license_plate: e.target.value.toUpperCase()})}
          />
        </div>
        {validationErrors.license_plate && <div className={styles.errorMsg}>{validationErrors.license_plate}</div>}
      </div>

      {/* Фото транспорта */}
      <div className={styles.field}>
        <div className={styles.label}>Фото транспорта</div>
        {uploadedFiles.image ? (
          <div className={styles.filePreview}>
            <img src={uploadedFiles.image} alt="Транспорт" />
            <button 
              className={styles.removeFileBtn}
              onClick={removeFile}
            >
              ×
            </button>
          </div>
        ) : (
          <button 
            className={styles.uploadBtn}
            onClick={handleFileUpload}
          >
            Загрузить фото
          </button>
        )}
      </div>
    </div>
  )

  // Страница 2: Дополнительные данные  
  const renderAdditionalData = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>VIN номер</div>
        <div className={styles.transportInputWrapper}>
          <input
            type="text"
            className={styles.customTextInput}
            placeholder="17-значный код"
            maxLength={17}
            value={form.vin}
            onChange={e => setForm({...form, vin: e.target.value.toUpperCase()})}
          />
        </div>
        {validationErrors.vin && <div className={styles.errorMsg}>{validationErrors.vin}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Год выпуска</div>
        <div className={styles.transportInputWrapper}>
          <input
            type="number"
            className={styles.customTextInput}
            placeholder="2020"
            min="1900"
            max="2025"
            value={form.manufacture_year}
            onChange={e => setForm({...form, manufacture_year: parseInt(e.target.value)})}
          />
        </div>
        {validationErrors.manufacture_year && <div className={styles.errorMsg}>{validationErrors.manufacture_year}</div>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Опыт (лет)</div>
        <div className={styles.transportInputWrapper}>
          <input
            type="number"
            className={styles.customTextInput}
            placeholder="Опыт эксплуатации"
            min="0"
            value={form.experience}
            onChange={e => setForm({...form, experience: parseInt( e.target.value )})}
          />
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Грузоподъемность (т)</div>
        <div className={styles.transportInputWrapper}>
          <input
            type="number"
            className={styles.customTextInput}
            placeholder="Максимальная грузоподъемность"
            step="0.1"
            min="0"
            value={form.load_capacity}
            onChange={e => setForm({...form, load_capacity: parseInt( e.target.value )})}
          />
        </div>
      </div>

        <div className={styles.saveButtonContainer}>
            <button 
                className={styles.saveButton}
                onClick={() => { save( form as any ) }}
            >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
        </div>
    </div>
  )

  return (
    <div className={styles.transportWizard}>
      <div className={styles.wizardContent} ref={scrollRef}>
          <WizardHeader
            title={getStepTitle()}
            onBack={handleBackNavigation}
            onForward={handleForwardNavigation}
            onSave={ handleSave }
            isLastStep={currentStep === 2}
          />
          <div className={styles.stepContainer}>
            
            {currentStep === 1 && renderBasicInfo()}
            {currentStep === 2 && renderAdditionalData()}

            {error && <div className={styles.errorMsg}>{error}</div>}
          </div>
      </div>
    </div>
  )
}