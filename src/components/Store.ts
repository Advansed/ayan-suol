import { combineReducers  } from 'redux'
import axios from 'axios'
import { Reducer } from 'react';

export const reducers: Array<Reducer<any, any>> = []

export let listeners: Array<any> = []

export const i_state = {

    auth:                               false,
    swap:                               false,
    login:                              "",
    route:                              "",         
    back:                               0,
    message:                            '',
    cargos:                             [],
    transports:                         [],
    profile:                            [],

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


export async function   getData(method : string, params){

    const res = await axios.post(
            URL + method, params
    ).then(response => response.data)
        .then((data) => {
            if(data.Код === 200) console.log(data) 
            return data
        }).catch(error => {
          console.log(error)
          return {error: true, message: error}
        })
    return res

}


function                create_Store(reducer, initialState) {
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


const                   rootReducer = combineReducers( reduct )


export const Store   =  create_Store(rootReducer, i_state)


//export const URL = "https://fhd.aostng.ru/services/hs/API/V1/"
export const URL = "http://gruzreis.ru/services/hs/API/V1/"


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

Store.subscribe({ num: 1001, type: "login", func: ()=>{ 

    const params = { token: Store.getState().login.token }

    exec("getCargos", params, "cargos")
        
}})

