

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Account, Transaction, FinancialStatement, ResultsSummary } from '../types/accounting';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

const formatDate = (date: Date | string): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Fecha inválida';
  }
};
const addProfessionalHeader = (doc: jsPDF, title: string, subtitle?: string): number => {
  // Header background
  doc.setFillColor(41, 98, 255);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Company/System name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Sistema Contable', 14, 15);

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 25);
  
  // Generation date
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date())}`, 14, 32);
  
  doc.setTextColor(0, 0, 0);
  

  let currentY = 45;
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(subtitle, 14, currentY);
    currentY += 8;
  }
  
  return currentY;
};

const addFooter = (doc: jsPDF): void => {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Sistema Contable - Resguardando tu información desde ayer', 14, pageHeight - 10);
  doc.text('Página 1', 185, pageHeight - 10);
  doc.setFontSize(6);
  doc.setTextColor(91,91,91);
  doc.text('@x._.marsha', 100, pageHeight - 3);
};

export const exportAccountsToPdf = (accounts: Account[]): void => {
  const doc = new jsPDF();
  
  const startY = addProfessionalHeader(doc, 'Catálogo de Cuentas', 'Listado completo de cuentas contables');
  
  doc.setFillColor(248, 249, 250);
  doc.rect(14, startY, 182, 20, 'F');
  doc.setFontSize(10);
  doc.text(`Total de cuentas: ${accounts.length}`, 18, startY + 8);
  doc.text(`Activos: ${accounts.filter(a => a.type === 'asset').length}`, 18, startY + 14);
  doc.text(`Pasivos: ${accounts.filter(a => a.type === 'liability').length}`, 70, startY + 8);
  doc.text(`Capital: ${accounts.filter(a => a.type === 'equity').length}`, 70, startY + 14);
  doc.text(`Ingresos: ${accounts.filter(a => a.type === 'revenue').length}`, 120, startY + 8);
  doc.text(`Gastos: ${accounts.filter(a => a.type === 'expense').length}`, 120, startY + 14);
  
  autoTable(doc, {
    head: [['Código', 'Nombre', 'Tipo', 'Saldo']],
    body: accounts.map(account => [
      account.code,
      account.name,
      getAccountTypeName(account.type),
      formatCurrency(account.balance)
    ]),
    startY: startY + 25,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 98, 255],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    }
  });
  
  addFooter(doc);
  doc.save('catalogo-cuentas.pdf');
};

export const exportTransactionsToPdf = (transactions: Transaction[]): void => {
  const doc = new jsPDF();
  
  const startY = addProfessionalHeader(doc, 'Libro Contable', 'Registro de todas las transacciones');
  
  doc.setFillColor(248, 249, 250);
  doc.rect(14, startY, 182, 15, 'F');
  doc.setFontSize(10);
  doc.text(`Total de transacciones: ${transactions.length}`, 18, startY + 8);
  if (transactions.length > 0) {
    const firstDate = formatDate(transactions[0].date).split(',')[0];
    const lastDate = formatDate(transactions[transactions.length - 1].date).split(',')[0];
    doc.text(`Período: ${firstDate} - ${lastDate}`, 18, startY + 12);
  } else {
    doc.text('Período: Sin datos', 18, startY + 12);
  }
  
  autoTable(doc, {
    head: [['Fecha', 'Descripción', 'Referencia', 'Entradas', 'Motivo']],
    body: transactions.map(transaction => [
      formatDate(transaction.date).split(',')[0],
      transaction.description,
      transaction.reference,
      `${transaction.entries.length} entradas`,
      transaction.reason
    ]),
    startY: startY + 20,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 98, 255],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    }
  });
  
  addFooter(doc);
  doc.save('libro-contable.pdf');
};
export const exportTransactionToPdf = (transaction: Transaction, accounts: Account[]): void => {
  const doc = new jsPDF();
  
  const startY = addProfessionalHeader(doc, 'Póliza Contable', `Detalle completo de la transacción`);
  
  doc.setFillColor(248, 249, 250);
  doc.rect(14, startY, 182, 25, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Información de la Póliza:', 18, startY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Referencia: ${transaction.reference}`, 18, startY + 15);
  doc.text(`Fecha del Movimiento: ${formatDate(transaction.date).split(',')[0]}`, 18, startY + 20);
  doc.text(`Motivo: ${transaction.reason}`, 110, startY + 15);
  doc.text(`Asiento No.: ${transaction.entryNumber}`, 110, startY + 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Descripción:', 18, startY + 32);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.description, 18, startY + 37);
  
  const entriesWithAccounts = transaction.entries.map(entry => {
    const account = accounts.find(a => a.id === entry.accountId);
    return {
      ...entry,
      accountName: account ? `${account.code} - ${account.name}` : 'Cuenta desconocida',
      accountType: account ? getAccountTypeName(account.type) : 'N/A'
    };
  });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Análisis del Movimiento:', 14, startY + 50);
  
  autoTable(doc, {
    head: [['Cuenta', 'Tipo', 'Descripción', 'Debe', 'Haber', 'Efecto']],
    body: entriesWithAccounts.map(entry => [
      entry.accountName,
      entry.accountType,
      entry.description,
      entry.debit > 0 ? formatCurrency(entry.debit) : '-',
      entry.credit > 0 ? formatCurrency(entry.credit) : '-',
      entry.debit > 0 ? 'Aumenta' : 'Disminuye'
    ]),
    startY: startY + 55,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 98, 255],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totalDebit = entriesWithAccounts.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = entriesWithAccounts.reduce((sum, entry) => sum + entry.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  
  const bgColor: [number, number, number] = isBalanced ? [220, 252, 231] : [254, 226, 226];
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.rect(14, finalY, 182, 20, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de Totales:', 18, finalY + 8);
  doc.text(`Total Debe: ${formatCurrency(totalDebit)}`, 18, finalY + 15);
  doc.text(`Total Haber: ${formatCurrency(totalCredit)}`, 120, finalY + 15);
  doc.text(`Estado: ${isBalanced ? 'Balanceado' : 'Desbalanceado'}`, 120, finalY + 8);
  
  addFooter(doc);
  doc.save(`poliza-${transaction.reference}.pdf`);
};

export const exportFinancialStatementToPdf = (statement: FinancialStatement): void => {
  const doc = new jsPDF();
  
  const startY = addProfessionalHeader(doc, 'Estado Financiero', `Período: ${statement.startDate.toLocaleDateString()} - ${statement.endDate.toLocaleDateString()}`);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTIVOS', 14, startY);
  
  autoTable(doc, {
    head: [['Código', 'Cuenta', 'Saldo']],
    body: statement.assets.map(account => [
      account.code, 
      account.name, 
      formatCurrency(account.balance)
    ]),
    foot: [['', 'TOTAL ACTIVOS', formatCurrency(statement.assets.reduce((sum, a) => sum + a.balance, 0))]],
    startY: startY + 5,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 98, 255], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [41, 98, 255], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] }
  });
  
  const assetsEndY = (doc as any).lastAutoTable.finalY + 10;
  
  // Liabilities
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PASIVOS', 14, assetsEndY);
  
  autoTable(doc, {
    head: [['Código', 'Cuenta', 'Saldo']],
    body: statement.liabilities.map(account => [
      account.code, 
      account.name, 
      formatCurrency(account.balance)
    ]),
    foot: [['', 'TOTAL PASIVOS', formatCurrency(statement.liabilities.reduce((sum, a) => sum + a.balance, 0))]],
    startY: assetsEndY + 5,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [220, 38, 127], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [220, 38, 127], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] }
  });
  
  const liabilitiesEndY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CAPITAL', 14, liabilitiesEndY);
  
  autoTable(doc, {
    head: [['Código', 'Cuenta', 'Saldo']],
    body: statement.equity.map(account => [
      account.code, 
      account.name, 
      formatCurrency(account.balance)
    ]),
    foot: [['', 'TOTAL CAPITAL', formatCurrency(statement.equity.reduce((sum, a) => sum + a.balance, 0))]],
    startY: liabilitiesEndY + 5,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] }
  });
  
  addFooter(doc);
  doc.save('estado-financiero.pdf');
};

