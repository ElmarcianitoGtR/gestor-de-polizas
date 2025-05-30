
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTransactionById, getAccounts } from "../services/dataService";
import { Account, Transaction } from "../types/accounting";
import { exportTransactionToPdf } from "../utils/pdfExport";
import { useToast } from "@/hooks/use-toast";
import { Download, ArrowLeft } from 'lucide-react';

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          setLoading(true);
          const [foundTransaction, allAccounts] = await Promise.all([
            getTransactionById(id),
            getAccounts()
          ]);
          setTransaction(foundTransaction || null);
          setAccounts(allAccounts);
        } catch (error) {
          console.error("Error loading transaction data:", error);
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la transacción.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [id, toast]);
  
  const handleExportPdf = () => {
    if (transaction) {
      exportTransactionToPdf(transaction, accounts);
      toast({
        title: "PDF Generado",
        description: `La póliza ${transaction.reference} ha sido exportada a PDF con formato profesional.`
      });
    }
  };
  
  const getAccountName = (accountId: string): string => {
    const account = accounts.find(a => a.id === accountId);
    return account ? `${account.code} - ${account.name}` : 'Cuenta desconocida';
  };
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };
  
  // Helper function to safely format dates
  const formatDate = (dateValue: Date | string): string => {
    if (!dateValue) return 'N/A';
    
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error, dateValue);
      return 'Invalid Date';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando póliza...</p>
      </div>
    );
  }
  
  if (!transaction) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No se encontró la póliza solicitada.</p>
      </div>
    );
  }
  
  const totalDebit = transaction.entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = transaction.entries.reduce((sum, entry) => sum + entry.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/transactions">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Póliza: {transaction.reference}</h1>
            <p className="text-gray-500 mt-1">
              {formatDate(transaction.date)} | Asiento No. {transaction.entryNumber}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExportPdf}>
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>
      
      <Card className="border">
        <CardContent className="pt-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Referencia</dt>
              <dd className="mt-1 font-semibold">{transaction.reference}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Número de Asiento</dt>
              <dd className="mt-1 font-semibold">{transaction.entryNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Fecha del Movimiento</dt>
              <dd className="mt-1">{formatDate(transaction.date)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Motivo</dt>
              <dd className="mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {transaction.reason}
                </span>
              </dd>
            </div>
            <div className="col-span-2 mt-2">
              <dt className="text-sm font-medium text-gray-500">Descripción</dt>
              <dd className="mt-1">{transaction.description}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      {/* Balance status indicator */}
      <div className={`p-4 rounded-lg ${isBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${isBalanced ? 'text-green-800' : 'text-red-800'}`}>
            {isBalanced ? '✓ Transacción Balanceada' : '⚠ Transacción Desbalanceada'}
          </span>
          <span className="text-sm text-gray-600">
            (Debe: {formatCurrency(totalDebit)} | Haber: {formatCurrency(totalCredit)})
          </span>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Análisis de Entradas</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Debe</TableHead>
                  <TableHead className="text-right">Haber</TableHead>
                  <TableHead className="text-center">Efecto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transaction.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{getAccountName(entry.accountId)}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.debit > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.debit > 0 ? 'Aumenta' : 'Disminuye'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className={`font-medium ${isBalanced ? 'bg-green-50' : 'bg-red-50'}`}>
                  <TableCell colSpan={2} className="text-right">Totales</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalDebit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCredit)}</TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isBalanced 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isBalanced ? 'Balanceado' : 'Error'}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetail;
