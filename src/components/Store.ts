import { combineReducers  } from 'redux'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Reducer } from 'react';
import { socketService } from './Sockets';
import { v4 as uuidv4 } from 'uuid';

export const reducers: Array<Reducer<any, any>> = []

export let listeners: Array<any> = []

export const i_state = {
    auth:                               false,
    login:                              "",
    route:                              "",         
    back:                               0,
    message:                            '',
    cargos:                             [],
    works:                              [],
    transport:                          new Object(),
    company:                            new Object(),     
    profile:                            [],
    publish:                            [],
    invoices:                           [],
    error:                              "",
    new_cargos:                         0,
    socketConnected:                    false,  // Добавлено состояние подключения сокета
    socketAuthenticated:                false,  // Добавлено состояние аутентификации сокета
}

for(const [key, value] of Object.entries(i_state)){
    reducers.push(
        function (state = i_state[key], action) {
            switch(action.type){
                case key: {
                    if(typeof(value) === "object"){
                        if(Array.isArray(value)) {
                            return action.data
                        } else {
                            return action.data
                        }
                    } else return action.data
                }
                default: return state;
            }       
        }
    )
}

export async function getData(method: string, params: any) {
    const { signal, ...requestParams } = params;
    
    const res = await axios.post(
        URL + method, 
        requestParams,
        { signal } // Передаем signal в axios
    ).then(response => response.data)
    .then((data) => {
        if(data.Код === 200) console.log(data) 
        return data
    }).catch(error => {
        if (error.name === 'AbortError') {
            throw error; // Пробрасываем AbortError
        }
        console.log(error)
        return {error: true, message: error}
    })
    
    return res
}

function create_Store(reducer, initialState) {
    const currentReducer = reducer;
    let currentState = initialState;
    return {
        getState() {
            return currentState;
        },
        dispatch(action) {
            currentState = currentReducer(currentState, action);
            listeners.forEach((elem)=>{
                if(elem.type === action.type){
                    elem.func();
                }
            })
            return action;
        },
        subscribe(listen: any) {
            const ind = listeners.findIndex(function(b) { 
                return b.num === listen.num; 
            });
            if(ind >= 0){
                listeners[ind] = listen;
            }else{
                listeners = [...listeners, listen]
            }
        },
        unSubscribe(index) {
            const ind = listeners.findIndex(function(b) { 
                return b.num === index; 
            });
            if(ind >= 0){
                listeners.splice(ind, 1)
            }        
        }
    };
}

const reduct: any = {}

Object.keys(i_state).map((e, i)=>{ reduct[e] = reducers[i]})

const rootReducer = combineReducers( reduct )

export const Store = create_Store(rootReducer, i_state)

// useSelector hook для работы с Store
export function useSelector<T>(selector: (state: any) => T, subscriptionId: number): T {
    const [selectedState, setSelectedState] = useState<T>(selector(Store.getState()))
    const isMountedRef = useRef(true)

    useEffect(() => {
        isMountedRef.current = true
        
        // Устанавливаем начальное состояние
        setSelectedState(selector(Store.getState()))

        // Определяем какие поля state нас интересуют для подписки
        const currentState = Store.getState()
        const selectedValue = selector(currentState)
        
        // Находим ключ в state, который соответствует нашему селектору
        const stateKey = Object.keys(currentState).find(key => 
            currentState[key] === selectedValue
        ) || 'state'

        // Подписываемся на изменения
        Store.subscribe({
            num: subscriptionId,
            type: stateKey,
            func: () => {
                if (isMountedRef.current) {
                    const newState = selector(Store.getState())
                    setSelectedState(newState)
                }
            }
        })

        // Cleanup функция
        return () => {
            isMountedRef.current = false
            Store.unSubscribe(subscriptionId)
        }
    }, [])

    return selectedState
}

