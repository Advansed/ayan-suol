interface DadataCompany {
  inn: string
  kpp?: string
  ogrn?: string
  name: {
    full: string
    short?: string
  }
  address: {
    value: string
  }
  status: string
}

interface DadataResponse {
  suggestions: Array<{
    value: string
    data: DadataCompany
  }>
}

class DadataService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs'

  constructor() {
    // TODO: Получить API ключ из переменных окружения
    this.apiKey = process.env.REACT_APP_DADATA_API_KEY || ''
  }

  // Поиск компании по ИНН
  async findByInn(inn: string): Promise<DadataCompany | null> {
    if (!inn || inn.length < 10) {
      throw new Error('ИНН должен содержать минимум 10 цифр')
    }

    try {
      const response = await fetch(`${this.baseUrl}/findById/party`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.apiKey}`,
          'X-Secret': process.env.REACT_APP_DADATA_SECRET || ''
        },
        body: JSON.stringify({
          query: inn,
          count: 1
        })
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data: DadataResponse = await response.json()
      
      if (data.suggestions && data.suggestions.length > 0) {
        return data.suggestions[0].data
      }

      return null
    } catch (error) {
      console.error('Ошибка поиска по ИНН:', error)
      throw error
    }
  }

  // Поиск компаний по названию
  async findByName(name: string): Promise<DadataCompany[]> {
    if (!name || name.length < 3) {
      throw new Error('Название должно содержать минимум 3 символа')
    }

    try {
      const response = await fetch(`${this.baseUrl}/suggest/party`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.apiKey}`
        },
        body: JSON.stringify({
          query: name,
          count: 10
        })
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data: DadataResponse = await response.json()
      
      return data.suggestions?.map(suggestion => suggestion.data) || []
    } catch (error) {
      console.error('Ошибка поиска по названию:', error)
      throw error
    }
  }
}

export const dadataService = new DadataService()
export type { DadataCompany }