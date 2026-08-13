import React, { useEffect, useMemo } from 'react'
import { useHistory } from 'react-router'
import styles from './ChatList.module.css'
import { useChats } from '../../Store/useChats'
import { useSocketStore } from '../../Store/socketStore'
import { WizardHeader } from '../Header/WizardHeader'

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const chatKey = (chat: { recipient: string; cargo: string }) =>
  `${chat.recipient}:${chat.cargo}`

const ChatItem = React.memo(
  ({
    chat,
    active,
    onClick,
  }: {
    chat: any
    active: boolean
    onClick: () => void
  }) => (
    <button
      type="button"
      className={`${styles.chatCard} ${active ? styles.chatCardActive : ''}`}
      onClick={onClick}
    >
      <div className={styles.avatar}>{getInitials(chat.rec_name || '?')}</div>
      <div className={styles.chatBody}>
        <div className={styles.chatTop}>
          <span className={styles.driverName}>{chat.rec_name || 'Без имени'}</span>
          {chat.last_time && (
            <span className={styles.timestamp}>{chat.last_time}</span>
          )}
        </div>
        <div className={styles.cargoName}>Груз: {chat.cargo_name}</div>
        <div className={styles.chatBottom}>
          <span className={styles.lastMessage}>
            {chat.last_message || 'Нет сообщений'}
          </span>
          {chat.unread_count > 0 && (
            <span className={styles.unreadBadge}>{chat.unread_count}</span>
          )}
        </div>
      </div>
    </button>
  )
)

type ChatsListProps = {
  activeId?: string
}

export function ChatsList({ activeId }: ChatsListProps) {
  const { filteredChats, isLoading, loadChats, setCurrentChat } = useChats()

  const history = useHistory()
  const isConnected = useSocketStore((state) => state.isConnected)

  const activeKey = useMemo(() => {
    if (!activeId) return ''
    const parts = activeId.split(':')
    if (parts.length < 2) return activeId
    return `${parts[0]}:${parts[1]}`
  }, [activeId])

  const handleChatClick = (chat: any) => {
    setCurrentChat(chat.recipient, chat.cargo)
    history.push(
      `/chats/${chat.recipient}:${chat.cargo}:${encodeURIComponent(chat.rec_name || '')}`
    )
  }

  const handleRefresh = () => {
    loadChats()
  }

  useEffect(() => {
    if (isConnected) {
      loadChats()
    }
  }, [isConnected, loadChats])

  return (
    <div className={styles.pageRoot}>
      <div className={styles.pageHeader}>
        <WizardHeader title="Диалоги" onRefresh={handleRefresh} />
      </div>

      <div className={styles.pageContent}>
        {isLoading ? (
          <div className={styles.skeleton}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonItem} />
            ))}
          </div>
        ) : (
          <div className={styles.chatList}>
            {filteredChats.map((chat) => (
              <ChatItem
                key={chatKey(chat)}
                chat={chat}
                active={activeKey === chatKey(chat)}
                onClick={() => handleChatClick(chat)}
              />
            ))}

            {filteredChats.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💬</div>
                <div>Нет активных чатов</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
