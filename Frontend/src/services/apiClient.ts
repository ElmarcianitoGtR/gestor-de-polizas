/**
 * Cliente API para conectar a un servidor backend separado
 * Este archivo configura las funciones base para realizar peticiones HTTP
 */

// Función para detectar la IP del servidor cuando se accede desde la red
const getApiBaseUrl = (): string => {
  // Si hay una variable de entorno específica, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Detectar si estamos en localhost o en la red
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Estamos en desarrollo local
    return 'http://localhost:8000';
  } else {
    // Estamos accediendo desde la red, usar la misma IP del frontend pero puerto 8000
    return `http://${hostname}:8000`;
  }
};

// Configura la URL base de tu API FastAPI
const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL configurada a:', API_BASE_URL);

// Función auxiliar para manejar respuestas y errores de fetch
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

// Función genérica para realizar peticiones GET
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Aquí puedes agregar headers de autenticación si es necesario
      // 'Authorization': `Bearer ${getToken()}`
    },
  });
  return handleResponse<T>(response);
}

// Función genérica para realizar peticiones POST
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

// Función genérica para realizar peticiones PUT
export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

// Función genérica para realizar peticiones DELETE
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${getToken()}`
    },
  });
  return handleResponse<T>(response);
}
