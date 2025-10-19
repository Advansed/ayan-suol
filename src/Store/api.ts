// URL базовый адрес API
export const URL = "https://gruzreis.ru";

export const version = '1.0.1'

interface FetchResponse {
  error: boolean;
  data?: any;
  message: string;
}

export const api = async (endpoint: string, data: any) => {
    const res = await fetch(`${URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const getVersion = async() => {
    const res = await fetch('getVersion', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return res.json()
};

