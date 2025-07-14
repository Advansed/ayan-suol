import React, { useState, useEffect } from 'react'
import { IonIcon, IonButton } from '@ionic/react'
import { arrowBackOutline } from 'ionicons/icons'
import { User } from '../types'
import { useProfileSave } from '../hooks/useProfileSave'
import { FIELD_LABELS } from '../constants'
import './personalInfo.css'

interface Props {
  user: User 
  onBack: () => void
}

export const PersonalInfo: React.FC<Props> = ({ user, onBack }) => {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || ''
  })
  const [hasChanges, setHasChanges] = useState(false)
  const { save, isSaving, error } = useProfileSave()

  useEffect(() => {
    const changed = form.name !== user.name || 
                   form.email !== user.email || 
                   form.phone !== user.phone
    setHasChanges(changed)
  }, [form, user])

  const handleSave = () => {
    if (hasChanges) save(form)
  }

  const handleReset = () => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    })
  }

  return (
    <div className="personal-info">
      <IonIcon 
        icon={arrowBackOutline} 
        className="back-icon" 
        onClick={onBack}
      />
      
      <div className="pers-content">
        <div className="title"><b>{FIELD_LABELS.TITLE}</b></div>
        
        <div className="field">
          <div className="label">{FIELD_LABELS.NAME}</div>
          <div className="pers-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">{FIELD_LABELS.EMAIL}</div>
          <div className="pers-input-wrapper">
            <input
              type="email"
              className="custom-text-input"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">{FIELD_LABELS.PHONE}</div>
          <div className="pers-input-wrapper">
            <input
              type="tel"
              className="custom-text-input"
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
            />
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        
        <div className="buttons">
          <IonButton 
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
          >
            {isSaving ? FIELD_LABELS.SAVING : FIELD_LABELS.SAVE}
          </IonButton>
          <IonButton 
            fill="outline"
            disabled={!hasChanges}
            onClick={handleReset}
          >
            {FIELD_LABELS.CANCEL}
          </IonButton>
        </div>
      </div>
    </div>
  )
}