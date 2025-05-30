
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateFinancialStatement } from "../services/accountingService";
import { exportFinancialStatementToPdf } from "../utils/pdfExport";
import { FinancialStatement as FinancialStatementType } from "../types/accounting";
import { useToast } from "@/components/ui/use-toast";
import { Download } from 'lucide-react';

const FinancialStatement: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statement, setStatement] = useState<FinancialStatementType | null>(null);
  const { toast } = useToast();
  
  const handleGenerate = () => {
    if (!validateDates()) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const generatedStatement = generateFinancialStatement(start, end);
    setStatement(generatedStatement);
    
    toast({
      title: "Estado Financiero Generado",
      description: "El estado financiero ha sido generado exitosamente."
    });
  };
  
  const handleExportPdf = () => {
    if (statement) {
      exportFinancialStatementToPdf(statement);
      toast({
        title: "PDF Generado",
        description: "El estado financiero ha sido exportado a PDF."
      });
    }
  };
  
  const validateDates = (): boolean => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Por favor seleccione fechas de inicio y fin.",
        variant: "destructive"
      });
      return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      toast({
        title: "Error",
        description: "La fecha de inicio debe ser anterior a la fecha de fin.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };
  
  const calculateTotal = (accounts: any[]): number => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Estado Financiero</h1>
          <p className="text-gray-500 mt-2">
            Genera el estado financiero para un período específico
          </p>
        </div>
        {statement && (
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <Button onClick={handleGenerate}>
              Generar Estado Financiero
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {statement && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Activos</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.assets.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                      </TableRow>
                    ))}
                    {statement.assets.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                          No hay activos registrados
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-gray-50 font-medium">
                      <TableCell colSpan={2} className="text-right">Total Activos</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculateTotal(statement.assets))}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Pasivos</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.liabilities.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                      </TableRow>
                    ))}
                    {statement.liabilities.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                          No hay pasivos registrados
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-gray-50 font-medium">
                      <TableCell colSpan={2} className="text-right">Total Pasivos</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculateTotal(statement.liabilities))}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Capital</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.equity.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                      </TableRow>
                    ))}
                    {statement.equity.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                          No hay cuentas de capital registradas
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-gray-50 font-medium">
                      <TableCell colSpan={2} className="text-right">Total Capital</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculateTotal(statement.equity))}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Resumen</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt>Total Activos:</dt>
                      <dd className="font-medium">{formatCurrency(calculateTotal(statement.assets))}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Total Pasivos:</dt>
                      <dd className="font-medium">{formatCurrency(calculateTotal(statement.liabilities))}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Total Capital:</dt>
                      <dd className="font-medium">{formatCurrency(calculateTotal(statement.equity))}</dd>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <dt className="font-medium">Pasivo + Capital:</dt>
                      <dd className="font-medium">
                        {formatCurrency(calculateTotal(statement.liabilities) + calculateTotal(statement.equity))}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Ecuación Contable</div>
                    <div className="text-xl font-bold">
                      Activo = Pasivo + Capital
                    </div>
                    <div className="flex justify-center gap-8 mt-2">
                      <div>{formatCurrency(calculateTotal(statement.assets))}</div>
                      <div>=</div>
                      <div>{formatCurrency(calculateTotal(statement.liabilities) + calculateTotal(statement.equity))}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FinancialStatement;
