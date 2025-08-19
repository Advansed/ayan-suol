import React, { useEffect, useMemo, useState } from 'react'
import { IonLoading } from '@ionic/react'
import { ProfileHeader } from './components/ProfileHeader'
import { ProfileStats } from './components/ProfileStats'
import { ProfileMenu } from './components/ProfileMenu'
import { Security, Notifications } from './pages/other-pages'
import { Transport } from './pages/Transport'
import { Company } from './pages/Company'
import { PROFILE_PAGES, ROLE_TYPES, MENU_ITEMS, UI_TEXT } from './constants'
import { useProfile } from './hooks/useProfile'
import { Passport } from './components/Passport/Passport'
import { PersonalInfo } from './components/PersonalInfo/PersonalInfo'

export const Profile: React.FC = () => {
  const { user, isLoading, userType } = useProfile()
  const [currentPage, setCurrentPage] = useState<number>(PROFILE_PAGES.MAIN)

  useEffect(() => {
    const loadings = document.querySelectorAll('ion-loading')
    loadings.forEach(loading => {
      loading.setAttribute('is-open', 'false')
      loading.remove()
    })
  }, [])

  const menuItems = useMemo(() => {
    const common = [
      { title: MENU_ITEMS.PERSONAL_DATA, onClick: () => setCurrentPage(PROFILE_PAGES.PERSONAL) },
      { title: MENU_ITEMS.PASSPORT, onClick: () => setCurrentPage(PROFILE_PAGES.PASSPORT) },
    ]

    return common
  }, [userType])

  if (isLoading || !user) {
    return <IonLoading isOpen={true} message={UI_TEXT.LOADING} />
  }

  // Страницы
  if (currentPage === PROFILE_PAGES.PERSONAL) {
    return <PersonalInfo user={user} onBack={() => setCurrentPage(PROFILE_PAGES.MAIN)} />
  }

  if (currentPage === PROFILE_PAGES.PASSPORT) {
    return <Passport onBack={() => setCurrentPage(PROFILE_PAGES.MAIN)} />
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
  return (
    <div>
      <div className="h-3 bg-2 flex fl-center fs-14">
        <div>{UI_TEXT.MY_PROFILE}</div>
      </div>

      <ProfileHeader user={user} userType={ userType} />

      <ProfileStats ratings={user.ratings} userType={userType} />
      
      <ProfileMenu items={menuItems} />

    </div>
  )
}