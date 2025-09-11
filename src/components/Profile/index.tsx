import React, { useEffect, useMemo, useState }          from 'react'
import { IonLoading }                                   from '@ionic/react'
import { ProfileHeader }                                from './components/ProfileHeader'
import { ProfileStats }                                 from './components/ProfileStats'
import { ProfileMenu }                                  from './components/ProfileMenu'
import { PROFILE_PAGES, MENU_ITEMS, UI_TEXT }           from './constants'
import { Agreements }                                   from './components/Agreements/Agreements'
import { Account }                                      from './components/Account/Account'
import { useLogin }                                     from '../../Store/useLogin'
import { UserRatings }                                  from './types'
import { Company }                                      from './components/Company'
import { PersonalInfo }                                 from './components/PersonalInfo'
import { Passport }                                     from './components/Passport'
import { companyGetters,  useCompanyData }              from '../../Store/companyStore'
import { passportGetters, usePassportData }             from '../../Store/passportStore'
import { transportGetters,  useTransportData}           from '../../Store/transportStore'
import { Transport } from './components/Transport'


export const Profile: React.FC = () => {
  const { user, isLoading, updateProfile } = useLogin()
  const [currentPage, setCurrentPage] = useState<number>(PROFILE_PAGES.MAIN)
  
  // Получаем данные из Store
  const transportData = useTransportData()
  const companyData   = useCompanyData() 
  const passportData  = usePassportData()

  useEffect(() => {
    const loadings = document.querySelectorAll('ion-loading')
    loadings.forEach(loading => {
      loading.setAttribute('is-open', 'false')
      loading.remove()
    })
  }, [])

  const menuItems = useMemo(() => {
    let common: any = []
  
    // Вычисляем проценты заполненности
    const passportCompletion  = passportGetters.getCompletionPercentage()
    const transportCompletion = transportGetters.getCompletionPercentage()  
    const companyCompletion   = companyGetters.getCompletionPercentage()

  
    switch(user.user_type) {
      case 0: common = []; break;
      case 1: common = [
        { title: MENU_ITEMS.PERSONAL_DATA,  onClick: () => setCurrentPage(PROFILE_PAGES.PERSONAL) },
        { title: MENU_ITEMS.PASSPORT,       onClick: () => setCurrentPage(PROFILE_PAGES.PASSPORT),    completion: passportCompletion + ' %' },
        { title: MENU_ITEMS.COMPANY,        onClick: () => setCurrentPage(PROFILE_PAGES.COMPANY),     completion: companyCompletion + ' %' },
      ]; break;
      case 2: common = [
        { title: MENU_ITEMS.PERSONAL_DATA,  onClick: () => setCurrentPage(PROFILE_PAGES.PERSONAL) },
        { title: MENU_ITEMS.PASSPORT,       onClick: () => setCurrentPage(PROFILE_PAGES.PASSPORT),    completion: passportCompletion + ' %' },
        { title: MENU_ITEMS.COMPANY,        onClick: () => setCurrentPage(PROFILE_PAGES.COMPANY),     completion: companyCompletion + ' %' },
        { title: MENU_ITEMS.TRANSPORT,      onClick: () => setCurrentPage(PROFILE_PAGES.TRANSPORT),   completion: transportCompletion + ' %' },        
      ]; break;
      default: common = []
    }

    return common
  }, [user.user_type, passportData, transportData, companyData])

  if (isLoading ) {
    return <IonLoading isOpen={true} message={UI_TEXT.LOADING} />
  }

  // Страницы
  if (currentPage === PROFILE_PAGES.PERSONAL) {
    return <>
        <PersonalInfo 
            user    = { user }
            onBack  = {() => setCurrentPage(PROFILE_PAGES.MAIN)} 
            onSave  = { updateProfile }
        />
    </> 
  }

  if (currentPage === PROFILE_PAGES.PASSPORT) {
    return <Passport onBack = { () => setCurrentPage(PROFILE_PAGES.MAIN) } />
  }

  if (currentPage === PROFILE_PAGES.TRANSPORT) {
    return <>
        <Transport 
            onBack  = { () => setCurrentPage(PROFILE_PAGES.MAIN) } 
        
        />
    </> 
  }

  if (currentPage === PROFILE_PAGES.COMPANY) {
    return <>
        <Company 
          onBack={() => setCurrentPage(PROFILE_PAGES.MAIN) } 
        />
      </>
  }
  if (currentPage === PROFILE_PAGES.ACCOUNT) {
    return <Account onBack={() => setCurrentPage(PROFILE_PAGES.MAIN)} />
  }

  const handleClick = () => {
    setCurrentPage( PROFILE_PAGES.ACCOUNT )
  }

  // Главная страница
  return (
    <div>
      <div className="h-3 bg-2 flex fl-center fs-14">
        <div>{UI_TEXT.MY_PROFILE}</div>
      </div>

      <ProfileHeader name ={ user.name as string } userType={ user.user_type as number }  onClick={ handleClick }/>

      <ProfileStats ratings = { user.ratings as UserRatings } userType = { user.user_type as number } />
      
      <ProfileMenu items = { menuItems } />

      <Agreements />

    </div>
  )
}