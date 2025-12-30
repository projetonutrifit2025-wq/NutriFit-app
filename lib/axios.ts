import axios from 'axios';
const API_URL = 'https://nutri-fit-backend.vercel.app/api';
// const API_URL = 'http://192.168.1.47:3333/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
    console.log('Request:', config.method?.toUpperCase(), config.url);
    // console.log('Headers:', config.headers); // Uncomment to debug headers specifically
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('API Error:', error.response?.status, error.config?.url);
        return Promise.reject(error);
    }
);

export default api;