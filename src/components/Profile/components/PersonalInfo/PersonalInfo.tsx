import React, { useRef } from 'react'
import { IonButton, IonIcon } from '@ionic/react'
import { arrowBackOutline, saveOutline, cameraOutline, documentOutline } from 'ionicons/icons'
import { usePersonalData } from './usePersonalData'
import './PersonalInfo.css'

interface PersonalInfoProps {
  user: any
  onBack: () => void
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ user, onBack }) => {
  const {
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
  } = usePersonalData(user)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const passportInputRef = useRef<HTMLInputElement>(null)
  const licenseInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (type: string, file: File) => {
    if (file) {
      uploadDocument(type, file)
    }
  }

  return (
    <div className="personal-info">
      {/* Шапка с навигацией */}
      <div className="header">
        <IonIcon 
          icon={arrowBackOutline} 
          className="back-icon" 
          onClick={onBack}
        />
        <div className="title">Личные данные</div>
        <div className="progress-circle">
          <div className="progress-value">{completionPercentage}%</div>
        </div>
      </div>

      <div className="content">
        {/* Основная информация */}
        <div className="section">
          <div className="section-header">
            <h3>Основная информация</h3>
          </div>
          
          <div className="photo-section">
            <div className="photo-container">
              {personalInfo.image ? (
                <img src={personalInfo.image} alt="Фото профиля" className="profile-photo" />
              ) : (
                <div className="photo-placeholder">
                  <IonIcon icon={cameraOutline} />
                </div>
              )}
              <button 
                className="photo-btn"
                onClick={() => photoInputRef.current?.click()}
              >
                Изменить фото
              </button>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileUpload('photo', e.target.files[0])}
            />
          </div>

          <div className="field">
            <label>ФИО</label>
            <input
              type="text"
              value={personalInfo.name || ''}
              onChange={(e) => updatePersonalInfo('name', e.target.value)}
              placeholder="Введите ФИО"
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          <div className="field">
            <label>Телефон</label>
            <input
              type="tel"
              value={personalInfo.phone || ''}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              placeholder="+7 (999) 999-99-99"
            />
            {errors.phone && <div className="error">{errors.phone}</div>}
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={personalInfo.email || ''}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder="example@mail.ru"
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
        </div>

        {/* Паспортные данные */}
        <div className="section">
          <div className="section-header">
            <h3>Паспортные данные</h3>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Серия</label>
              <input
                type="text"
                value={passportData.series || ''}
                onChange={(e) => updatePassportData('series', e.target.value)}
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div className="field">
              <label>Номер</label>
              <input
                type="text"
                value={passportData.number || ''}
                onChange={(e) => updatePassportData('number', e.target.value)}
                placeholder="567890"
                maxLength={6}
              />
            </div>
          </div>

          <div className="field">
            <label>Дата выдачи</label>
            <input
              type="date"
              value={passportData.issueDate || ''}
              onChange={(e) => updatePassportData('issueDate', e.target.value)}
            />
          </div>

          <div className="field">
            <label>Кем выдан</label>
            <textarea
              value={passportData.issuedBy || ''}
              onChange={(e) => updatePassportData('issuedBy', e.target.value)}
              placeholder="Наименование органа"
              rows={2}
            />
          </div>
        </div>

        {/* Документы */}
        <div className="section">
          <div className="section-header">
            <h3>Документы</h3>
          </div>

          <div className="documents-grid">
            {/* Паспорт */}
            <div className="document-item">
              <div className="document-header">
                <IonIcon icon={documentOutline} />
                <span>Паспорт</span>
              </div>
              {documents.passport ? (
                <div className="document-preview">
                  <img src={documents.passport} alt="Паспорт" />
                  <button 
                    className="delete-btn"
                    onClick={() => deleteDocument('passport')}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button 
                  className="upload-btn"
                  onClick={() => passportInputRef.current?.click()}
                >
                  Загрузить фото
                </button>
              )}
              <input
                ref={passportInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload('passport', e.target.files[0])}
              />
            </div>

            {/* Водительские права */}
            <div className="document-item">
              <div className="document-header">
                <IonIcon icon={documentOutline} />
                <span>Водительские права</span>
              </div>
              {documents.license ? (
                <div className="document-preview">
                  <img src={documents.license} alt="Права" />
                  <button 
                    className="delete-btn"
                    onClick={() => deleteDocument('license')}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button 
                  className="upload-btn"
                  onClick={() => licenseInputRef.current?.click()}
                >
                  Загрузить фото
                </button>
              )}
              <input
                ref={licenseInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload('license', e.target.files[0])}
              />
            </div>
          </div>
        </div>

        {/* Кнопка сохранения */}
        <div className="save-section">
          <IonButton 
            expand="block" 
            onClick={saveAllData}
            disabled={isSaving}
            className="save-button"
          >
            <IonIcon icon={saveOutline} slot="start" />
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </IonButton>
        </div>
      </div>
    </div>
  )
}