import React, { useState, useEffect } from 'react'
import { IonIcon, IonButton } from '@ionic/react'
import { arrowBackOutline, saveOutline } from 'ionicons/icons'
import { useTransport } from '../hooks/useTransport'
import './Transport.css'

interface Props {
  onBack: () => void
}

export const Transport: React.FC<Props> = ({ onBack }) => {
  const { form, updateField, save, reset, isSaving, error, hasChanges } = useTransport()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = async () => {
    const success = await save()
    if (success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }
  }

  return (
    <div className="transport-info">
      <div className='flex'>
        <IonIcon 
          icon={arrowBackOutline} 
          className="back-icon" 
          onClick={onBack}
        />

      </div>
      
      <div className="content">
        <div className="title"><b>Информация о транспорте</b></div>

        {showSuccess && (
          <div className="success-message">
            ✓ Данные успешно сохранены
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <div className="field">
          <div className="label">Тип транспорта</div>
          <input
            type="text"
            className="custom-input"
            placeholder="Тип транспорта"
            value={form?.type || ''}
            onChange={(e) => updateField('type', e.target.value)}
          />
        </div>

        <div className="field">
          <div className="label">Грузоподъемность (т)</div>
          <input
            type="number"
            className="custom-input"
            placeholder="Грузоподъемность"
            value={form?.capacity || ''}
            onChange={(e) => updateField('capacity', Number(e.target.value))}
          />
        </div>

        <div className="field">
          <div className="label">Год выпуска</div>
          <input
            type="number"
            className="custom-input"
            placeholder="Год выпуска"
            value={form?.year || ''}
            onChange={(e) => updateField('year', Number(e.target.value))}
          />
        </div>

        <div className="field">
          <div className="label">Гос. номер</div>
          <input
            type="text"
            className="custom-input"
            placeholder="Гос. номер"
            value={form?.number || ''}
            onChange={(e) => updateField('number', e.target.value)}
          />
        </div>

        <div className="field">
          <div className="label">Стаж вождения (лет)</div>
          <input
            type="number"
            className="custom-input"
            placeholder="Стаж вождения"
            value={form?.exp || ''}
            onChange={(e) => updateField('exp', Number(e.target.value))}
          />
        </div>

        <div className="button-group">
          <IonButton 
            expand="block" 
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="save-button"
          >
            <IonIcon icon={saveOutline} slot="start" />
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </IonButton>

          {hasChanges && (
            <IonButton 
              expand="block" 
              fill="outline"
              onClick={reset}
              className="reset-button"
            >
              Отменить изменения
            </IonButton>
          )}
        </div>
      </div>
    </div>
  )
}