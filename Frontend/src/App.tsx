import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Ledger from "./pages/Ledger";
import Transactions from "./pages/Transactions";
import TransactionDetail from "./pages/TransactionDetail";
import TAccount from "./pages/TAccount";
import FinancialStatement from "./pages/FinancialStatement";
import ResultsSummary from "./pages/ResultsSummary";
import ApiDocumentation from "./pages/ApiDocumentation";
import NotFound from "./pages/NotFound";
import { toast } from "./components/ui/use-toast";
import { initializeDataService, getAccounts } from "./services/dataService";

// Create a new QueryClient instance outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  useEffect(() => {
    // Initialize data service and detect API connection
    const initializeApp = async () => {
      try {
        const { useApi, message } = await initializeDataService();

        // Show connection status notification
        toast({
          title: useApi ? "Modo API Activado" : "Modo Local Activado",
          description: message,
          duration: 5000,
        });

        // Load initial data
        const accounts = await getAccounts();
        if (accounts.length > 0) {
          toast({
            title: "Datos cargados exitosamente",
            description: `Se han cargado ${accounts.length} cuentas desde ${
              useApi ? "la API" : "el almacenamiento local"
            }.`,
          });
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        toast({
          title: "Error de inicialización",
          description:
            "Ocurrió un error al inicializar la aplicación. Usando modo local.",
          variant: "destructive",
        });
      }
    };

    initializeApp();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/accounts"
          element={
            <Layout>
              <Accounts />
            </Layout>
          }
        />
        <Route
          path="/ledger"
          element={
            <Layout>
              <Ledger />
            </Layout>
          }
        />
        <Route
          path="/transactions"
          element={
            <Layout>
              <Transactions />
            </Layout>
          }
        />
        <Route
          path="/transactions/:id"
          element={
            <Layout>
              <TransactionDetail />
            </Layout>
          }
        />
        <Route
          path="/t-account"
          element={
            <Layout>
              <TAccount />
            </Layout>
          }
        />
        <Route
          path="/financial-statement"
          element={
            <Layout>
              <FinancialStatement />
            </Layout>
          }
        />
        <Route
          path="/results-summary"
          element={
            <Layout>
              <ResultsSummary />
            </Layout>
          }
        />
        <Route
          path="/api-documentation"
          element={
            <Layout>
              <ApiDocumentation />
            </Layout>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster />
        <Sonner />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
