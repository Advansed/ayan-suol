import React, { useRef } from 'react'
import { usePersonalData } from './usePersonalData'
import './PersonalInfo.css'
import { IonIcon } from '@ionic/react'
import { chevronBackOutline } from 'ionicons/icons'

interface PersonalInfoProps {
  user: any
  onBack: () => void
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ user, onBack }) => {
  const {
    formData,
    currentPage,
    updateField,
    uploadPhoto,
    nextPage,
    prevPage,
    saveData,
    isSaving,
    errors
  } = usePersonalData(user)
  
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Страница 1: Основная информация
  const renderPage1 = () => (
    <div className="step-content">
      <div className="field">
        <div className="label">Фамилия Имя Отчество</div>
        <div className="input-wrapper">
          <input
            type="text"
            className="simple-input"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Николай Алпасов"
          />
        </div>
        {errors.name && <div className="error-msg">{errors.name}</div>}
      </div>

      <div className="field">
        <div className="label">Телефон</div>
        <div className="input-wrapper">
          <input
            type="tel"
            className="simple-input"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+79142227300"
          />
        </div>
        {errors.phone && <div className="error-msg">{errors.phone}</div>}
      </div>

      <div className="field">
        <div className="label">Email</div>
        <div className="input-wrapper">
          <input
            type="email"
            className="simple-input"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="example@mail.ru"
          />
        </div>
        {errors.email && <div className="error-msg">{errors.email}</div>}
      </div>

      <div className="navigation-buttons-bottom">
        <button className="next-btn" onClick={nextPage}>
          Далее →
        </button>
      </div>
    </div>
  )

  // Страница 2: Фото профиля
  const renderPage2 = () => (
    <div className="step-content">
      <div className="photo-section-simple">
        <div className="photo-frame-simple">
          {formData.image ? (
            <img src={formData.image} alt="Фото профиля" className="profile-photo" />
          ) : (
            <div className="photo-placeholder">
              <span>ФОТО</span>
            </div>
          )}
        </div>
        
        <button 
          className="photo-upload-btn-simple"
          onClick={() => photoInputRef.current?.click()}
        >
          {formData.image ? 'Изменить фото' : 'Загрузить фото'}
        </button>
        
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
        />
      </div>

      <div className="navigation-buttons-bottom">
        <button className="back-btn" onClick={prevPage}>
          ← Назад
        </button>
        <button className="next-btn" onClick={nextPage}>
          Далее →
        </button>
      </div>
    </div>
  )

  // Страница 3: Смена пароля
  const renderPage3 = () => (
    <div className="step-content">
      <div className="field">
        <div className="label">Новый пароль</div>
        <div className="input-wrapper">
          <input
            type="password"
            className="simple-input"
            value={formData.newPassword}
            onChange={(e) => updateField('newPassword', e.target.value)}
            placeholder="Введите новый пароль"
          />
        </div>
      </div>

      <div className="field">
        <div className="label">Подтверждение пароля</div>
        <div className="input-wrapper">
          <input
            type="password"
            className="simple-input"
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            placeholder="Повторите новый пароль"
          />
        </div>
        {errors.password && <div className="error-msg">{errors.password}</div>}
      </div>

      <div className="navigation-buttons-bottom">
        <button className="back-btn" onClick={prevPage}>
          ← Назад
        </button>
        <button 
          className="save-btn" 
          onClick={saveData}
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )

  const pages = [renderPage1, renderPage2, renderPage3]

  const getPageTitle = () => {
    switch(currentPage) {
      case 0: return 'Основная информация'
      case 1: return 'Фото профиля' 
      case 2: return 'Смена пароля'
      default: return 'Личные данные'
    }
  }

  return (
    <div className="personal-info">
      <div className="passport-content-gray">
        <div className="passport-card">
          {/* Голубой заголовок внутри карточки */}
          <div className="passport-header-blue">
            <button className='header-left' onClick={onBack}>
              <IonIcon icon={chevronBackOutline} />
            </button>
            <div className="header-title">
              {getPageTitle()}
            </div>
            <div className="header-right">
              <div className="page-circle">
                {currentPage + 1}
              </div>
            </div>
          </div>

          <div className="card-content">
            {pages[currentPage]()}
          </div>
        </div>
      </div>
    </div>
  )
}