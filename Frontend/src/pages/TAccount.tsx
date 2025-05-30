
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  getAccounts, 
  getPredefinedReasons, 
  generateTAccount,
  generateTAccountsByReason
} from "../services/accountingService";
import { TAccountView, Account } from "../types/accounting";
import { useToast } from "@/components/ui/use-toast";

const TAccount: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [reasons, setReasons] = useState<string[]>([]);
  const [tAccountView, setTAccountView] = useState<TAccountView | null>(null);
  const [tAccountsList, setTAccountsList] = useState<TAccountView[]>([]);
  const [viewMode, setViewMode] = useState<"account" | "reason">("account");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    loadAccounts();
    setReasons(getPredefinedReasons());
  }, []);
  
  const loadAccounts = () => {
    const accountsData = getAccounts();
    setAccounts(accountsData);
    
    // Select first account by default if none selected
    if (accountsData.length > 0 && !selectedAccount) {
      setSelectedAccount(accountsData[0].id);
    }
  };
  
  useEffect(() => {
    if (viewMode === "account" && selectedAccount) {
      const tAccount = generateTAccount(selectedAccount);
      if (tAccount) {
        setTAccountView(tAccount);
      }
    } else if (viewMode === "reason" && selectedReason) {
      const tAccounts = generateTAccountsByReason(selectedReason);
      setTAccountsList(tAccounts.filter(account => 
        account.debitEntries.length > 0 || account.creditEntries.length > 0
      ));
    }
  }, [selectedAccount, selectedReason, viewMode]);
  
  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    setViewMode("account");
  };
  
  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason);
    setViewMode("reason");
  };
  
  const handleViewModeChange = (mode: "account" | "reason") => {
    setViewMode(mode);
  };
  
  const renderTAccount = (tAccount: TAccountView) => {
    return (
      <Card key={tAccount.accountId} className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>{tAccount.accountName} ({tAccount.accountType})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 border rounded-md overflow-hidden">
            {/* Debits (Left Side) */}
            <div className="border-r">
              <div className="bg-slate-100 p-2 font-semibold text-center border-b">DEBE</div>
              <div className="p-2">
                {tAccount.debitEntries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tAccount.debitEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell className="text-right">
                            {entry.debit.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold">
                          {tAccount.totalDebit.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-4">No hay cargos</p>
                )}
              </div>
            </div>
            
            {/* Credits (Right Side) */}
            <div>
              <div className="bg-slate-100 p-2 font-semibold text-center border-b">HABER</div>
              <div className="p-2">
                {tAccount.creditEntries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tAccount.creditEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell className="text-right">
                            {entry.credit.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold">
                          {tAccount.totalCredit.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-4">No hay abonos</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-right">
            <p className="font-semibold">
              Saldo: {tAccount.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Diagrama T</h1>
          <p className="text-gray-500 mt-2">
            Visualiza tus cuentas en formato de diagrama T
          </p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4 mb-6">
            <Button 
              variant={viewMode === "account" ? "default" : "outline"} 
              onClick={() => handleViewModeChange("account")}
            >
              Por Cuenta
            </Button>
            <Button 
              variant={viewMode === "reason" ? "default" : "outline"} 
              onClick={() => handleViewModeChange("reason")}
            >
              Por Motivo de Cargo
            </Button>
          </div>
          
          {viewMode === "account" ? (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Selecciona una cuenta:</label>
              <Select value={selectedAccount} onValueChange={handleAccountChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Selecciona un motivo:</label>
              <Select value={selectedReason} onValueChange={handleReasonChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Render the T Account views */}
      {viewMode === "account" && tAccountView && renderTAccount(tAccountView)}
      
      {viewMode === "reason" && tAccountsList.length > 0 && (
        <div className="space-y-6">
          {tAccountsList.map(tAccount => renderTAccount(tAccount))}
        </div>
      )}
      
      {viewMode === "reason" && tAccountsList.length === 0 && selectedReason && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No hay transacciones para el motivo seleccionado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TAccount;
