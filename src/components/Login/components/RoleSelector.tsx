// src/components/Login/components/RoleSelector.tsx

import React, { useCallback } from 'react'
import { IonSegment, IonSegmentButton } from '@ionic/react'
import { UseAuthReturn } from '../types'
import { FormButtons, NavigationLinks } from '../SharedComponents'

interface RoleSelectorProps {
  auth: UseAuthReturn
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ auth }) => {
  const handleNext = useCallback(() => {
    if (auth.formData.userType) {
      auth.updateRegistrationData('userType', auth.formData.userType)
      auth.nextRegistrationStep()
    }
  }, [auth])

  const navigationLinks = [{
    text: 'Есть аккаунт? Авторизироваться',
    onClick: auth.showLoginForm
  }]

  return (
    <div className="step-role-selection">
      <div className="a-center">
        <h2>Кто вы?</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        Выберите ваш тип аккаунта
      </div>

      <div className="mt-2 mb-2">
        <IonSegment
          value={auth.formData.userType || ''}
          onIonChange={e => auth.updateFormData('userType', e.detail.value)}
        >
          <IonSegmentButton value="1">
            <div>
              <div>📦</div>
              <div>Заказчик</div>
            </div>
          </IonSegmentButton>
          <IonSegmentButton value="2">
            <div>
              <div>🚛</div>
              <div>Водитель</div>
            </div>
          </IonSegmentButton>
          <IonSegmentButton value="0">
            <div>
              <div>🚛</div>
              <div>Партнер</div>
            </div>
          </IonSegmentButton>
        </IonSegment>
      </div>

      <FormButtons
        onNext={handleNext}
        nextText="Продолжить"
        disabled={!auth.formData.userType}
      />

      <NavigationLinks links={navigationLinks} />
    </div>
  )
}