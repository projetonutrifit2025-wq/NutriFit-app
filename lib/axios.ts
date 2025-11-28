import axios from 'axios';
const API_URL = 'https://nutri-fit-backend.vercel.app/api';
const api = axios.create({ baseURL: API_URL });
export default api;