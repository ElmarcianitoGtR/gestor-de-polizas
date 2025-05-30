
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateResultsSummary } from "../services/accountingService";
import { exportResultsSummaryToPdf } from "../utils/pdfExport";
import { ResultsSummary as ResultsSummaryType } from "../types/accounting";
import { useToast } from "@/components/ui/use-toast";
import { Download } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ResultsSummary: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<ResultsSummaryType | null>(null);
  const { toast } = useToast();
  
  const handleGenerate = () => {
    if (!validateDates()) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const generatedSummary = generateResultsSummary(start, end);
    setSummary(generatedSummary);
    
    toast({
      title: "Resumen Generado",
      description: "El resumen de resultados ha sido generado exitosamente."
    });
  };
  
  const handleExportPdf = () => {
    if (summary) {
      exportResultsSummaryToPdf(summary);
      toast({
        title: "PDF Generado",
        description: "El resumen de resultados ha sido exportado a PDF."
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
  
  // Prepare chart data if summary exists
  const chartData = summary ? {
    labels: ['Ingresos', 'Gastos', 'Resultado Neto'],
    datasets: [
      {
        label: 'Monto',
        data: [
          summary.revenues.reduce((sum, account) => sum + account.balance, 0),
          summary.expenses.reduce((sum, account) => sum + account.balance, 0),
          summary.netIncome
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          summary.netIncome >= 0 ? 'rgba(54, 162, 235, 0.8)' : 'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          summary.netIncome >= 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Resultado Financiero',
      },
    },
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resumen de Resultados</h1>
          <p className="text-gray-500 mt-2">
            Genera el resumen de resultados para un período específico
          </p>
        </div>
        {summary && (
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
              Generar Resumen
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {summary && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Resumen Financiero</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ingresos Totales</dt>
                    <dd className="mt-1 text-2xl font-semibold text-green-600">
                      {formatCurrency(summary.revenues.reduce((sum, account) => sum + account.balance, 0))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gastos Totales</dt>
                    <dd className="mt-1 text-2xl font-semibold text-red-600">
                      {formatCurrency(summary.expenses.reduce((sum, account) => sum + account.balance, 0))}
                    </dd>
                  </div>
                  <div className="border-t pt-4">
                    <dt className="text-sm font-medium text-gray-500">Resultado Neto</dt>
                    <dd className={`mt-1 text-3xl font-bold ${summary.netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {formatCurrency(summary.netIncome)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex justify-center items-center h-full">
                {chartData && (
                  <div className="w-full h-64">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Ingresos</h2>
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
                    {summary.revenues.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                      </TableRow>
                    ))}
                    {summary.revenues.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                          No hay ingresos registrados
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-gray-50 font-medium">
                      <TableCell colSpan={2} className="text-right">Total Ingresos</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(summary.revenues.reduce((sum, account) => sum + account.balance, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Gastos</h2>
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
                    {summary.expenses.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                      </TableRow>
                    ))}
                    {summary.expenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                          No hay gastos registrados
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-gray-50 font-medium">
                      <TableCell colSpan={2} className="text-right">Total Gastos</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(summary.expenses.reduce((sum, account) => sum + account.balance, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsSummary;
