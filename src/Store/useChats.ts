// src/Store/useChats.ts
import { useCallback, useEffect, useMemo } from 'react'
import { useSocket } from './useSocket'
import { useToast } from '../components/Toast'
import { useToken } from './loginStore'
import { useSocketStore } from './socketStore'
import { 
  useChatStore,
  ChatMessage,
  ChatItem,
  chatGetters,
  chatActions
} from './chatStore'

// ============================================
// ТИПЫ
// ============================================
export interface UseChatsReturn {
  chats:            ChatItem[]
  isLoading:        boolean
  searchQuery:      string
  filteredChats:    ChatItem[]
  unreadCount:      number
  currentMessages?: ChatMessage[]
  currentLoading?:  boolean
  currentHasMore?:  boolean
  
  // Actions
  setSearchQuery:       ( query: string ) => void
  loadChats:            ( ) => Promise<void>
  loadMessages:         ( recipient: string, cargo: string, loadMore?: boolean ) => Promise<void>
  sendMessage:          ( recipient: string, cargo: string, message: string, image: string ) => Promise<boolean>
  sendImage:            ( recipient: string, cargo: string, imageFile: string ) => Promise<boolean>
  markAsRead:           ( recipient: string, cargo: string, guids: {guid:string}[] ) => Promise<void>
  setCurrentChat:       ( recipient: string, cargo: string ) => void
  clearCurrentChat:     ( ) => void
  refresh:              ( ) => void
}

// ============================================
// КОНСТАНТЫ
// ============================================
const SOCKET_EVENTS = {
  GET_CHATS:    'get_chats',
  GET_MESSAGES: 'get_messages',
  SEND_MESSAGE: 'send_message',
  MARK_AS_READ: 'mark_as_read'
}

const MESSAGES_LIMIT = 50

// ============================================
// HOOK
// ============================================
export const useChats = (): UseChatsReturn => {

  const token           = useToken()
  const { emit }        = useSocket()
  const toast           = useToast()
  const isConnected     = useSocketStore(state => state.isConnected)

  // Селекторы из chatStore
  const chats           = useChatStore(state => state.chats)
  const isLoading       = useChatStore(state => state.isLoading)
  const searchQuery     = useChatStore(state => state.searchQuery)
  const currentChat     = useChatStore(state => state.currentChat)



  useEffect(()=>{
  },[currentChat])

  // Загрузка списка чатов
  const loadChats = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      toast.error('Нет соединения с сервером')
      return
    }

    if (!token) {
      toast.error('Нет токена авторизации')
      return
    }

    chatActions.setLoading(true)

    try {
      emit(SOCKET_EVENTS.GET_CHATS, { token })
    } catch (error) {
      toast.error('Ошибка загрузки чатов')
      chatActions.setLoading(false)
    }
  }, [isConnected, token, emit, toast])

  // Загрузка сообщений
  const loadMessages = useCallback(async (
    recipient:  string, 
    cargo:      string, 
    loadMore:   boolean = false
  ): Promise<void> => {
    if (!isConnected || !token) return

    const chat = chatGetters.getChat(recipient, cargo)
    const offset = loadMore ? chat?.messages?.length || 0 : 0

    if (!loadMore) {
      chatActions.setMessagesLoading(recipient, cargo, true)
    }

    try {
      emit(SOCKET_EVENTS.GET_MESSAGES, {
        token,
        recipient,
        cargo,
        limit: MESSAGES_LIMIT,
        offset
      })
    } catch (error) {
      toast.error('Ошибка загрузки сообщений')
      chatActions.setMessagesLoading(recipient, cargo, false)
    }
  }, [isConnected, token, emit, toast])

  // Отправка сообщения
  const sendMessage = useCallback(async (
    recipient:  string, 
    cargo:      string, 
    message:    string,
    image:      string
  ): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Нет соединения с сервером')
      return false
    }

    if (!token) {
      toast.error('Нет токена авторизации')
      return false
    }

    if (!message.trim() && !image) {
      toast.error('Сообщение не может быть пустым')
      return false
    }

    try {
      emit(SOCKET_EVENTS.SEND_MESSAGE, {
          token,
          recipient,
          cargo,
          message: message.trim(),
          image
      })
      return true
    } catch (error) {
      toast.error('Ошибка отправки сообщения')
      return false
    }
  }, [isConnected, token, emit, toast])

  // Отправка изображения через HTTP
  const sendImage = useCallback(async (
    recipient: string,
    cargo: string,
    imageFile: string
  ): Promise<boolean> => {
    if (!token) {
      toast.error('Нет токена авторизации')
      return false
    }

    const formData = new FormData()
    formData.append('recipient', recipient)
    formData.append('cargo', cargo)
    formData.append('image', imageFile)
    formData.append('token', token)

    try {
      const response = await fetch('/api/sendImage', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        emit("get_chats", {token: token})
        emit("get_messages", {token: token, cargo: cargo, recipient: recipient})
        return true
      } else {
        toast.error(result.message || 'Ошибка отправки')
        return false
      }
    } catch (error) {
      toast.error('Ошибка отправки изображения')
      return false
    }
  }, [token, toast])


  // Пометить как прочитанное
  const markAsRead = useCallback(async (recipient: string, cargo: string, guids:{ guid: string }[]): Promise<void> => {
    if (!isConnected || !token) return

    try {
      emit(SOCKET_EVENTS.MARK_AS_READ, { token, guids })
      chatActions.markAsRead(recipient, cargo)
    } catch (error) {
      console.error('Ошибка отметки как прочитанного:', error)
    }
  }, [isConnected, token, emit])

  // Установить текущий чат
  const setCurrentChat = useCallback((recipient: string, cargo: string) => {
    chatActions.setCurrentChat(recipient, cargo)
  }, [])

  // Очистить текущий чат
  const clearCurrentChat = useCallback(() => {
    chatActions.clearCurrentChat()
  }, [])

  // Обновление данных
  const refresh = useCallback(() => {
    loadChats()
  }, [loadChats])

  // Фильтрованные чаты
  const filteredChats = useMemo(() => 
    chatGetters.getFilteredChats(searchQuery),
    [chats, searchQuery]
  )

  // Количество непрочитанных
  const unreadCount = useMemo(() => 
    chatGetters.getUnreadCount(),
    [chats]
  )

  // Текущие сообщения и состояние
  const currentChatData = useMemo(() => {
    if (!currentChat) return undefined
    
    return chatGetters.getChat(currentChat.recipient, currentChat.cargo)
  }, [currentChat, chats])

  const currentMessages = currentChatData?.messages
  const currentLoading = currentChatData?.isLoading
  const currentHasMore = currentChatData?.hasMore

  return {
    chats,
    isLoading,
    searchQuery,
    filteredChats,
    unreadCount,
    currentMessages,
    currentLoading,
    currentHasMore,
    
    setSearchQuery: chatActions.setSearchQuery,
    loadChats,
    loadMessages,
    sendMessage,
    sendImage,
    markAsRead,
    setCurrentChat,
    clearCurrentChat,
    refresh
  }
}