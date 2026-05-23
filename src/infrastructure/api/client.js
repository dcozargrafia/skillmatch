/**
 * Cliente HTTP central de la aplicación basado en Axios.
 * Configura baseURL, cookies httpOnly y manejo global de errores.
 */

import axios from 'axios';
import { navigateTo } from '../../ui/router/navigator.js';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = window.location.pathname.startsWith('/login') ||
      window.location.pathname.startsWith('/forgot-password') ||
      window.location.pathname.startsWith('/reset-password');

    if (error.response?.status === 401 && !isAuthRoute) {
      navigateTo('/login');
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

const NETWORK_CODES = new Set(['ERR_NETWORK', 'ERR_CONNECTION_REFUSED', 'ECONNREFUSED', 'ECONNABORTED', 'ERR_INTERNET_DISCONNECTED']);

/**
 * Devuelve true cuando el error indica que el servidor no está accesible
 * (sin respuesta del backend, o respuesta de red/proxy sin datos de la API).
 *
 * @param {unknown} err
 * @returns {boolean}
 */
export function isNetworkError(err) {
  if (!err?.response) return true;
  if (NETWORK_CODES.has(err?.code)) return true;
  return false;
}

/**
 * Realiza una petición GET.
 *
 * @param {string} endpoint - Ruta relativa al baseURL
 * @param {import('axios').AxiosRequestConfig} [config] - Configuración adicional de Axios
 * @returns {Promise<any>} Datos de la respuesta
 */
export function get(endpoint, config = {}) {
  return client.get(endpoint, config).then((res) => res.data);
}

/**
 * Realiza una petición POST.
 *
 * @param {string} endpoint - Ruta relativa al baseURL
 * @param {object} body - Cuerpo de la petición
 * @param {import('axios').AxiosRequestConfig} [config] - Configuración adicional de Axios
 * @returns {Promise<any>} Datos de la respuesta
 */
export function post(endpoint, body, config = {}) {
  return client.post(endpoint, body, config).then((res) => res.data);
}

/**
 * Realiza una petición PUT.
 *
 * @param {string} endpoint - Ruta relativa al baseURL
 * @param {object} body - Cuerpo de la petición
 * @param {import('axios').AxiosRequestConfig} [config] - Configuración adicional de Axios
 * @returns {Promise<any>} Datos de la respuesta
 */
export function put(endpoint, body, config = {}) {
  return client.put(endpoint, body, config).then((res) => res.data);
}

/**
 * Realiza una petición DELETE.
 *
 * @param {string} endpoint - Ruta relativa al baseURL
 * @param {import('axios').AxiosRequestConfig} [config] - Configuración adicional de Axios
 * @returns {Promise<any>} Datos de la respuesta
 */
export function del(endpoint, config = {}) {
  return client.delete(endpoint, config).then((res) => res.data);
}
