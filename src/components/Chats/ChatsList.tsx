import React            from 'react'
import { IonRefresher, IonRefresherContent, IonSearchbar } from '@ionic/react'
import { useHistory }   from 'react-router'
import styles           from './ChatList.module.css'
import { useChats } from '../../Store/useChats'
import { WizardHeader } from '../Header/WizardHeader'

// Инициалы из имени
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

// Мемоизированный элемент чата
const ChatItem = React.memo(({ chat, onClick }: { 
  chat: any
  onClick: () => void 
}) => (
  <div className={styles.chatCard} onClick={onClick}>
    <div className={styles.chatContent}>
      <div className={styles.chatInfo}>
        <div className={styles.cargoName}>Груз: {chat.cargo_name}</div>
        <div className={styles.driverLabel}>Водитель</div>
        <div className={styles.driverName}>{chat.rec_name}</div>
        {chat.last_message && (
          <div className={styles.lastMessage}>{chat.last_message}</div>
        )}
      </div>
      <div className={styles.chatMeta}>
        <div className={styles.avatar}>
          {getInitials(chat.rec_name)}
        </div>
        {chat.unread_count && chat.unread_count > 0 && (
          <div className={styles.unreadBadge}>{chat.unread_count}</div>
        )}
        {chat.last_time && (
          <div className={styles.timestamp}>{chat.last_time}</div>
        )}
      </div>
    </div>
  </div>
))

export function ChatsList() {
  const { 
    filteredChats, 
    isLoading, 
    searchQuery,
    setSearchQuery,
    loadChats,
    setCurrentChat
  } = useChats()
  
  const history = useHistory()

  const handleChatClick = (chat: any) => {
    setCurrentChat(chat.recipient, chat.cargo)
    history.push(`/tab2/${chat.recipient}:${chat.cargo}:${chat.rec_name}`)
  }

  const handleRefresh = () => {
    loadChats()
  }


  return (
    <div className='ml-1 mr-1'>
        <WizardHeader
            title       = { 'Чаты' }
            onRefresh   = { handleRefresh }
        />
      <div className={ "" }>

        { isLoading 
          ? (
              <div className={styles.skeleton}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={styles.skeletonItem} />
                ))}
              </div>
            ) 
          : (
              <div className={styles.chatList}>
                
                {filteredChats.map((chat, index) => (
                  <ChatItem
                      key={`${chat.recipient}-${chat.cargo}`}
                      chat={chat}
                      onClick={() => handleChatClick(chat)}
                  />
                ))}

                {filteredChats.length === 0 && (
                  <div className={styles.emptyState}>
                      <div className="cr-empty-icon">💬</div>
                      <div>Нет активных чатов</div>
                  </div>
                )}
              </div>
            )
        }

      </div>

   </div>
  )
}