// Альтернативная версия useSelector для прямого доступа к полю
export function useStoreField<K extends keyof typeof i_state>(fieldName: K, subscriptionId: number): typeof i_state[K] {
    const [fieldValue, setFieldValue] = useState(Store.getState()[fieldName])
    const isMountedRef = useRef(true)

    useEffect(() => {
        isMountedRef.current = true
        
        // Устанавливаем начальное состояние
        setFieldValue(Store.getState()[fieldName])

        // Подписываемся на изменения конкретного поля
        Store.subscribe({
            num: subscriptionId,
            type: fieldName as string,
            func: () => {
                if (isMountedRef.current) {
                    setFieldValue(Store.getState()[fieldName])
                }
            }
        })

        // Cleanup функция
        return () => {
            isMountedRef.current = false
            Store.unSubscribe(subscriptionId)
        }
    }, [fieldName])

    return fieldValue
}

export const URL = "https://gruzreis.ru/services/hs/api/v1/"

export function Phone(phone): string {
    if(phone === undefined) return ""
    if(phone === null) return ""
    let str = "+"
    for(let i = 0;i < phone.length;i++){
      const ch = phone.charCodeAt(i)
      if( ch >= 48 && ch <= 57) str = str + phone.charAt(i)
    }
    return str
}

export async function exec( method, params, name ){
    const res = await getData( method,  params )
    console.log( method );
    console.log( res );
    Store.dispatch({ type: name, data: res.data})
}

// Функция подключения к Socket.IO с улучшенной обработкой


// Настройка обработчиков Socket событий
export const setupSocketHandlers = () => {
    // Получаем прямой доступ к socket для подписки на события
    const socket = socketService.getSocket();
    if (!socket) return;

    // Обработчик подтверждения аутентификации
    socket.on('authenticated', (data) => {
        if (data.success) {
            console.log('Socket.IO аутентификация успешна');
            Store.dispatch({ type: "socketAuthenticated", data: true });
            if(Store.getState().auth){
                socket.emit("re_authorize", { token: Store.getState().login.token })
            }
        } else {
            console.error('Socket.IO аутентификация не удалась:', data.message);
            Store.dispatch({ type: "socketAuthenticated", data: false });
        }
    });

    // Общий обработчик уведомлений
    socket.on('notification', (data) => {
        console.log( "notification" )
    });

    // Обработчики регистрации
    socket.on('check_registration', (res) => {
        console.log('Ответ на проверку регистрации:', res);
    });

    socket.on('test_call', (res) => {
        console.log('Ответ на тест звонка:', res);
    });

    socket.on('get_cargos', (res) => {
        if( res.success){
            console.log( "getCargos received", res );
            Store.dispatch({ type: "cargos", data: res.data });    
        }
    });

    // Водительская
    socket.on('get_works', (res) => {
        if( res.success){
            console.log( "Works received", res );
            Store.dispatch({ type: "works", data: res.data });    
        }
    });

    socket.on('get_transport', (res) => {
        if( res.success){
            console.log( "Transport received", res );
            Store.dispatch({ type: "transport", data: res.data });    
        }
    });

    socket.on('get_company', (res) => {
        if( res.success){
            console.log( "Company received", res );
            Store.dispatch({ type: "company", data: res.data });    
        }
    });

    socket.on("new_cargo_notification", ()=> { 

        const news = Store.getState().new_cargos
        Store.dispatch({ type: "new_cargos", data: news + 1 })

    })

    // Обработчики ошибок подключения
    socket.on('connect_error', (error) => {
        console.error('Ошибка подключения сокета:', error);
        Store.dispatch({ type: "socketConnected", data: false });
        Store.dispatch({ type: "socketAuthenticated", data: false });
    });


    socket.on('disconnect', () => {
        console.log('Сокет отключен');
        Store.dispatch({ type: "socketConnected", data: false });
        Store.dispatch({ type: "socketAuthenticated", data: false });
    });

    
    socket.on('connect', () => {
        console.log('Сокет подключен');
        Store.dispatch({ type: "socketConnected", data: true });
    });
    
};

