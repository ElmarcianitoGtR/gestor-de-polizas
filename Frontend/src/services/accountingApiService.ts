
import { 
  Account, 
  Transaction, 
  FinancialStatement, 
  ResultsSummary, 
  TAccountView 
} from "../types/accounting";
import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

// =========== Interfaces para el backend ===========

interface BackendAccount {
  id: string;
  code: string;
  name: string;
  account_type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BackendTransaction {
  id: string;
  entry_number: number;
  date: string;
  reason: string;
  description: string;
  details: BackendTransactionDetail[];
  created_at: string;
  updated_at: string;
}

interface BackendTransactionDetail {
  id: string;
  account_id: string;
  debit: number;
  credit: number;
  description: string;
}

// =========== Funciones de conversión ===========

const convertBackendAccountToFrontend = (backendAccount: BackendAccount): Account => {
  const typeMapping = {
    'ASSET': 'asset' as const,
    'LIABILITY': 'liability' as const,
    'EQUITY': 'equity' as const,
    'REVENUE': 'revenue' as const,
    'EXPENSE': 'expense' as const
  };

  return {
    id: backendAccount.id,
    code: backendAccount.code,
    name: backendAccount.name,
    type: typeMapping[backendAccount.account_type],
    balance: 0, // El balance se calculará desde las transacciones
    createdAt: new Date(backendAccount.created_at),
    updatedAt: new Date(backendAccount.updated_at)
  };
};

const convertFrontendAccountToBackend = (account: Omit<Account, "id" | "createdAt" | "updatedAt">): any => {
  const typeMapping = {
    'asset': 'ASSET',
    'liability': 'LIABILITY',
    'equity': 'EQUITY',
    'revenue': 'REVENUE',
    'expense': 'EXPENSE'
  };

  return {
    code: account.code,
    name: account.name,
    account_type: typeMapping[account.type],
    description: '',
    is_active: true
  };
};

const convertBackendTransactionToFrontend = (backendTransaction: BackendTransaction): Transaction => {
  return {
    id: backendTransaction.id,
    entryNumber: backendTransaction.entry_number,
    date: new Date(backendTransaction.date),
    issueDate: new Date(backendTransaction.date), // Usar la misma fecha
    description: backendTransaction.description,
    reference: `REF-${backendTransaction.entry_number}`,
    reason: backendTransaction.reason,
    entries: backendTransaction.details.map(detail => ({
      id: detail.id,
      accountId: detail.account_id,
      description: detail.description,
      debit: detail.debit,
      credit: detail.credit
    })),
    createdAt: new Date(backendTransaction.created_at),
    updatedAt: new Date(backendTransaction.updated_at)
  };
};

// =========== Funciones para Cuentas ===========

export const getAccounts = async (): Promise<Account[]> => {
  try {
    const backendAccounts = await apiGet<BackendAccount[]>('/accounts/');
    return backendAccounts.map(convertBackendAccountToFrontend);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

export const getAccountById = async (id: string): Promise<Account> => {
  try {
    const backendAccount = await apiGet<BackendAccount>(`/accounts/${id}`);
    return convertBackendAccountToFrontend(backendAccount);
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
};

export const createAccount = async (account: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account> => {
  try {
    const backendAccountData = convertFrontendAccountToBackend(account);
    const backendAccount = await apiPost<BackendAccount>('/accounts/', backendAccountData);
    return convertBackendAccountToFrontend(backendAccount);
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const updateAccount = async (id: string, accountData: Partial<Account>): Promise<Account> => {
  try {
    const updateData: any = {};
    if (accountData.code) updateData.code = accountData.code;
    if (accountData.name) updateData.name = accountData.name;
    if (accountData.type) {
      const typeMapping = {
        'asset': 'ASSET',
        'liability': 'LIABILITY',
        'equity': 'EQUITY',
        'revenue': 'REVENUE',
        'expense': 'EXPENSE'
      };
      updateData.account_type = typeMapping[accountData.type];
    }

    const backendAccount = await apiPut<BackendAccount>(`/accounts/${id}`, updateData);
    return convertBackendAccountToFrontend(backendAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

export const deleteAccount = async (id: string): Promise<boolean> => {
  try {
    await apiDelete<void>(`/accounts/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

// =========== Funciones para Transacciones ===========

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const backendTransactions = await apiGet<BackendTransaction[]>('/transactions/');
    return backendTransactions.map(convertBackendTransactionToFrontend);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
  try {
    const backendTransaction = await apiGet<BackendTransaction>(`/transactions/${id}`);
    return convertBackendTransactionToFrontend(backendTransaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
};

export const createTransaction = async (transaction: Omit<Transaction, "id" | "entryNumber" | "createdAt" | "updatedAt">): Promise<Transaction> => {
  try {
    const backendTransactionData = {
      date: transaction.date.toISOString().split('T')[0],
      reason: transaction.reason,
      description: transaction.description,
      details: transaction.entries.map(entry => ({
        account_id: entry.accountId,
        debit: entry.debit,
        credit: entry.credit,
        description: entry.description
      }))
    };

    const backendTransaction = await apiPost<BackendTransaction>('/transactions/', backendTransactionData);
    return convertBackendTransactionToFrontend(backendTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (id: string, transactionData: Partial<Transaction>): Promise<Transaction> => {
  try {
    const updateData: any = {};
    if (transactionData.date) updateData.date = transactionData.date.toISOString().split('T')[0];
    if (transactionData.reason) updateData.reason = transactionData.reason;
    if (transactionData.description) updateData.description = transactionData.description;

    const backendTransaction = await apiPut<BackendTransaction>(`/transactions/${id}`, updateData);
    return convertBackendTransactionToFrontend(backendTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    await apiDelete<void>(`/transactions/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// =========== Funciones para Catálogos ===========

export const getPredefinedAccountNames = async (): Promise<string[]> => {
  try {
    return await apiGet<string[]>('/catalogs/account-names');
  } catch (error) {
    console.error('Error fetching predefined account names:', error);
    throw error;
  }
};

export const getPredefinedReasons = async (): Promise<string[]> => {
  try {
    return await apiGet<string[]>('/catalogs/reasons');
  } catch (error) {
    console.error('Error fetching predefined reasons:', error);
    throw error;
  }
};

// =========== Funciones para T-Accounts ===========

export const generateTAccount = async (accountId: string, reason?: string): Promise<TAccountView> => {
  try {
    const queryParams = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    const response = await apiGet<any>(`/t-accounts/${accountId}${queryParams}`);
    
    return {
      accountId: response.account_id,
      accountName: response.account_name,
      accountType: response.account_type.toLowerCase(),
      debitEntries: response.entries.filter((e: any) => e.debit > 0).map((e: any) => ({
        id: `${e.entry_number}-debit`,
        accountId: accountId,
        description: e.reason,
        debit: e.debit,
        credit: 0
      })),
      creditEntries: response.entries.filter((e: any) => e.credit > 0).map((e: any) => ({
        id: `${e.entry_number}-credit`,
        accountId: accountId,
        description: e.reason,
        debit: 0,
        credit: e.credit
      })),
      totalDebit: response.total_debit,
      totalCredit: response.total_credit,
      balance: response.final_balance
    };
  } catch (error) {
    console.error('Error generating T-account:', error);
    throw error;
  }
};

export const generateTAccountsByReason = async (reason: string): Promise<TAccountView[]> => {
  try {
    const response = await apiGet<any[]>(`/t-accounts/by-reason/${encodeURIComponent(reason)}`);
    
    return response.map(tAccount => ({
      accountId: tAccount.account_id,
      accountName: tAccount.account_name,
      accountType: tAccount.account_type.toLowerCase(),
      debitEntries: tAccount.entries.filter((e: any) => e.debit > 0).map((e: any) => ({
        id: `${e.entry_number}-debit`,
        accountId: tAccount.account_id,
        description: e.reason,
        debit: e.debit,
        credit: 0
      })),
      creditEntries: tAccount.entries.filter((e: any) => e.credit > 0).map((e: any) => ({
        id: `${e.entry_number}-credit`,
        accountId: tAccount.account_id,
        description: e.reason,
        debit: 0,
        credit: e.credit
      })),
      totalDebit: tAccount.total_debit,
      totalCredit: tAccount.total_credit,
      balance: tAccount.final_balance
    }));
  } catch (error) {
    console.error('Error generating T-accounts by reason:', error);
    throw error;
  }
};

// =========== Funciones para Estados Financieros ===========

export const generateFinancialStatement = async (startDate: Date, endDate: Date): Promise<FinancialStatement> => {
  try {
    const params = new URLSearchParams({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    });
    
    const response = await apiGet<any>(`/financial-statements?${params}`);
    
    return {
      id: `${Date.now()}`,
      name: `Estado Financiero ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      startDate,
      endDate,
      createdAt: new Date(),
      assets: [], // Se llenarían con las cuentas correspondientes
      liabilities: [],
      equity: [],
      revenues: [],
      expenses: []
    };
  } catch (error) {
    console.error('Error generating financial statement:', error);
    throw error;
  }
};

// =========== Funciones para Resúmenes de Resultados ===========

export const generateResultsSummary = async (startDate: Date, endDate: Date): Promise<ResultsSummary> => {
  try {
    const params = new URLSearchParams({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    });
    
    const response = await apiGet<any>(`/results-summary?${params}`);
    
    return {
      id: `${Date.now()}`,
      name: `Resumen de Resultados ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      startDate,
      endDate,
      createdAt: new Date(),
      revenues: [],
      expenses: [],
      netIncome: response.net_income
    };
  } catch (error) {
    console.error('Error generating results summary:', error);
    throw error;
  }
};
