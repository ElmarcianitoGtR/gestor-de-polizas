
import { Account, Transaction, FinancialStatement, ResultsSummary, TAccountView, TransactionEntry } from "../types/accounting";
import { 
  getCollection, 
  saveCollection, 
  getLastEntryNumber, 
  updateLastEntryNumber, 
  seedDatabase 
} from "./jsonDatabaseService";

// Predefined account names for the catalog
const PREDEFINED_ACCOUNTS = [
  "Caja",
  "Banco",
  "Clientes",
  "Inventario",
  "Equipo de oficina",
  "Proveedores",
  "Impuestos por pagar",
  "Capital",
  "Utilidades retenidas",
  "Ventas",
  "Ingresos por servicios",
  "Gastos Operativos",
  "Gastos Administrativos",
  "Gastos de ventas",
  "Impuestos",
  "Depreciación",
  "Intereses pagados"
];

// Predefined reasons for charges
const PREDEFINED_REASONS = [
  "Venta",
  "Compra",
  "Pago",
  "Cobro",
  "Gasto",
  "Inversión",
  "Préstamo",
  "Devolución",
  "Ajuste",
  "Depreciación",
  "Nómina",
  "Servicios"
];

// Account functions - define getAccounts first since it's used by initializeIfNeeded
export const getAccounts = (): Account[] => {
  return getCollection<Account>('accounts');
};

export const getAccountById = (id: string): Account | undefined => {
  return getAccounts().find(account => account.id === id);
};

