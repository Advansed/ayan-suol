import React, { useState, useEffect } from 'react'
import { IonIcon, IonInput, IonTextarea, IonButton } from '@ionic/react'
import { arrowBackOutline, saveOutline } from 'ionicons/icons'
import { useOrgs } from '../hooks/useOrgs'
import './Company.css'

interface Props {
  onBack: () => void
}

export const Company: React.FC<Props> = ({ onBack }) => {
  const { orgInfo, updateField, save, isSaving, error } = useOrgs()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = async () => {
    const success = await save()
    if (success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }
  }

  return (
    <div className="company-info">
      <IonIcon 
        icon={arrowBackOutline} 
        className="back-icon" 
        onClick={onBack}
      />
      
      <div className="content">
        <div className="title"><b>Информация о компании</b></div>

        {showSuccess && (
          <div className="success-message">
            ✓ Данные успешно сохранены
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="field">
          <div className="label">ИНН</div>
          <input
            type="text"
            className="custom-input"
            placeholder="ИНН"
            value={orgInfo?.inn || ''}
            onChange={(e) => updateField('inn', e.target.value)}
          />
        </div>

        <div className="field">
          <div className="label">Наименование</div>
          <input
            type="text"
            className="custom-input"
            placeholder="Наименование компании"
            value={orgInfo?.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>

        <div className="field">
          <div className="label">КПП</div>
          <input
            type="text"
            className="custom-input"
            placeholder="КПП"
            value={orgInfo?.kpp || ''}
            onChange={(e) => updateField('kpp', e.target.value)}
          />
        </div>

        <div className="field">
          <div className="label">Адрес</div>
          <input
            type="text"
            className="custom-input"
            placeholder="Адрес"
            value={orgInfo?.address || ''}
            onChange={(e) => updateField('address', e.target.value)}
          />
        </div>

        <div className="field">
          <div className="label">Описание</div>
          <textarea
            className="custom-textarea"
            placeholder="Описание"
            value={orgInfo?.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
          />
        </div>

        <IonButton 
          expand="block" 
          onClick={handleSave}
          disabled={isSaving}
          className="save-button"
        >
          <IonIcon icon={saveOutline} slot="start" />
          {isSaving ? 'Сохранение...' : 'Сохранить данные'}
        </IonButton>
      </div>
    </div>
  )
}