import { Account, Transaction, FinancialStatement, ResultsSummary, TAccountView } from "../types/accounting";

// Importar ambos servicios
import * as localService from "./accountingService";
import * as apiService from "./accountingApiService";

// Variable para almacenar el estado de la API
let USE_API = false;
let API_STATUS_CHECKED = false;

// Función para obtener la URL base de la API de forma dinámica
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  } else {
    return `http://${hostname}:8000`;
  }
};

// Función para detectar si la API está disponible
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    console.log('Intentando conectar a:', `${apiBaseUrl}/health`);
    
    const response = await fetch(`${apiBaseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(3000) // 3 seconds timeout
    });
    
    console.log('Respuesta de la API:', response.status, response.ok);
    return response.ok;
  } catch (error) {
    console.log("API not available, using local storage. Error:", error);
    return false;
  }
};

// Función para verificar si la API tiene datos
const checkApiHasData = async (): Promise<boolean> => {
  try {
    const accounts = await apiService.getAccounts();
    return accounts.length > 0;
  } catch (error) {
    return false;
  }
};

// Función para migrar datos del almacenamiento local a la API
const migrateLocalDataToApi = async (): Promise<void> => {
  try {
    console.log("Migrando datos locales a la API...");
    
    // Obtener datos locales
    const localAccounts = localService.getAccounts();
    const localTransactions = localService.getTransactions();
    
    // Migrar cuentas
    for (const account of localAccounts) {
      try {
        await apiService.createAccount({
          code: account.code,
          name: account.name,
          type: account.type,
          balance: account.balance
        });
      } catch (error) {
        console.error("Error migrando cuenta:", account.name, error);
      }
    }
    
    // Migrar transacciones
    for (const transaction of localTransactions) {
      try {
        await apiService.createTransaction({
          date: transaction.date,
          issueDate: transaction.issueDate,
          description: transaction.description,
          reference: transaction.reference,
          reason: transaction.reason,
          entries: transaction.entries
        });
      } catch (error) {
        console.error("Error migrando transacción:", transaction.reference, error);
      }
    }
    
    console.log("Migración completada");
  } catch (error) {
    console.error("Error durante la migración:", error);
    throw error;
  }
};

// Función para configurar automáticamente el modo de operación
export const initializeDataService = async (): Promise<{ useApi: boolean; message: string }> => {
  if (API_STATUS_CHECKED) {
    return { 
      useApi: USE_API, 
      message: USE_API ? 'Conectado a API FastAPI' : 'Trabajando en modo local' 
    };
  }

  const isApiAvailable = await checkApiConnection();
  
  if (isApiAvailable) {
    USE_API = true;
    
    // Verificar si la API tiene datos
    const apiHasData = await checkApiHasData();
    
    if (!apiHasData) {
      // Si la API no tiene datos, verificar si hay datos locales para migrar
      const localAccounts = localService.getAccounts();
      if (localAccounts.length > 0) {
        try {
          await migrateLocalDataToApi();
          API_STATUS_CHECKED = true;
          return { 
            useApi: true, 
            message: '✅ API conectada - Datos locales migrados exitosamente a la base de datos remota' 
          };
        } catch (error) {
          console.error("Error en migración, usando modo local:", error);
          USE_API = false;
          API_STATUS_CHECKED = true;
          return { 
            useApi: false, 
            message: '⚠️ Error en migración - Continuando en modo local' 
          };
        }
      } else {
        // No hay datos locales, la API comenzará con datos vacíos o de ejemplo
        API_STATUS_CHECKED = true;
        return { 
          useApi: true, 
          message: '✅ API conectada - Base de datos remota lista para usar' 
        };
      }
    } else {
      // La API ya tiene datos
      API_STATUS_CHECKED = true;
      return { 
        useApi: true, 
        message: '✅ API conectada - Trabajando con base de datos remota existente' 
      };
    }
  } else {
    USE_API = false;
    API_STATUS_CHECKED = true;
    return { 
      useApi: false, 
      message: '⚠️ API no disponible - Trabajando en modo local con almacenamiento del navegador' 
    };
  }
};

// Función para obtener el estado actual
export const getApiStatus = () => ({ useApi: USE_API, checked: API_STATUS_CHECKED });

// Función para forzar el cambio de modo (útil para desarrollo)
export const setUseApi = (useApi: boolean) => {
  USE_API = useApi;
  API_STATUS_CHECKED = true;
  console.log(`Data service mode: ${useApi ? 'API' : 'Local'}`);
};

// Funciones wrapper que delegan al servicio apropiado
export const getAccounts = async (): Promise<Account[]> => {
  if (USE_API) {
    return await apiService.getAccounts();
  } else {
    return localService.getAccounts();
  }
};

export const getAccountById = async (id: string): Promise<Account | undefined> => {
  if (USE_API) {
    try {
      return await apiService.getAccountById(id);
    } catch (error) {
      return undefined;
    }
  } else {
    return localService.getAccountById(id);
  }
};

export const createAccount = async (account: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account> => {
  if (USE_API) {
    return await apiService.createAccount(account);
  } else {
    return localService.createAccount(account);
  }
};

export const updateAccount = async (id: string, accountData: Partial<Account>): Promise<Account | undefined> => {
  if (USE_API) {
    try {
      return await apiService.updateAccount(id, accountData);
    } catch (error) {
      return undefined;
    }
  } else {
    return localService.updateAccount(id, accountData);
  }
};

export const deleteAccount = async (id: string): Promise<boolean> => {
  if (USE_API) {
    return await apiService.deleteAccount(id);
  } else {
    return localService.deleteAccount(id);
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  if (USE_API) {
    return await apiService.getTransactions();
  } else {
    return localService.getTransactions();
  }
};

export const getTransactionById = async (id: string): Promise<Transaction | undefined> => {
  if (USE_API) {
    try {
      return await apiService.getTransactionById(id);
    } catch (error) {
      return undefined;
    }
  } else {
    return localService.getTransactionById(id);
  }
};

export const createTransaction = async (transaction: Omit<Transaction, "id" | "entryNumber" | "createdAt" | "updatedAt">): Promise<Transaction> => {
  if (USE_API) {
    return await apiService.createTransaction(transaction);
  } else {
    return localService.createTransaction(transaction);
  }
};

export const updateTransaction = async (id: string, transactionData: Partial<Transaction>): Promise<Transaction | undefined> => {
  if (USE_API) {
    try {
      return await apiService.updateTransaction(id, transactionData);
    } catch (error) {
      return undefined;
    }
  } else {
    return localService.updateTransaction(id, transactionData);
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  if (USE_API) {
    return await apiService.deleteTransaction(id);
  } else {
    return localService.deleteTransaction(id);
  }
};

export const getPredefinedAccountNames = async (): Promise<string[]> => {
  if (USE_API) {
    return await apiService.getPredefinedAccountNames();
  } else {
    return localService.getPredefinedAccountNames();
  }
};

export const getPredefinedReasons = async (): Promise<string[]> => {
  if (USE_API) {
    return await apiService.getPredefinedReasons();
  } else {
    return localService.getPredefinedReasons();
  }
};

export const generateTAccount = async (accountId: string, reason?: string): Promise<TAccountView | undefined> => {
  if (USE_API) {
    try {
      return await apiService.generateTAccount(accountId, reason);
    } catch (error) {
      return undefined;
    }
  } else {
    return localService.generateTAccount(accountId, reason);
  }
};

export const generateTAccountsByReason = async (reason: string): Promise<TAccountView[]> => {
  if (USE_API) {
    return await apiService.generateTAccountsByReason(reason);
  } else {
    return localService.generateTAccountsByReason(reason);
  }
};

export const generateFinancialStatement = async (startDate: Date, endDate: Date): Promise<FinancialStatement> => {
  if (USE_API) {
    return await apiService.generateFinancialStatement(startDate, endDate);
  } else {
    return localService.generateFinancialStatement(startDate, endDate);
  }
};

export const generateResultsSummary = async (startDate: Date, endDate: Date): Promise<ResultsSummary> => {
  if (USE_API) {
    return await apiService.generateResultsSummary(startDate, endDate);
  } else {
    return localService.generateResultsSummary(startDate, endDate);
  }
};
