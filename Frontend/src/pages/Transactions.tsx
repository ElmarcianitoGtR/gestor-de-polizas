import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTransactions,
  getAccounts,
  createTransaction,
  deleteTransaction,
  getPredefinedAccountNames,
  getPredefinedReasons,
} from "../services/accountingService";
import { Transaction, TransactionEntry, Account } from "../types/accounting";
import { exportTransactionToPdf } from "../utils/pdfExport";
import { useToast } from "@/hooks/use-toast";
import { Download, Plus, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import DatePicker from "@/components/DatePicker";

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [predefinedAccountNames, setPredefinedAccountNames] = useState<
    string[]
  >([]);
  const [predefinedReasons, setPredefinedReasons] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [formData, setFormData] = useState({
    date: new Date(),
    description: "",
    reference: "",
    reason: "",
    entries: [
      {
        id: Date.now().toString(),
        accountId: "",
        description: "",
        debit: 0,
        credit: 0,
      },
    ] as TransactionEntry[],
  });

  const [newAccountData, setNewAccountData] = useState({
    code: "",
    name: "",
    type: "asset",
  });

  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
    loadAccountsData();
  }, []);

  const loadTransactions = () => {
    setTransactions(getTransactions());
  };

  const loadAccountsData = () => {
    setAccounts(getAccounts());
    setPredefinedAccountNames(getPredefinedAccountNames());
    setPredefinedReasons(getPredefinedReasons());
  };

  const openAddDialog = () => {
    setSelectedTransaction(null);
    setFormData({
      date: new Date(),
      description: "",
      reference: `POL-${Date.now().toString().slice(-6)}`,
      reason: "",
      entries: [
        {
          id: Date.now().toString(),
          accountId: "",
          description: "",
          debit: 0,
          credit: 0,
        },
      ],
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date,
      }));
    }
  };

  const handleReasonChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      reason: value,
    }));
  };

  const handleEntryChange = (
    id: string,
    field: keyof TransactionEntry,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => {
        if (entry.id === id) {
          if (field === "debit" && parseFloat(value as string) > 0) {
            return {
              ...entry,
              [field]: parseFloat(value as string) || 0,
              credit: 0,
            };
          }
          if (field === "credit" && parseFloat(value as string) > 0) {
            return {
              ...entry,
              [field]: parseFloat(value as string) || 0,
              debit: 0,
            };
          }
          return { ...entry, [field]: value };
        }
        return entry;
      }),
    }));
  };

  const addEntry = () => {
    setFormData((prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        {
          id: Date.now().toString(),
          accountId: "",
          description: "",
          debit: 0,
          credit: 0,
        },
      ],
    }));
  };

  const removeEntry = (id: string) => {
    if (formData.entries.length <= 1) {
      toast({
        title: "Error",
        description: "La póliza debe tener al menos una entrada.",
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      entries: prev.entries.filter((entry) => entry.id !== id),
    }));
  };

  const openNewAccountDialog = () => {
    setNewAccountData({
      code: `${accounts.length + 1}000`,
      name: "",
      type: "asset",
    });
    setIsNewAccountDialogOpen(true);
  };

  const handleNewAccountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewAccountData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewAccountTypeChange = (value: string) => {
    setNewAccountData((prev) => ({
      ...prev,
      type: value as "asset" | "liability" | "equity" | "revenue" | "expense",
    }));
  };

  const handleAddNewAccount = () => {
    if (!newAccountData.code || !newAccountData.name) {
      toast({
        title: "Error",
        description: "Código y nombre son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const createdAccount = {
      code: newAccountData.code,
      name: newAccountData.name,
      type: newAccountData.type as
        | "asset"
        | "liability"
        | "equity"
        | "revenue"
        | "expense",
      balance: 0,
    };

    import("../services/accountingService").then((service) => {
      service.createAccount(createdAccount);

      toast({
        title: "Cuenta creada",
        description: `La cuenta ${newAccountData.name} ha sido creada.`,
      });

      loadAccountsData();
      setIsNewAccountDialogOpen(false);
    });
  };

  const validateForm = (): boolean => {
    if (
      !formData.date ||
      !formData.description ||
      !formData.reference ||
      !formData.reason
    ) {
      toast({
        title: "Error",
        description:
          "Complete todos los campos obligatorios, incluyendo fechas y el motivo de cargo.",
        variant: "destructive",
      });
      return false;
    }

    for (const entry of formData.entries) {
      if (!entry.accountId) {
        toast({
          title: "Error",
          description: "Seleccione una cuenta para cada entrada.",
          variant: "destructive",
        });
        return false;
      }

      if (entry.debit === 0 && entry.credit === 0) {
        toast({
          title: "Error",
          description: "Cada entrada debe tener un valor de debe o haber.",
          variant: "destructive",
        });
        return false;
      }

      if (entry.debit > 0 && entry.credit > 0) {
        toast({
          title: "Error",
          description:
            "Una entrada no puede tener valores en debe y haber simultáneamente.",
          variant: "destructive",
        });
        return false;
      }
    }

    const totalDebit = formData.entries.reduce(
      (sum, entry) => sum + entry.debit,
      0
    );
    const totalCredit = formData.entries.reduce(
      (sum, entry) => sum + entry.credit,
      0
    );

    const roundedDebit = Math.round(totalDebit * 100) / 100;
    const roundedCredit = Math.round(totalCredit * 100) / 100;

    if (roundedDebit !== roundedCredit) {
      toast({
        title: "Error",
        description: `Los totales de debe (${roundedDebit.toFixed(
          2
        )}) y haber (${roundedCredit.toFixed(2)}) deben ser iguales.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const transactionData = {
      date: formData.date,
      issueDate: new Date(),
      description: formData.description,
      reference: formData.reference,
      reason: formData.reason,
      entries: formData.entries,
    };

    createTransaction(transactionData);

    toast({
      title: "Póliza creada",
      description: `La póliza ${formData.reference} ha sido creada.`,
    });

    loadTransactions();
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedTransaction) {
      deleteTransaction(selectedTransaction.id);
      toast({
        title: "Póliza eliminada",
        description: `La póliza ${selectedTransaction.reference} ha sido eliminada.`,
      });
      loadTransactions();
      setIsDeleteDialogOpen(false);
    }
  };

  const handleExportPdf = (transaction: Transaction) => {
    exportTransactionToPdf(transaction, accounts);
    toast({
      title: "PDF Generado",
      description: `La póliza ${transaction.reference} ha sido exportada a PDF.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pólizas</h1>
          <p className="text-gray-500 mt-2">Administrar pólizas contables</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Póliza
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Asiento</TableHead>
                <TableHead>Fecha Mov.</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Entradas</TableHead>
                <TableHead className="w-[150px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.entryNumber}</TableCell>
                  <TableCell>{transaction.date.toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.reference}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.reason}</TableCell>
                  <TableCell>{transaction.entries.length}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExportPdf(transaction)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(transaction)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-4 text-gray-500"
                  >
                    No hay pólizas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nueva Póliza</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha Movimiento</Label>
                <DatePicker
                  date={formData.date}
                  onDateChange={handleDateChange}
                  label="Seleccionar fecha"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reference">Referencia</Label>
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleFormChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo de Cargo</Label>
              <Select
                value={formData.reason}
                onValueChange={handleReasonChange}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Entradas</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEntry}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Entrada
                </Button>
              </div>

              {formData.entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-12 gap-4 items-end border p-3 rounded-md"
                >
                  <div className="col-span-4">
                    <Label htmlFor={`account-${entry.id}`}>Cuenta</Label>
                    <div className="flex gap-2">
                      <Select
                        value={entry.accountId}
                        onValueChange={(value) =>
                          handleEntryChange(entry.id, "accountId", value)
                        }
                      >
                        <SelectTrigger
                          id={`account-${entry.id}`}
                          className="flex-1"
                        >
                          <SelectValue placeholder="Seleccionar cuenta" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={openNewAccountDialog}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <Label htmlFor={`desc-${entry.id}`}>Descripción</Label>
                    <Input
                      id={`desc-${entry.id}`}
                      value={entry.description}
                      onChange={(e) =>
                        handleEntryChange(
                          entry.id,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`debit-${entry.id}`}>Debe</Label>
                    <Input
                      id={`debit-${entry.id}`}
                      type="number"
                      value={entry.debit || ""}
                      onChange={(e) =>
                        handleEntryChange(
                          entry.id,
                          "debit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`credit-${entry.id}`}>Haber</Label>
                    <Input
                      id={`credit-${entry.id}`}
                      type="number"
                      value={entry.credit || ""}
                      onChange={(e) =>
                        handleEntryChange(
                          entry.id,
                          "credit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>

                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-4 mt-4 text-sm">
                <div className="text-right">
                  <div className="font-medium">Total Debe:</div>
                  <div className="text-base mt-1">
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(
                      formData.entries.reduce(
                        (sum, entry) => sum + entry.debit,
                        0
                      )
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">Total Haber:</div>
                  <div className="text-base mt-1">
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(
                      formData.entries.reduce(
                        (sum, entry) => sum + entry.credit,
                        0
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Crear Póliza</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNewAccountDialogOpen}
        onOpenChange={setIsNewAccountDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Cuenta</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                name="code"
                value={newAccountData.code}
                onChange={handleNewAccountChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={newAccountData.name}
                onChange={handleNewAccountChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newAccountData.type}
                onValueChange={handleNewAccountTypeChange}
              >
                <SelectTrigger id="type">
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
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewAccountDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddNewAccount}>Crear Cuenta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>
              ¿Está seguro que desea eliminar la póliza{" "}
              <span className="font-medium">
                {selectedTransaction?.reference}
              </span>
              ?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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

export default Transactions;
