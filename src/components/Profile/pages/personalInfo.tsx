import React, { useState, useEffect } from 'react'
import { IonIcon, IonInput, IonButton } from '@ionic/react'
import { arrowBackOutline } from 'ionicons/icons'
import { User } from '../types'
import { useProfileSave } from '../hooks/useProfileSave'
import { FIELD_LABELS } from '../constants'

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
    <div>
      <IonIcon 
        icon={arrowBackOutline} 
        className="ml-1 mt-1 w-15 h-15" 
        onClick={onBack}
      />
      
      <div className="mt-1 ml-1 mr-1 fs-09">
        <div className="fs-12"><b>{FIELD_LABELS.TITLE}</b></div>
        
        <div className="mt-1">
          <div>{FIELD_LABELS.NAME}</div>
          <div className="c-input">
            <IonInput
              value={form.name}
              onIonInput={e => setForm({...form, name: e.detail.value!})}
            />
          </div>
        </div>
        
        <div className="mt-05">
          <div>{FIELD_LABELS.EMAIL}</div>
          <div className="c-input">
            <IonInput
              type="email"
              value={form.email}
              onIonInput={e => setForm({...form, email: e.detail.value!})}
            />
          </div>
        </div>
        
        <div className="mt-05">
          <div>{FIELD_LABELS.PHONE}</div>
          <div className="c-input">
            <IonInput
              type="tel"
              value={form.phone}
              onIonInput={e => setForm({...form, phone: e.detail.value!})}
            />
          </div>
        </div>

        {error && <div className="c-red mt-1">{error}</div>}
        
        <div className="flex mt-1">
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
