import { useState, useEffect, useCallback } from 'react'
import socketService from '../Sockets'
import { Store } from '../Store'

export interface ChatItem {
  recipient: string
  cargo: string
  rec_name: string
  cargo_name: string
  last_message?: string
  last_time?: string
  unread_count?: number
}

export interface UseChatListReturn {
  chats: ChatItem[]
  isLoading: boolean
  searchQuery: string
  filteredChats: ChatItem[]
  setSearchQuery: (query: string) => void
  refresh: (event?: CustomEvent) => void
  loadChats: () => void
}

export const useChatList = (): UseChatListReturn => {
  const [chats, setChats] = useState<ChatItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Загрузка чатов
  const loadChats = useCallback(() => {
    const socket = socketService.getSocket()
    if (socket) {
      setIsLoading(true)
      socket.emit('get_chats', {
        token: Store.getState().login.token
      })
    }
  }, [])

  // Обновление списка
  const refresh = useCallback((event?: CustomEvent) => {
    loadChats()
    if (event) {
      event.detail.complete()
    }
  }, [loadChats])

  // Фильтрация чатов
  const filteredChats = useCallback(() => {
    if (!searchQuery.trim()) return chats
    
    return chats.filter(chat => 
      chat.rec_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.cargo_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [chats, searchQuery])()

  // Подключение к сокету
  useEffect(() => {
    const socket = socketService.getSocket()
    
    if (socket) {
      const handleChatsData = (res: any) => {
        setIsLoading(false)
        if (res.success) {
          setChats(res.data || [])
        }
      }

      socket.on('get_chats', handleChatsData)
      loadChats()

      return () => {
        socket.off('get_chats', handleChatsData)
      }
    }
  }, [loadChats])

  return {
    chats,
    isLoading,
    searchQuery,
    filteredChats,
    setSearchQuery,
    refresh,
    loadChats
  }
}