import React, { useMemo, useState } from 'react'
import { IonLoading, IonSegment, IonSegmentButton } from '@ionic/react'
import { ProfileHeader } from './components/ProfileHeader'
import { ProfileStats } from './components/ProfileStats'
import { ProfileMenu } from './components/ProfileMenu'
import { Security, Notifications, Transport, Company } from './pages/other-pages'
import { PROFILE_PAGES, ROLE_TYPES, MENU_ITEMS, UI_TEXT } from './constants'
import { useProfile } from './hooks/useProfile'
import { Store } from '../Store'
import { PersonalInfo } from './pages/personalInfo'

export const Profile: React.FC = () => {
  const { user, isLoading, isDriver } = useProfile()
  const [currentPage, setCurrentPage] = useState<number>( PROFILE_PAGES.MAIN )

  const menuItems = useMemo(() => {
    const common = [
      { title: MENU_ITEMS.PERSONAL_DATA, onClick: () => setCurrentPage( PROFILE_PAGES.PERSONAL) },
      { title: MENU_ITEMS.SECURITY, onClick: () => setCurrentPage(PROFILE_PAGES.SECURITY) },
      { title: MENU_ITEMS.NOTIFICATIONS, onClick: () => setCurrentPage(PROFILE_PAGES.NOTIFICATIONS) }
    ]

    if (isDriver) {
      return [
        { title: MENU_ITEMS.BUY_REQUESTS, onClick: () => {} },
        ...common.slice(0, 1),
        { title: MENU_ITEMS.TRANSPORT, onClick: () => setCurrentPage(PROFILE_PAGES.TRANSPORT) },
        ...common.slice(1)
      ]
    } else {
      return [
        common[0],
        { title: MENU_ITEMS.COMPANY, onClick: () => setCurrentPage(PROFILE_PAGES.COMPANY) },
        ...common.slice(1)
      ]
    }
  }, [isDriver])

  console.log( isLoading)
  console.log( !user )
  if (isLoading || !user) {
    console.log( "useLoading")
    return <IonLoading isOpen={true} message={UI_TEXT.LOADING} />
  }

  // Страницы
  if (currentPage === PROFILE_PAGES.PERSONAL) {
    return <PersonalInfo user={user} onBack={() => setCurrentPage(PROFILE_PAGES.MAIN)} />
  }
  if (currentPage === PROFILE_PAGES.SECURITY) {
    return <Security onBack={() => setCurrentPage(PROFILE_PAGES.MAIN)} />
  }
  if (currentPage === PROFILE_PAGES.NOTIFICATIONS) {
    return <Notifications onBack={() => setCurrentPage(PROFILE_PAGES.MAIN)} />
  }
  if (currentPage === PROFILE_PAGES.TRANSPORT) {
    return <Transport onBack={() => setCurrentPage(PROFILE_PAGES.MAIN)} />
  }
  if (currentPage === PROFILE_PAGES.COMPANY) {
    return <Company onBack={() => setCurrentPage(PROFILE_PAGES.MAIN)} />
  }

  // Главная страница
  console.log( "Главная страница")
  return (
    <div>
      <div className="h-3 bg-2 flex fl-center fs-14">
        <div>{UI_TEXT.MY_PROFILE}</div>
      </div>

      <ProfileHeader user={user} isDriver={isDriver} />
      <ProfileStats ratings={user.ratings} isDriver={isDriver} />
      <ProfileMenu items={menuItems} />

      <div className="p-bottom w-100">
        <IonSegment 
          value={isDriver ? ROLE_TYPES.DRIVER : ROLE_TYPES.CUSTOMER}
          onIonChange={e => Store.dispatch({ type: "swap" })}
        >
          <IonSegmentButton value={ROLE_TYPES.DRIVER}>{UI_TEXT.DRIVER}</IonSegmentButton>
          <IonSegmentButton value={ROLE_TYPES.CUSTOMER}>{UI_TEXT.CUSTOMER}</IonSegmentButton>
        </IonSegment>
      </div>
    </div>
  )
}

