import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

export const getFotoDelDia = async () => { const r = await api.get('/api/foto-del-dia'); return r.data; };

export const buscarImagenes = async (palabra) => { const r = await api.get('/api/buscar?palabra=' + palabra); return r.data; };

export const getAsteroides = async () => { const r = await api.get('/api/asteroides'); return r.data; };
