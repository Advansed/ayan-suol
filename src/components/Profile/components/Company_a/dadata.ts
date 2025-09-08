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
  private readonly apiKey = '50bfb3453a528d091723900fdae5ca5a30369832'
  private readonly secretKey = '050209ff2af5411fac79a59ff57e91f10466fa9e'
  private readonly baseUrl = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs'

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
          'X-Secret': this.secretKey
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
}

export const dadataService = new DadataService()
export type { DadataCompany }