export const exportResultsSummaryToPdf = (summary: ResultsSummary): void => {
  const doc = new jsPDF();
  
  const startY = addProfessionalHeader(doc, 'Estado de Resultados', `Período: ${summary.startDate.toLocaleDateString()} - ${summary.endDate.toLocaleDateString()}`);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INGRESOS', 14, startY);
  
  const totalRevenue = summary.revenues.reduce((sum, account) => sum + account.balance, 0);
  
  autoTable(doc, {
    head: [['Código', 'Cuenta', 'Saldo']],
    body: summary.revenues.map(account => [
      account.code, 
      account.name, 
      formatCurrency(account.balance)
    ]),
    foot: [['', 'TOTAL INGRESOS', formatCurrency(totalRevenue)]],
    startY: startY + 5,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] }
  });
  
  const revenuesEndY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('GASTOS', 14, revenuesEndY);
  
  const totalExpense = summary.expenses.reduce((sum, account) => sum + account.balance, 0);
  
  autoTable(doc, {
    head: [['Código', 'Cuenta', 'Saldo']],
    body: summary.expenses.map(account => [
      account.code, 
      account.name, 
      formatCurrency(account.balance)
    ]),
    foot: [['', 'TOTAL GASTOS', formatCurrency(totalExpense)]],
    startY: revenuesEndY + 5,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] }
  });
  
  const expensesEndY = (doc as any).lastAutoTable.finalY + 15;
  
  const netIncomeColor: [number, number, number] = summary.netIncome >= 0 ? [34, 197, 94] : [239, 68, 68];
  doc.setFillColor(netIncomeColor[0], netIncomeColor[1], netIncomeColor[2]);
  doc.rect(14, expensesEndY, 182, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`RESULTADO NETO: ${formatCurrency(summary.netIncome)}`, 18, expensesEndY + 10);
  
  addFooter(doc);
  doc.save('estado-resultados.pdf');
};

const getAccountTypeName = (type: Account['type']): string => {
  const types = {
    asset: 'Activo',
    liability: 'Pasivo',
    equity: 'Capital',
    revenue: 'Ingreso',
    expense: 'Gasto'
  };
  return types[type];
};

