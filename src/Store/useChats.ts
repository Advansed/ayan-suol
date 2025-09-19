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

  // Стабильные функции
  const stableEmit      = useCallback(emit, [])
  const stableToast     = useMemo(() => ({
    error:    toast.error,
    success:  toast.success,
    info:     toast.info
  }), [])

  useEffect(()=>{
  },[currentChat])

  // Загрузка списка чатов
  const loadChats = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      stableToast.error('Нет соединения с сервером')
      return
    }

    if (!token) {
      stableToast.error('Нет токена авторизации')
      return
    }

    chatActions.setLoading(true)

    try {
      stableEmit(SOCKET_EVENTS.GET_CHATS, { token })
    } catch (error) {
      stableToast.error('Ошибка загрузки чатов')
      chatActions.setLoading(false)
    }
  }, [isConnected, token, stableEmit, stableToast])

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
      stableEmit(SOCKET_EVENTS.GET_MESSAGES, {
        token,
        recipient,
        cargo,
        limit: MESSAGES_LIMIT,
        offset
      })
    } catch (error) {
      stableToast.error('Ошибка загрузки сообщений')
      chatActions.setMessagesLoading(recipient, cargo, false)
    }
  }, [isConnected, token, stableEmit, stableToast])

  // Отправка сообщения
  const sendMessage = useCallback(async (
    recipient:  string, 
    cargo:      string, 
    message:    string,
    image:      string
  ): Promise<boolean> => {
    if (!isConnected) {
      stableToast.error('Нет соединения с сервером')
      return false
    }

    if (!token) {
      stableToast.error('Нет токена авторизации')
      return false
    }

    if (!message.trim() && !image) {
      stableToast.error('Сообщение не может быть пустым')
      return false
    }

    try {
      stableEmit(SOCKET_EVENTS.SEND_MESSAGE, {
          token,
          recipient,
          cargo,
          message: message.trim(),
          image
      })
      return true
    } catch (error) {
      stableToast.error('Ошибка отправки сообщения')
      return false
    }
  }, [isConnected, token, stableEmit, stableToast])

  // Пометить как прочитанное
  const markAsRead = useCallback(async (recipient: string, cargo: string, guids:{ guid: string }[]): Promise<void> => {
    if (!isConnected || !token) return

    try {
      stableEmit(SOCKET_EVENTS.MARK_AS_READ, { token, guids })
      chatActions.markAsRead(recipient, cargo)
    } catch (error) {
      console.error('Ошибка отметки как прочитанного:', error)
    }
  }, [isConnected, token, stableEmit])

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
    markAsRead,
    setCurrentChat,
    clearCurrentChat,
    refresh
  }
}