import React, { useState, useEffect } from 'react'
import { IonIcon, IonButton } from '@ionic/react'
import { arrowBackOutline } from 'ionicons/icons'
import { usePassport } from './usePassport'
import './Passport.css'

interface Props {
  onBack: () => void
}

export const Passport: React.FC<Props> = ({ onBack }) => {
  const { passportData, save, load, isSaving, error } = usePassport()
  
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
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
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

  useEffect(() => {
    const changed = form.series !== (passportData?.series || '') ||
                   form.number !== (passportData?.number || '') ||
                   form.issueDate !== (passportData?.issueDate || '') ||
                   form.issuedBy !== (passportData?.issuedBy || '') ||
                   form.birthDate !== (passportData?.birthDate || '') ||
                   form.birthPlace !== (passportData?.birthPlace || '') ||
                   form.regAddress !== (passportData?.regAddress || '') ||
                   form.actualAddress !== (passportData?.actualAddress || '') ||
                   form.passportPhoto !== (passportData?.passportPhoto || '') ||
                   form.passportRegPhoto !== (passportData?.passportRegPhoto || '')
    setHasChanges(changed)
  }, [form, passportData])

  const handleSave = () => {
    if (hasChanges) save(form)
  }

  const handleReset = () => {
    setForm({
      series: passportData?.series || '',
      number: passportData?.number || '',
      issueDate: passportData?.issueDate || '',
      issuedBy: passportData?.issuedBy || '',
      birthDate: passportData?.birthDate || '',
      birthPlace: passportData?.birthPlace || '',
      regAddress: passportData?.regAddress || '',
      actualAddress: passportData?.actualAddress || '',
      passportPhoto: passportData?.passportPhoto || '',
      passportRegPhoto: passportData?.passportRegPhoto || ''
    })
  }

  return (
    <div className="passport-info">
      <IonIcon 
        icon={arrowBackOutline} 
        className="back-icon" 
        onClick={onBack}
      />
      
      <div className="passport-content">
        <div className="title"><b>Паспортные данные</b></div>
        
        <div className="field">
          <div className="label">Серия</div>
          <div className="passport-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              placeholder="ХХХХ"
              maxLength={4}
              value={form.series}
              onChange={e => setForm({...form, series: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Номер</div>
          <div className="passport-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              placeholder="ХХХХХХ"
              maxLength={6}
              value={form.number}
              onChange={e => setForm({...form, number: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Дата выдачи</div>
          <div className="passport-input-wrapper">
            <input
              type="date"
              className="custom-text-input"
              value={form.issueDate}
              onChange={e => setForm({...form, issueDate: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Кем выдан</div>
          <div className="passport-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              placeholder="Наименование органа"
              value={form.issuedBy}
              onChange={e => setForm({...form, issuedBy: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Дата рождения</div>
          <div className="passport-input-wrapper">
            <input
              type="date"
              className="custom-text-input"
              value={form.birthDate}
              onChange={e => setForm({...form, birthDate: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Место рождения</div>
          <div className="passport-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              placeholder="Место рождения"
              value={form.birthPlace}
              onChange={e => setForm({...form, birthPlace: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Адрес регистрации</div>
          <div className="passport-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              placeholder="Адрес регистрации по паспорту"
              value={form.regAddress}
              onChange={e => setForm({...form, regAddress: e.target.value})}
            />
          </div>
        </div>
        
        <div className="field">
          <div className="label">Фактический адрес</div>
          <div className="passport-input-wrapper">
            <input
              type="text"
              className="custom-text-input"
              placeholder="Фактический адрес проживания"
              value={form.actualAddress}
              onChange={e => setForm({...form, actualAddress: e.target.value})}
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