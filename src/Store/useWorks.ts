// src/Store/useWorks.ts
import { useCallback, useState }    from 'react'
import { useToast }       from '../components/Toast'
import { useSocket }      from './useSocket'
import { loginGetters, useToken }   from './loginStore'
import { useSocketStore } from './socketStore'
import { useWorkStore, workActions, workGetters } 
                          from './workStore'
import { WorkInfo, WorkFilters, OfferInfo, WorkStatus } 
                          from '../components/Works/types'

export const useWorks = () => {
    const token             = useToken()
    const { socket }        = useSocket()
    const toast             = useToast()

    // ============================================
    // СОСТОЯНИЕ
    // ============================================
    const works             = useWorkStore(state => state.works)
    const archiveWorks      = useWorkStore(state => state.archiveWorks)
    const isLoading         = useWorkStore(state => state.isLoading)
    const isArchiveLoading  = useWorkStore(state => state.isArchiveLoading)
    const filters           = useWorkStore(state => state.filters)
    const searchQuery       = useWorkStore(state => state.searchQuery)
    
    const [ contract, setContract ] = useState<any>()

    // ============================================
    // ФИЛЬТРЫ И ПОИСК
    // ============================================
    const setFilters        = useCallback((newFilters: WorkFilters) => {
      workActions.setFilters(newFilters)
    }, [])

    const setSearchQuery    = useCallback((query: string) => {
      workActions.setSearchQuery(query)
    }, [])

    // ============================================
    // ОПЕРАЦИИ С ПРЕДЛОЖЕНИЯМИ
    // ============================================
    const setOffer = useCallback(async (data: OfferInfo): Promise<boolean> => {
      if (!socket) {
        toast.error('Нет соединения с сервером');
        return false;
      }

      workActions.setLoading(true);
      
      return new Promise((resolve) => {
        try {
          const offerData = {
            ...data,
            createdAt: new Date().toISOString()
          };

          // Обработчик однократного ответа от сервера
          const handleOfferResponse = (response: { success: boolean; error?: string }) => {
            if (response.success) {
              toast.success('Предложение успешно создано');
                      
              resolve(true);
            } else {
              toast.error(response.error || 'Ошибка создания предложения');
              resolve(false);
            }
          };

          // Подписываемся на ответ от сервера
          socket.once('set_offer', handleOfferResponse);
          
          // Отправляем запрос на сервер
          socket.emit('set_offer', { token, ...offerData });

          // Таймаут на случай, если ответ не придет
          setTimeout(() => {
            toast.error('Таймаут ожидания ответа от сервера');
            resolve(false);
          }, 10000); // 10 секунд таймаут

        } catch (error) {
          console.error('Error creating offer:', error);
          toast.error('Ошибка создания предложения');
          resolve(false);
        } finally {
          workActions.setLoading(false);
        }
      });
    }, [ token ]);
      
    const setStatus = useCallback(async (work: WorkInfo): Promise<boolean> => {
      if (!socket) {
        toast.error('Нет соединения с сервером');
        return false;
      }

      workActions.setLoading(true);
      
      return new Promise((resolve) => {
        try {
          const offerData = {
            guid: work.guid,
            recipient: work.recipient,
            status: nextStatus(work.status),
            createdAt: new Date().toISOString()
          };
          
          // Обработчик однократного ответа от сервера
          const handleStatusResponse = (response: { success: boolean; error?: string }) => {
            if (response.success) {
              toast.success('Статус успешно обновлен');
                
              resolve(true);
            } else {
              toast.error(response.error || 'Ошибка обновления статуса');
              resolve(false);
            }
          };

          // Подписываемся на ответ от сервера
          socket.once('set_status', handleStatusResponse);
          
          // Отправляем запрос на сервер
          toast.info("Отправка статуса...");
          socket.emit('set_status', { token, ...offerData });

          // Таймаут на случай, если ответ не придет
          setTimeout(() => {
            toast.error('Таймаут ожидания ответа от сервера');
            resolve(false);
          }, 10000); // 10 секунд таймаут

        } catch (error) {
          console.error('Error creating offer:', error);
          toast.error('Ошибка создания предложения');
          resolve(false);
        } finally {
          workActions.setLoading(false);
        }
      });
    }, [token]);
      
    const setDeliver        = useCallback(async (data: Partial<OfferInfo>): Promise<boolean> => {
      if (!socket) {
        toast.error('Нет соединения с сервером')
        return false
      }

      workActions.setLoading(true)
      try {
        const offerData = {
          ...data,
          status: 'pending',
          createdAt: new Date().toISOString()
        }

        socket.emit('delivered', { token, ...offerData })
        return true
      } catch (error) {
        console.error('Error creating offer:', error)
        toast.error('Ошибка создания предложения')
        return false
      } finally {
        workActions.setLoading(false)
      }
    }, [token])

 
    const get_contract = useCallback(async (info: WorkInfo ) => {
        
        if (!socket) {
          toast.error('Нет соединения с сервером')
          return false
        }

        workActions.setLoading(true);
                
        socket.once('get_pdf1', (data: { success: boolean; message?: string; data:any }) => {
            console.log("get_pdf1", data)
            if (data.success) {
                
               setContract( 'data:application/pdf;base64,' + data.data ) 

            } else {

                console.error("Ошибка при принятии заявки:", data.message);

            }
            workActions.setLoading(false);
        });

        socket.emit('get_pdf1', {
            token:      token,
            id:         info.guid,
        });
        
    }, [token]);


    const set_contract = useCallback(async (info: WorkInfo, sign: string ) => {
        
        if (!socket) {
          toast.error('Нет соединения с сервером')
          return false
        }

        workActions.setLoading(true);
                
        socket.once('set_contract', (data: { success: boolean; message?: string; data:any }) => {
            console.log("set_contract", data)
            if (data.success) {
                
               toast.success("Договор подписан")

            } else {

                toast.error("Ошибка при принятии заявки:" + data.message);

            }
            workActions.setLoading(false);
        });

        socket.emit('set_contract', {
            token:      token,
            id:         info.guid,
            sign:       sign
        });
        
    }, [token]);

    // ============================================
    // ЗАГРУЗКА ДАННЫХ
    // ============================================
    const refreshWorks      = useCallback(async (): Promise<void> => {
      if (!socket) return

      workActions.setLoading(true)
      socket.emit('get_works', { token })
    }, [token])

    const loadArchiveWorks  = useCallback(async (): Promise<void> => {
      if (!socket) return

      workActions.setArchiveLoading(true)
      socket.emit('get_work_archives', { token })
    }, [token])

    // ============================================
    // УТИЛИТЫ
    // ============================================
    const getWork           = useCallback((guid: string): WorkInfo | undefined => {
      return workGetters.getWork(guid) || workGetters.getArchiveWork(guid)
    }, [])


function nextStatus( status: WorkStatus ) {

    switch(status) {
        case WorkStatus.NEW:            return 11;
        case WorkStatus.TO_LOAD:        return 13;
        case WorkStatus.LOADING:        return 15;
        case WorkStatus.IN_WORK:        return 17;
        case WorkStatus.UNLOADING:      return 19;
        case WorkStatus.REJECTED:       return 11;
        default: return 22;
    }
    
      // NEW             = "Новый",              // Доступна для предложения             10
      // OFFERED         = "Торг",               // Водитель сделал предложение          11    
      // TO_LOAD         = "На погрузку",        // Едет на погрузку                     12    
      // ON_LOAD         = "На погрузке",        // Прибыл на погрузку                   13 
      // LOADING         = "Загружается",        // Загружается                          14 
      // LOADED          = "Загружено",          // Загрузился                           15 
      // IN_WORK         = "В работе",           // Груз в работе                        16
      // TO_UNLOAD       = "Доставлено",         // Прибыл на место выгрузки             17
      // UNLOADING       = "Выгружается",        // Груз выгружается                     18
      // UNLOADED        = "Выгружено",          // Груз выгружен                        19
      // COMPLETED       = "Завершено" ,         // Работа завершена                     20
      // REJECTED        = "Отказано"            // Отказано                             21     
            
}

function statusText( work: WorkInfo ) {

    switch(work.status) {
        case WorkStatus.NEW:            return "Сделал предложение";
        case WorkStatus.TO_LOAD:        return "Транспорт " + work.transport  + " прибыл на погрузку";
        case WorkStatus.LOADING:        return "Транспорт " + work.transport  + " загрузился и готов выехать";
        case WorkStatus.IN_WORK:        return "Транспорт " + work.transport  + " выехал в точку доставки";
        case WorkStatus.UNLOADING:      return "Транспорт " + work.transport  + " разгрузился и готов сдаче груза";
        case WorkStatus.REJECTED:       return "";
        default: return 22;
    }
    
      // NEW             = "Новый",              // Доступна для предложения             10
      // OFFERED         = "Торг",               // Водитель сделал предложение          11    
      // TO_LOAD         = "На погрузку",        // Едет на погрузку                     12    
      // ON_LOAD         = "На погрузке",        // Прибыл на погрузку                   13 
      // LOADING         = "Загружается",        // Загружается                          14 
      // LOADED          = "Загружено",          // Загрузился                           15 
      // IN_WORK         = "В работе",           // Груз в работе                        16
      // TO_UNLOAD       = "Доставлено",         // Прибыл на место выгрузки             17
      // UNLOADING       = "Выгружается",        // Груз выгружается                     18
      // UNLOADED        = "Выгружено",          // Груз выгружен                        19
      // COMPLETED       = "Завершено" ,         // Работа завершена                     20
      // REJECTED        = "Отказано"            // Отказано                             21     
            
}

  return {
      // Состояние
      contract,
      works,
      archiveWorks,
      isLoading,
      isArchiveLoading,
      filters,
      searchQuery,

      // Фильтры
      setFilters,
      setSearchQuery,
      get_contract,
      setContract,
      set_contract,

      // Загрузка
      refreshWorks,
      loadArchiveWorks,
      setDeliver,
      setStatus,
      setOffer,

      // Утилиты
      getWork
  }
}