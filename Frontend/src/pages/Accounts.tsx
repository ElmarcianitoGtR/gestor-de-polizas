
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAccounts, createAccount, updateAccount, deleteAccount } from "../services/accountingService";
import { Account } from "../types/accounting";
import { exportAccountsToPdf } from "../utils/pdfExport";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit, Plus, Download } from 'lucide-react';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'asset' as Account['type'],
    balance: 0
  });
  const { toast } = useToast();
  
  useEffect(() => {
    loadAccounts();
  }, []);
  
  const loadAccounts = () => {
    setAccounts(getAccounts());
  };
  
  const openAddDialog = () => {
    setSelectedAccount(null);
    setFormData({
      code: '',
      name: '',
      type: 'asset',
      balance: 0
    });
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (account: Account) => {
    setSelectedAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      balance: account.balance
    });
    setIsDialogOpen(true);
  };
  
  const openDeleteDialog = (account: Account) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value as Account['type']
    }));
  };
  
  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedAccount) {
      updateAccount(selectedAccount.id, formData);
      toast({
        title: "Cuenta actualizada",
        description: `La cuenta ${formData.name} ha sido actualizada.`
      });
    } else {
      createAccount(formData);
      toast({
        title: "Cuenta creada",
        description: `La cuenta ${formData.name} ha sido creada.`
      });
    }
    
    loadAccounts();
    setIsDialogOpen(false);
  };
  
  const handleDelete = () => {
    if (selectedAccount) {
      deleteAccount(selectedAccount.id);
      toast({
        title: "Cuenta eliminada",
        description: `La cuenta ${selectedAccount.name} ha sido eliminada.`
      });
      loadAccounts();
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleExportPdf = () => {
    exportAccountsToPdf(accounts);
    toast({
      title: "PDF Generado",
      description: "El catálogo de cuentas ha sido exportado a PDF."
    });
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
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Catálogo de Cuentas</h1>
          <p className="text-gray-500 mt-2">Administra las cuentas contables</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.code}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>{getAccountTypeName(account.type)}</TableCell>
                  <TableCell>{formatCurrency(account.balance)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(account)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(account)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No hay cuentas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add/Edit Account Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Activo</SelectItem>
                  <SelectItem value="liability">Pasivo</SelectItem>
                  <SelectItem value="equity">Capital</SelectItem>
                  <SelectItem value="revenue">Ingreso</SelectItem>
                  <SelectItem value="expense">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="balance">Saldo Inicial</Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                value={formData.balance}
                onChange={handleFormChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {selectedAccount ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              ¿Está seguro que desea eliminar la cuenta{" "}
              <span className="font-medium">{selectedAccount?.name}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounts;
