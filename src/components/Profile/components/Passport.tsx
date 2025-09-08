import React, { useEffect } from 'react'
import { usePassport } from '../../../Store/usePassport'
import { PageData } from '../../DataEditor/types'
import { PassportData } from '../../../Store/passportStore'
import DataEditor from '../../DataEditor'

interface Props {
  onBack: () => void
}

export const Passport: React.FC<Props> = ({ onBack }) => {
  const { passportData, save, load, isLoading } = usePassport()

  useEffect(() => {
    load()
  }, [load])

  const getFormData = (passport?: PassportData | null): PageData => [
    {
      title: 'Паспортные данные',
      data: [
        { label: 'Серия',               type: 'string',     data: passport?.series || '', validate: true },
        { label: 'Номер',               type: 'string',     data: passport?.number || '', validate: true },
        { label: 'Дата выдачи',         type: 'date',       data: passport?.issue_date || '', validate: true },
        { label: 'Кем выдан',           type: 'string',     data: passport?.issued_by || '', validate: true }
      ]
    },
    {
      title: 'Персональные данные',
      data: [
        { label: 'Дата рождения',       type: 'date',       data: passport?.birth_date || '', validate: true },
        { label: 'Место рождения',      type: 'string',     data: passport?.birth_place || '', validate: true }
      ]
    },
    {
      title: 'Адресные данные',
      data: [
        { label: 'Адрес регистрации',   type: 'string',     data: passport?.reg_address || '', validate: true },
        { label: 'Фактический адрес',   type: 'string',     data: passport?.act_address || '', validate: true }
      ]
    },
    {
      title: 'Документы',
      data: [
        { label: 'Фото паспорта',       type: 'images',     data: passport?.main_photo || '', validate: true },
        { label: 'Фото регистрации',    type: 'images',     data: passport?.reg_photo || '', validate: true }
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