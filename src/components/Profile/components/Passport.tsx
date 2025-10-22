import React, { useCallback, useEffect } from 'react'
import { PageData } from '../../DataEditor/types'
import { PassportData, usePassportStore } from '../../../Store/passportStore'
import DataEditor from '../../DataEditor'
import { useToast } from '../../Toast'
import { useLoginStore, useToken } from '../../../Store/loginStore'
import { useSocket } from '../../../Store/useSocket'

interface Props {
  onBack: () => void
}

export const Passport: React.FC<Props> = ({ onBack }) => {
  const { passportData, save, load, isLoading } = useData()

  const agreements  = useLoginStore(state => state.agreements)
  
  const toast       = useToast()

  useEffect(() => {
    if(!passportData)
      load()
  }, [load])

  useEffect(()=>{
    if(!agreements.personalData){
      onBack()
      toast.info("Сперва надо принять согласие на обработку персональных данных")
    }
  },[])

  const getFormData = (passport?: PassportData | null): PageData => [
    {
      title: 'Паспортные данные',
      data: [
        { label: 'Серия',               type: 'string',     data: passport?.series      || '', validate: true },
        { label: 'Номер',               type: 'string',     data: passport?.number      || '', validate: true },
        { label: 'Дата выдачи',         type: 'date',       data: passport?.issue_date  || '', validate: true },
        { label: 'Кем выдан',           type: 'string',     data: passport?.issued_by   || '', validate: true }
      ]
    },
    {
      title: 'Персональные данные',
      data: [
        { label: 'Дата рождения',       type: 'date',       data: passport?.birth_date  || '', validate: true },
        { label: 'Место рождения',      type: 'string',     data: passport?.birth_place || '', validate: true }
      ]
    },
    {
      title: 'Адресные данные',
      data: [
        { label: 'Адрес регистрации',   type: 'address',    data: passport?.reg_address || '', validate: true },
        { label: 'Фактический адрес',   type: 'address',    data: passport?.act_address || '', validate: true }
      ]
    },
    {
      title: 'Документы',
      data: [
        { label: 'Фото паспорта',       type: 'images',     data: passport?.main_photo  || '', validate: true },
        { label: 'Фото регистрации',    type: 'images',     data: passport?.reg_photo   || '', validate: true }
      ]
    }
  ]

  const handleSave = (data: PageData) => {
    const formData: PassportData = {
      series:       data[0].data[0].data,
      number:       data[0].data[1].data,
      issue_date:   data[0].data[2].data,
      issued_by:    data[0].data[3].data,
      birth_date:   data[1].data[0].data,
      birth_place:  data[1].data[1].data,
      reg_address:  data[2].data[0].data,
      act_address:  data[2].data[1].data,
      main_photo:   data[3].data[0].data,
      reg_photo:    data[3].data[1].data
    }
    save(formData)
    onBack()
  }

  if (isLoading) return <div>Загрузка...</div>

  return (
    <DataEditor
      data={getFormData(passportData)}
      onSave={handleSave}
      onBack={onBack}
    />
  )
}

const useData = () => {

  const token               = useToken()
  const { socket }          = useSocket()
  const toast               = useToast()
  
  const passportData        = usePassportStore(state => state.data)
  const isLoading           = usePassportStore(state => state.isLoading)
  const setLoading          = usePassportStore(state => state.setLoading)
  const setData             = usePassportStore(state => state.setData)
  
  
  const load                = useCallback(() => {
    setLoading(true)
            
    if (!socket) {
      toast.error('Нет подключения')
      setLoading(false)
      return
    }

    socket.emit('get_passport', { token })
        
  }, [token, socket ])
  
  const save                = useCallback((data: PassportData) => {
    setLoading(true)

    if (!socket) {
      toast.error('Нет подключения')
      setLoading(false)
      return
    }

    if (!token) {
      toast.error('Нет токена авторизации')
      setLoading(false)
      return
    }

    socket.once('set_passport', (response) => {
      setLoading(false)
      if (response.success) {
        toast.success('Паспортные данные сохранены')
        setData(response.data || data)
      } else {
        toast.error(response.message || "Ошибка сохранения данных")
      }
    })

    socket.emit('set_passport', { ...data, token })

    toast.info("Сохраняются паспортные данные...")
  }, [token, socket ])
  
  const updatePassportData  = useCallback((data: PassportData) => {
    setData(data)
  }, [])
  
  return {
    passportData,
    load,
    save,
    updatePassportData,
    isLoading
  }

}