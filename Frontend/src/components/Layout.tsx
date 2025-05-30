import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Inicio" },
    { path: "/accounts", label: "Cuentas" },
    { path: "/ledger", label: "Libro Contable" },
    { path: "/transactions", label: "Pólizas" },
    { path: "/financial-statement", label: "Estado Financiero" },
    { path: "/results-summary", label: "Resumen de Resultados" },
    { path: "/api-documentation", label: "DEV" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-gradient-to-r from-blue-700 to-purple-700 text-white py-6 px-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Sistema Contable
          </h1>
        </div>
      </header>

      <div className="bg-gradient-to-r from-blue-800 to-purple-800 text-white shadow-md">
        <nav className="container mx-auto flex overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-5 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 border-transparent hover:border-white/50",
                isActive(item.path)
                  ? "bg-white/20 text-white border-white backdrop-blur-sm"
                  : "hover:bg-white/10"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="animate-fade-in">{children}</div>
      </main>

      <footer className="bg-gradient-to-r from-gray-100 to-gray-200 py-6 px-6 border-t shadow-inner">
        <div className="container mx-auto text-center">
          <div className="text-gray-600 text-sm mb-2">
            &copy; {new Date().getFullYear()} Sistema Contable
            <h2 className="text-xs text-gray-500">
              Desarrollado por @x._.marsha
            </h2>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
