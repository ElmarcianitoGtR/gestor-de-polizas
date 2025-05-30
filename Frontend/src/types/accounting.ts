
export interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  entryNumber: number; // Número de asiento global
  date: Date; // Fecha del movimiento
  issueDate: Date; // Fecha de expedición de la póliza
  description: string;
  reference: string;
  reason: string; // Motivo de cargo
  entries: TransactionEntry[];
  createdAt: Date;
  updatedAt: Date;
  status?: "pending" | "approved" | "rejected"; // Estado de la transacción (útil para flujos de aprobación)
}

export interface TransactionEntry {
  id: string;
  accountId: string;
  account?: Account;
  description: string;
  debit: number;
  credit: number;
  lineNumber?: number; // Número de línea en la transacción
}

export interface FinancialStatement {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  assets: Account[];
  liabilities: Account[];
  equity: Account[];
  revenues: Account[];
  expenses: Account[];
  generatedBy?: string; // Usuario que generó el reporte
  reportType?: "monthly" | "quarterly" | "annual"; // Tipo de reporte
}

export interface ResultsSummary {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  revenues: Account[];
  expenses: Account[];
  netIncome: number;
  previousPeriodNetIncome?: number; // Para comparaciones con periodos anteriores
}

export interface TAccountView {
  accountId: string;
  accountName: string;
  accountType: string;
  debitEntries: TransactionEntry[];
  creditEntries: TransactionEntry[];
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

// Interfaces para respuestas paginadas del API
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
}

// Interfaces para mensajes de error del API
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}
