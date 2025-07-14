import React, { useState, useEffect } from 'react'
import { IonIcon, IonButton } from '@ionic/react'
import { arrowBackOutline } from 'ionicons/icons'
import { useTransportSave } from '../hooks/useTransport'
import './Transport.css'

interface Props {
  onBack: () => void
}

interface TransportData {
  type: string
  capacity: string
  year: string
  number: string
  exp: string
}

export const Transport: React.FC<Props> = ({ onBack }) => {
  const { transport, save, isSaving, error } = useTransportSave()
  
  const [form, setForm] = useState<TransportData>({
    type: transport?.type || '',
    capacity: transport?.capacity?.toString() || '',
    year: transport?.year?.toString() || '',
    number: transport?.number || '',
    exp: transport?.exp?.toString() || ''
  })
  
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const changed = 
      form.type !== (transport?.type || '') ||
      form.capacity !== (transport?.capacity?.toString() || '') ||
      form.year !== (transport?.year?.toString() || '') ||
      form.number !== (transport?.number || '') ||
      form.exp !== (transport?.exp?.toString() || '')
    setHasChanges(changed)
  }, [form, transport])

  const handleSave = () => {
    if (hasChanges) {
      save({
        type: form.type,
        capacity: Number(form.capacity) || 0,
        year: Number(form.year) || 0,
        number: form.number,
        exp: Number(form.exp) || 0
      })
    }
  }

  const handleReset = () => {
    setForm({
      type: transport?.type || '',
      capacity: transport?.capacity?.toString() || '',
      year: transport?.year?.toString() || '',
      number: transport?.number || '',
      exp: transport?.exp?.toString() || ''
    })
  }

  return (
    <div className="transport-info">
      <IonIcon 
        icon={arrowBackOutline} 
        className="back-icon" 
        onClick={onBack}
      />
      
      <div className="content">
        <div className="title"><b>Информация о транспорте</b></div>
        
        <div className="field">
          <div className="label">Тип транспорта</div>
          <div className="trans-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              placeholder="Например: Грузовик"
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Грузоподъемность (тонн)</div>
          <div className="trans-input-wrapper">
            <input
              type="number"
              className="custom-text-input"
              placeholder="0"
              value={form.capacity}
              onChange={e => setForm({...form, capacity: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Год выпуска</div>
          <div className="trans-input-wrapper">
            <input
              type="number"
              className="custom-text-input"
              placeholder="2020"
              value={form.year}
              onChange={e => setForm({...form, year: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Гос. номер</div>
          <div className="trans-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              placeholder="А123БВ 777"
              value={form.number}
              onChange={e => setForm({...form, number: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Опыт вождения (лет)</div>
          <div className="trans-input-wrapper">
            <input
              type="number"
              className="custom-text-input"
              placeholder="0"
              value={form.exp}
              onChange={e => setForm({...form, exp: e.target.value})}
            />
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        
        <div className="buttons">
          <IonButton 
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </IonButton>
          <IonButton 
            fill="outline"
            disabled={!hasChanges}
            onClick={handleReset}
          >
            Отменить
          </IonButton>
        </div>
      </div>
    </div>
  )
}