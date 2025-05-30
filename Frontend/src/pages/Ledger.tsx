
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { getTransactions, getAccounts, getPredefinedReasons } from "../services/accountingService";
import { Transaction, Account } from "../types/accounting";
import { exportTransactionsToPdf } from "../utils/pdfExport";
import { useToast } from "@/components/ui/use-toast";
import { Download, Eye, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Ledger: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [activeReason, setActiveReason] = useState<string>('all');
  const { toast } = useToast();
  
  useEffect(() => {
    loadTransactions();
    loadAccounts();
    setReasons(getPredefinedReasons());
  }, []);
  
  const loadTransactions = () => {
    setTransactions(getTransactions());
  };
  
  const loadAccounts = () => {
    setAccounts(getAccounts());
  };
  
  const filteredTransactions = activeReason === 'all' 
    ? transactions 
    : transactions.filter(t => t.reason === activeReason);
  
  const handleExportPdf = () => {
    exportTransactionsToPdf(transactions);
    toast({
      title: "PDF Generado",
      description: "El libro contable ha sido exportado a PDF."
    });
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Libro Contable</h1>
          <p className="text-gray-500 mt-2">
            Registro cronológico de todas las transacciones
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/transactions">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Movimiento
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Link to="/t-account">
            <Button>
              Ver Diagramas T
            </Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="all" onValueChange={setActiveReason}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              {reasons.map(reason => (
                <TabsTrigger key={reason} value={reason}>{reason}</TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeReason}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Asiento</TableHead>
                    <TableHead>Fecha Mov.</TableHead>
                    <TableHead>Fecha Exp.</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Entradas</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.entryNumber}</TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{formatDate(transaction.issueDate)}</TableCell>
                      <TableCell className="font-medium">{transaction.reference}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.reason}</TableCell>
                      <TableCell>{transaction.entries.length}</TableCell>
                      <TableCell>
                        <Link to={`/transactions/${transaction.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                        No hay transacciones registradas {activeReason !== 'all' ? `para el motivo ${activeReason}` : ''}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ledger;