// Create sample data for first run
const createSampleData = () => {
  // Create date helpers for example transactions
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const twoMonthsAgo = new Date(today);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // Enhanced sample accounts
  const sampleAccounts: Account[] = [
    {
      id: "1",
      code: "1100",
      name: "Caja",
      type: "asset",
      balance: 15000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      code: "1200",
      name: "Banco",
      type: "asset",
      balance: 45000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "3",
      code: "1300",
      name: "Clientes",
      type: "asset",
      balance: 25000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "4",
      code: "1400",
      name: "Inventario",
      type: "asset",
      balance: 35000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "5",
      code: "1500",
      name: "Equipo de oficina",
      type: "asset",
      balance: 20000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "6",
      code: "2100",
      name: "Proveedores",
      type: "liability",
      balance: 18000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "7",
      code: "2200",
      name: "Impuestos por pagar",
      type: "liability",
      balance: 8000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "8",
      code: "3100",
      name: "Capital",
      type: "equity",
      balance: 80000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "9",
      code: "3200",
      name: "Utilidades retenidas",
      type: "equity",
      balance: 15000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "10",
      code: "4100",
      name: "Ventas",
      type: "revenue",
      balance: 120000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "11",
      code: "4200",
      name: "Ingresos por servicios",
      type: "revenue",
      balance: 45000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "12",
      code: "5100",
      name: "Gastos Operativos",
      type: "expense",
      balance: 35000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "13",
      code: "5200",
      name: "Gastos Administrativos",
      type: "expense",
      balance: 25000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "14",
      code: "5300",
      name: "Gastos de ventas",
      type: "expense",
      balance: 18000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "15",
      code: "5400",
      name: "Impuestos",
      type: "expense",
      balance: 12000,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Enhanced sample transactions with more variety
  const sampleTransactions: Transaction[] = [
    {
      id: "1",
      entryNumber: 1,
      date: threeMonthsAgo,
      issueDate: threeMonthsAgo,
      description: "Aportación inicial de capital",
      reference: "CAP-001",
      reason: "Inversión",
      entries: [
        {
          id: "1",
          accountId: "2",
          description: "Aportación en efectivo",
          debit: 50000,
          credit: 0
        },
        {
          id: "2",
          accountId: "8",
          description: "Capital inicial",
          debit: 0,
          credit: 50000
        }
      ],
      createdAt: threeMonthsAgo,
      updatedAt: threeMonthsAgo
    },
    {
      id: "2",
      entryNumber: 2,
      date: threeMonthsAgo,
      issueDate: threeMonthsAgo,
      description: "Compra de equipo de oficina",
      reference: "INV-001",
      reason: "Inversión",
      entries: [
        {
          id: "3",
          accountId: "5",
          description: "Compra de computadoras",
          debit: 20000,
          credit: 0
        },
        {
          id: "4",
          accountId: "2",
          description: "Pago con cheque",
          debit: 0,
          credit: 20000
        }
      ],
      createdAt: threeMonthsAgo,
      updatedAt: threeMonthsAgo
    },
    {
      id: "3",
      entryNumber: 3,
      date: twoMonthsAgo,
      issueDate: twoMonthsAgo,
      description: "Compra de mercancía al crédito",
      reference: "COM-001",
      reason: "Compra",
      entries: [
        {
          id: "5",
          accountId: "4",
          description: "Compra de inventario",
          debit: 35000,
          credit: 0
        },
        {
          id: "6",
          accountId: "6",
          description: "Cuenta por pagar a proveedor",
          debit: 0,
          credit: 35000
        }
      ],
      createdAt: twoMonthsAgo,
      updatedAt: twoMonthsAgo
    },
    {
      id: "4",
      entryNumber: 4,
      date: twoMonthsAgo,
      issueDate: twoMonthsAgo,
      description: "Venta de mercancía al contado",
      reference: "VEN-001",
      reason: "Venta",
      entries: [
        {
          id: "7",
          accountId: "1",
          description: "Ingreso por venta en efectivo",
          debit: 25000,
          credit: 0
        },
        {
          id: "8",
          accountId: "10",
          description: "Venta de productos",
          debit: 0,
          credit: 25000
        }
      ],
      createdAt: twoMonthsAgo,
      updatedAt: twoMonthsAgo
    },
    {
      id: "5",
      entryNumber: 5,
      date: twoMonthsAgo,
      issueDate: twoMonthsAgo,
      description: "Venta de servicios al crédito",
      reference: "SER-001",
      reason: "Venta",
      entries: [
        {
          id: "9",
          accountId: "3",
          description: "Cuenta por cobrar",
          debit: 15000,
          credit: 0
        },
        {
          id: "10",
          accountId: "11",
          description: "Ingresos por servicios",
          debit: 0,
          credit: 15000
        }
      ],
      createdAt: twoMonthsAgo,
      updatedAt: twoMonthsAgo
    },
    {
      id: "6",
      entryNumber: 6,
      date: lastMonth,
      issueDate: lastMonth,
      description: "Pago de gastos operativos",
      reference: "GAS-001",
      reason: "Gasto",
      entries: [
        {
          id: "11",
          accountId: "12",
          description: "Gastos de operación",
          debit: 8000,
          credit: 0
        },
        {
          id: "12",
          accountId: "2",
          description: "Pago con transferencia",
          debit: 0,
          credit: 8000
        }
      ],
      createdAt: lastMonth,
      updatedAt: lastMonth
    },
    {
      id: "7",
      entryNumber: 7,
      date: lastMonth,
      issueDate: lastMonth,
      description: "Cobro a clientes",
      reference: "COB-001",
      reason: "Cobro",
      entries: [
        {
          id: "13",
          accountId: "2",
          description: "Cobro depositado en banco",
          debit: 10000,
          credit: 0
        },
        {
          id: "14",
          accountId: "3",
          description: "Disminución de cuentas por cobrar",
          debit: 0,
          credit: 10000
        }
      ],
      createdAt: lastMonth,
      updatedAt: lastMonth
    },
    {
      id: "8",
      entryNumber: 8,
      date: lastMonth,
      issueDate: lastMonth,
      description: "Pago a proveedores",
      reference: "PAG-001",
      reason: "Pago",
      entries: [
        {
          id: "15",
          accountId: "6",
          description: "Pago de cuenta pendiente",
          debit: 15000,
          credit: 0
        },
        {
          id: "16",
          accountId: "2",
          description: "Pago con cheque",
          debit: 0,
          credit: 15000
        }
      ],
      createdAt: lastMonth,
      updatedAt: lastMonth
    },
    {
      id: "9",
      entryNumber: 9,
      date: lastWeek,
      issueDate: lastWeek,
      description: "Venta al contado con descuento",
      reference: "VEN-002",
      reason: "Venta",
      entries: [
        {
          id: "17",
          accountId: "1",
          description: "Cobro en efectivo",
          debit: 18000,
          credit: 0
        },
        {
          id: "18",
          accountId: "14",
          description: "Descuento otorgado",
          debit: 2000,
          credit: 0
        },
        {
          id: "19",
          accountId: "10",
          description: "Venta bruta",
          debit: 0,
          credit: 20000
        }
      ],
      createdAt: lastWeek,
      updatedAt: lastWeek
    },
    {
      id: "10",
      entryNumber: 10,
      date: lastWeek,
      issueDate: lastWeek,
      description: "Pago de gastos administrativos",
      reference: "ADM-001",
      reason: "Gasto",
      entries: [
        {
          id: "20",
          accountId: "13",
          description: "Gastos de administración",
          debit: 6000,
          credit: 0
        },
        {
          id: "21",
          accountId: "1",
          description: "Pago en efectivo",
          debit: 0,
          credit: 6000
        }
      ],
      createdAt: lastWeek,
      updatedAt: lastWeek
    },
    {
      id: "11",
      entryNumber: 11,
      date: yesterday,
      issueDate: yesterday,
      description: "Servicios prestados al contado",
      reference: "SER-002",
      reason: "Venta",
      entries: [
        {
          id: "22",
          accountId: "2",
          description: "Cobro por servicios",
          debit: 12000,
          credit: 0
        },
        {
          id: "23",
          accountId: "11",
          description: "Ingresos por servicios",
          debit: 0,
          credit: 12000
        }
      ],
      createdAt: yesterday,
      updatedAt: yesterday
    },
    {
      id: "12",
      entryNumber: 12,
      date: today,
      issueDate: today,
      description: "Provisión para impuestos",
      reference: "IMP-001",
      reason: "Ajuste",
      entries: [
        {
          id: "24",
          accountId: "15",
          description: "Gasto por impuestos",
          debit: 8000,
          credit: 0
        },
        {
          id: "25",
          accountId: "7",
          description: "Impuestos por pagar",
          debit: 0,
          credit: 8000
        }
      ],
      createdAt: today,
      updatedAt: today
    },
    {
      id: "13",
      entryNumber: 13,
      date: today,
      issueDate: today,
      description: "Venta mixta (contado y crédito)",
      reference: "VEN-003",
      reason: "Venta",
      entries: [
        {
          id: "26",
          accountId: "1",
          description: "Cobro parcial en efectivo",
          debit: 30000,
          credit: 0
        },
        {
          id: "27",
          accountId: "3",
          description: "Saldo a crédito",
          debit: 20000,
          credit: 0
        },
        {
          id: "28",
          accountId: "10",
          description: "Venta total",
          debit: 0,
          credit: 50000
        }
      ],
      createdAt: today,
      updatedAt: today
    }
  ];

  // Seed the database with enhanced sample data
  seedDatabase({
    accounts: sampleAccounts,
    transactions: sampleTransactions,
    lastEntryNumber: 13
  });
};

// Initialize database with sample data if needed (first run)
const initializeIfNeeded = () => {
  const accounts = getAccounts();
  if (accounts.length === 0) {
    createSampleData();
  }
};

// Call initialization on module load
initializeIfNeeded();

// Rest of account functions
export const createAccount = (account: Omit<Account, "id" | "createdAt" | "updatedAt">): Account => {
  const accounts = getAccounts();
  const newAccount: Account = {
    ...account,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  accounts.push(newAccount);
  saveCollection('accounts', accounts);
  return newAccount;
};

export const updateAccount = (id: string, accountData: Partial<Account>): Account | undefined => {
  const accounts = getAccounts();
  const index = accounts.findIndex(a => a.id === id);
  if (index !== -1) {
    accounts[index] = {
      ...accounts[index],
      ...accountData,
      updatedAt: new Date()
    };
    saveCollection('accounts', accounts);
    return accounts[index];
  }
  return undefined;
};

export const deleteAccount = (id: string): boolean => {
  const accounts = getAccounts();
  const initialLength = accounts.length;
  const updatedAccounts = accounts.filter(a => a.id !== id);
  saveCollection('accounts', updatedAccounts);
  return updatedAccounts.length !== initialLength;
};

// Get predefined account names
export const getPredefinedAccountNames = (): string[] => {
  return [...PREDEFINED_ACCOUNTS];
};

// Get predefined reason options
export const getPredefinedReasons = (): string[] => {
  return [...PREDEFINED_REASONS];
};

// Transaction functions
export const getTransactions = (): Transaction[] => {
  return getCollection<Transaction>('transactions');
};

export const getTransactionById = (id: string): Transaction | undefined => {
  return getTransactions().find(transaction => transaction.id === id);
};

export const createTransaction = (transaction: Omit<Transaction, "id" | "entryNumber" | "createdAt" | "updatedAt">): Transaction => {
  // Increment the global entry number
  let lastEntryNumber = getLastEntryNumber();
  lastEntryNumber++;
  updateLastEntryNumber(lastEntryNumber);
  
  const transactions = getTransactions();
  const accounts = getAccounts();
  
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    entryNumber: lastEntryNumber,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Update account balances
  transaction.entries.forEach(entry => {
    const accountIndex = accounts.findIndex(a => a.id === entry.accountId);
    if (accountIndex !== -1) {
      const account = accounts[accountIndex];
      if (entry.debit > 0) {
        if (account.type === "asset" || account.type === "expense") {
          accounts[accountIndex].balance += entry.debit;
        } else {
          accounts[accountIndex].balance -= entry.debit;
        }
      }
      if (entry.credit > 0) {
        if (account.type === "liability" || account.type === "equity" || account.type === "revenue") {
          accounts[accountIndex].balance += entry.credit;
        } else {
          accounts[accountIndex].balance -= entry.credit;
        }
      }
    }
  });
  
  transactions.push(newTransaction);
  saveCollection('transactions', transactions);
  saveCollection('accounts', accounts);
  
  return newTransaction;
};

export const updateTransaction = (id: string, transactionData: Partial<Transaction>): Transaction | undefined => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = {
      ...transactions[index],
      ...transactionData,
      updatedAt: new Date()
    };
    saveCollection('transactions', transactions);
    return transactions[index];
  }
  return undefined;
};

export const deleteTransaction = (id: string): boolean => {
  const transactions = getTransactions();
  const initialLength = transactions.length;
  const updatedTransactions = transactions.filter(t => t.id !== id);
  saveCollection('transactions', updatedTransactions);
  return updatedTransactions.length !== initialLength;
};

// Generate T-Account view for one account
export const generateTAccount = (accountId: string, reason?: string): TAccountView | undefined => {
  const account = getAccountById(accountId);
  if (!account) return undefined;
  
  // Get all entries for this account
  const allEntries: {entry: TransactionEntry, transaction: Transaction}[] = [];
  const transactions = getTransactions();
  
  transactions.forEach(transaction => {
    // Filter by reason if specified
    if (reason && transaction.reason !== reason) return;
    
    transaction.entries
      .filter(entry => entry.accountId === accountId)
      .forEach(entry => {
        allEntries.push({
          entry,
          transaction
        });
      });
  });
  
  // Separate debit and credit entries
  const debitEntries = allEntries
    .filter(({entry}) => entry.debit > 0)
    .map(({entry}) => entry);
  
  const creditEntries = allEntries
    .filter(({entry}) => entry.credit > 0)
    .map(({entry}) => entry);
  
  // Calculate totals
  const totalDebit = debitEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = creditEntries.reduce((sum, entry) => sum + entry.credit, 0);
  
  return {
    accountId: account.id,
    accountName: account.name,
    accountType: account.type,
    debitEntries,
    creditEntries,
    totalDebit,
    totalCredit,
    balance: account.balance
  };
};

// Generate T-Accounts view filtered by reason
export const generateTAccountsByReason = (reason: string): TAccountView[] => {
  const accounts = getAccounts();
  return accounts.map(account => {
    const tAccount = generateTAccount(account.id, reason);
    if (!tAccount) {
      // Create empty T account if no transactions for this reason
      return {
        accountId: account.id,
        accountName: account.name,
        accountType: account.type,
        debitEntries: [],
        creditEntries: [],
        totalDebit: 0,
        totalCredit: 0,
        balance: account.balance
      };
    }
    return tAccount;
  });
};

// Financial Statement functions
export const generateFinancialStatement = (startDate: Date, endDate: Date): FinancialStatement => {
  const accounts = getAccounts();
  const assets = accounts.filter(a => a.type === "asset");
  const liabilities = accounts.filter(a => a.type === "liability");
  const equity = accounts.filter(a => a.type === "equity");
  const revenues = accounts.filter(a => a.type === "revenue");
  const expenses = accounts.filter(a => a.type === "expense");
  
  return {
    id: Date.now().toString(),
    name: `Estado Financiero ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    startDate,
    endDate,
    createdAt: new Date(),
    assets,
    liabilities,
    equity,
    revenues,
    expenses
  };
};

// Results Summary functions
export const generateResultsSummary = (startDate: Date, endDate: Date): ResultsSummary => {
  const accounts = getAccounts();
  const revenues = accounts.filter(a => a.type === "revenue");
  const expenses = accounts.filter(a => a.type === "expense");
  
  const totalRevenue = revenues.reduce((sum, account) => sum + account.balance, 0);
  const totalExpense = expenses.reduce((sum, account) => sum + account.balance, 0);
  const netIncome = totalRevenue - totalExpense;
  
  return {
    id: Date.now().toString(),
    name: `Resumen de Resultados ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    startDate,
    endDate,
    createdAt: new Date(),
    revenues,
    expenses,
    netIncome
  };
};
