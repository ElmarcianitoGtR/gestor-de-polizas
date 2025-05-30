# Sistema Contable

Este es un sistema de polizas que utiliza los principios vistos en la clase de contabilidad financiera y una que otra cosa fueron extraidas de consultas contables con contadores externos. Este proyecto fue desarrollado con React y TypeScript para el FRONTEND y FastAPI para la gestion integral de transacciones financieras y reportes contables.

## Características Principales

- ✅ **Gestión de Cuentas**: CRUD completo para cuentas contables
- ✅ **Pólizas Contables**: Creación y gestión de transacciones
- ✅ **Diagramas T**: Visualización interactiva de movimientos por cuenta
- ✅ **Estados Financieros**: Generación automática de estados financieros
- ✅ **Exportación PDF**: Exportación de todos los reportes a PDF
- ✅ **Modo Híbrido**: Detección automática de API o funcionamiento local
- ✅ **Interfaz Moderna**: Diseño responsivo con Tailwind CSS y shadcn/ui

## Tecnologías Utilizadas

### Frontend

- **React 18** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes
- **React Router** para navegación
- **TanStack Query** para gestión de estado
- **jsPDF** para exportación PDF

### Backend (NO ES TAN IMPORTANTE, PORQUE EL FRONT LO PUEDES CONECTAR A OTRA API QUE TENGAS FUNCIONANDO O QUE DESARROLLES, DA IGUAL LA TECNOLOGIA)

- **FastAPI** con SQLAlchemy
- **PostgreSQL** como base de datos
- **CORS** configurado para desarrollo
- **UVICORN** es el encargado de correr el API

## Instalación y Configuración

### Prerequisitos

- Node.js 16+ y npm
- (Opcional) Python 3.8+ para la API

### Instalación del Frontend

```bash
# Clonar el repositorio
git clone https://github.com/ElmarcianitoGtR/gestor-de-polizas.git
cd gestor-de-polizas

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Instalación del Backend (Opcional)

```bash
# En un directorio separado para la API
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic-core multipart

# Ejecutar el servidor FastAPI
uvicorn main:app --reload --port 8000
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8000
```

### Detección Automática de API

El sistema detecta automáticamente si la API FastAPI está disponible:

- **✅ API Conectada**: Datos sincronizados con base de datos del servidor
- **⚠️ Modo Local**: Datos almacenados en localStorage del navegador

## Documentación

### Documentación API Completa

- [📖 API Documentation](./API_DOCUMENTATION.md) - Documentación completa de endpoints, modelos y configuración

### Estructura del FRONTEND

```
src/
├── components/                       # Componentes reutilizables
│   ├── ui/                           # Componentes de shadcn/ui
│   └── Layout.tsx                    # Layout principal
├── pages/                            # Páginas de la aplicación
│   ├── Dashboard.tsx                 # Panel principal
│   ├── Accounts.tsx                  # Gestión de cuentas
│   ├── Transactions.tsx              # Pólizas contables
│   ├── Ledger.tsx                    # Libro contable
│   ├── TAccount.tsx                  # Diagramas T
│   └── FinancialStatement.tsx        # Estados financieros
├── services/                         # Lógica de negocio
│   ├── dataService.ts                # Servicio híbrido (API/Local)
│   ├── apiClient.ts                  # Cliente HTTP
│   └── accountingService.ts          # Servicio local
├── types/                            # Definiciones TypeScript
└── utils/                            # Utilidades
```

## Desarrollo

### Comandos Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de la build
npm run lint         # Linting del código
```

### Agregar Nuevas Funcionalidades

Para agregar nuevas páginas:

1. Crear el componente en `src/pages/`
2. Agregar la ruta en `src/App.tsx`
3. Añadir navegación en `src/components/Layout.tsx`

### API Integration

El sistema funciona en modo híbrido:

- **Con API**: Conecta automáticamente a `http://localhost:8000`
- **Sin API**: Funciona completamente offline con localStorage

## Soporte

- 📧 **Email**: cfabian08@alumnos.uaq.mx
- 💬 **Instagram personal**: [@cfabian.jimenez](https://instagram.com/cfabian.jimenez)

---

**Desarrollado por [@x.\_.marsha](https://instagram.com/x._.marsha)**
