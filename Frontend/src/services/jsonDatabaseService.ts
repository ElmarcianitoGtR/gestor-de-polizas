
/**
 * JSON Database Service
 * Uses localStorage for persistent storage of application data
 */

// Database structure
interface Database {
  accounts: any[];
  transactions: any[];
  lastEntryNumber: number; // For transaction entry numbers
}

// Default empty database structure
const defaultDatabase: Database = {
  accounts: [],
  transactions: [],
  lastEntryNumber: 0
};

// Initialize the database if it doesn't exist
const initializeDatabase = (): void => {
  if (!localStorage.getItem('accountingDb')) {
    localStorage.setItem('accountingDb', JSON.stringify(defaultDatabase));
  }
};

// Function to revive dates from JSON strings
const jsonDateReviver = (key: string, value: any): any => {
  // List of keys that should be parsed as dates
  const dateKeys = ['date', 'issueDate', 'createdAt', 'updatedAt', 'startDate', 'endDate'];
  
  if (typeof value === 'string' && dateKeys.includes(key)) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/;
    if (dateRegex.test(value)) {
      return new Date(value);
    }
  }
  return value;
};

// Get the entire database
export const getDatabase = (): Database => {
  initializeDatabase();
  const rawData = localStorage.getItem('accountingDb') || JSON.stringify(defaultDatabase);
  return JSON.parse(rawData, jsonDateReviver);
};

// Save the entire database
export const saveDatabase = (db: Database): void => {
  localStorage.setItem('accountingDb', JSON.stringify(db));
};

// Get a specific collection from the database
export const getCollection = <T>(collectionName: keyof Database): T[] => {
  const db = getDatabase();
  return db[collectionName] as unknown as T[];
};

// Save a specific collection to the database
export const saveCollection = <T>(collectionName: keyof Database, data: T[]): void => {
  const db = getDatabase();
  db[collectionName] = data as any;
  saveDatabase(db);
};

// Get the last entry number
export const getLastEntryNumber = (): number => {
  const db = getDatabase();
  return db.lastEntryNumber;
};

// Update the last entry number
export const updateLastEntryNumber = (value: number): void => {
  const db = getDatabase();
  db.lastEntryNumber = value;
  saveDatabase(db);
};

// Clear the entire database (for testing/reset purposes)
export const clearDatabase = (): void => {
  localStorage.setItem('accountingDb', JSON.stringify(defaultDatabase));
};

// Seed the database with initial data (useful for development or first installation)
export const seedDatabase = (seedData: Partial<Database>): void => {
  initializeDatabase();
  const db = getDatabase();
  
  if (seedData.accounts) {
    db.accounts = seedData.accounts;
  }
  
  if (seedData.transactions) {
    db.transactions = seedData.transactions;
  }
  
  if (seedData.lastEntryNumber) {
    db.lastEntryNumber = seedData.lastEntryNumber;
  }
  
  saveDatabase(db);
};
