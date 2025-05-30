# API Documentation - Sistema Contable

## Configuración Base

**URL Base:** `http://localhost:8000`

## Endpoints Disponibles

### Cuentas

#### `GET /accounts`

Obtener todas las cuentas

**Parámetros de consulta:**

- `skip` (int, default: 0) - Número de registros a omitir
- `limit` (int, default: 100) - Límite de registros

**Respuesta:** Array de objetos Account

#### `GET /accounts/{account_id}`

Obtener una cuenta específica

**Parámetros de ruta:**

- `account_id` (string, requerido) - ID único de la cuenta

**Respuesta:** Objeto Account

#### `POST /accounts`

Crear una nueva cuenta

**Cuerpo de la petición:**

```json
{
  "code": "string (requerido)",
  "name": "string (requerido)",
  "account_type": "enum: ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE",
  "description": "string (opcional)",
  "is_active": "boolean (default: true)"
}
```

**Respuesta:** Objeto Account creado

#### `PUT /accounts/{account_id}`

Actualizar una cuenta existente

**Parámetros de ruta:**

- `account_id` (string, requerido) - ID único de la cuenta

**Cuerpo de la petición:**

```json
{
  "code": "string (opcional)",
  "name": "string (opcional)",
  "account_type": "enum (opcional)",
  "description": "string (opcional)",
  "is_active": "boolean (opcional)"
}
```

**Respuesta:** Objeto Account actualizado

#### `DELETE /accounts/{account_id}`

Eliminar una cuenta

**Parámetros de ruta:**

- `account_id` (string, requerido) - ID único de la cuenta

**Respuesta:** Confirmación de eliminación

### Transacciones

#### `GET /transactions`

Obtener todas las transacciones

**Parámetros de consulta:**

- `skip` (int, default: 0) - Número de registros a omitir
- `limit` (int, default: 100) - Límite de registros

**Respuesta:** Array de objetos Transaction

#### `GET /transactions/{transaction_id}`

Obtener una transacción específica

**Parámetros de ruta:**

- `transaction_id` (string, requerido) - ID único de la transacción

**Respuesta:** Objeto Transaction con detalles

#### `POST /transactions`

Crear una nueva transacción

**Cuerpo de la petición:**

```json
{
  "date": "string (formato: YYYY-MM-DD)",
  "reason": "string (requerido)",
  "description": "string (requerido)",
  "details": "Array de TransactionDetail (requerido)"
}
```

**Respuesta:** Objeto Transaction creado

#### `PUT /transactions/{transaction_id}`

Actualizar una transacción

**Parámetros de ruta:**

- `transaction_id` (string, requerido) - ID único de la transacción

**Cuerpo de la petición:**

```json
{
  "date": "string (opcional)",
  "reason": "string (opcional)",
  "description": "string (opcional)"
}
```

**Respuesta:** Objeto Transaction actualizado

#### `DELETE /transactions/{transaction_id}`

Eliminar una transacción

**Parámetros de ruta:**

- `transaction_id` (string, requerido) - ID único de la transacción

**Respuesta:** Confirmación de eliminación

### Catálogos

#### `GET /catalogs/account-names`

Obtener nombres predefinidos de cuentas

**Respuesta:** Array de strings con nombres de cuentas

#### `GET /catalogs/reasons`

Obtener motivos predefinidos

**Respuesta:** Array de strings con motivos de transacciones

### Diagramas T

#### `GET /t-accounts/{account_id}`

Generar diagrama T para una cuenta

**Parámetros de ruta:**

- `account_id` (string, requerido) - ID único de la cuenta

**Parámetros de consulta:**

- `reason` (string, opcional) - Filtrar por motivo específico

**Respuesta:** Objeto TAccountView

#### `GET /t-accounts/by-reason/{reason}`

Generar diagramas T filtrados por motivo

**Parámetros de ruta:**

- `reason` (string, requerido) - Motivo de las transacciones

**Respuesta:** Array de objetos TAccountView

### Estados Financieros

#### `GET /financial-statements`

Generar estado financiero

**Parámetros de consulta:**

- `start_date` (string, requerido) - Fecha inicio (YYYY-MM-DD)
- `end_date` (string, requerido) - Fecha fin (YYYY-MM-DD)

**Respuesta:** Objeto FinancialStatement

#### `GET /results-summary`

Generar resumen de resultados

**Parámetros de consulta:**

- `start_date` (string, requerido) - Fecha inicio (YYYY-MM-DD)
- `end_date` (string, requerido) - Fecha fin (YYYY-MM-DD)

**Respuesta:** Objeto ResultsSummary

## Modelos de Datos

### Account

```typescript
{
  id: string (UUID),
  code: string,
  name: string,
  account_type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE",
  description: string,
  is_active: boolean,
  created_at: datetime,
  updated_at: datetime
}
```

### Transaction

```typescript
{
  id: string (UUID),
  entry_number: integer (auto-incremental),
  date: date,
  reason: string,
  description: string,
  details: Array<TransactionDetail>,
  created_at: datetime,
  updated_at: datetime
}
```

### TransactionDetail

```typescript
{
  id: string (UUID),
  transaction_id: string (UUID),
  account_id: string (UUID),
  debit: decimal,
  credit: decimal,
  description: string
}
```

### TAccountView

```typescript
{
  account_id: string,
  account_name: string,
  account_type: string,
  entries: Array<TAccountEntry>,
  total_debit: decimal,
  total_credit: decimal,
  final_balance: decimal
}
```

### FinancialStatement

```typescript
{
  assets: decimal,
  liabilities: decimal,
  equity: decimal,
  revenue: decimal,
  expenses: decimal,
  net_income: decimal,
  start_date: date,
  end_date: date
}
```

### ResultsSummary

```typescript
{
  revenue: decimal,
  expenses: decimal,
  net_income: decimal,
  start_date: date,
  end_date: date
}
```

## Desarrollo

### Estructura del Proyecto

```
src/
├── services/
│   ├── apiClient.ts              # Cliente HTTP base
│   ├── accountingApiService.ts   # Servicio API
│   ├── accountingService.ts      # Servicio local
│   └── dataService.ts            # Servicio híbrido
├── types/
│   └── accounting.ts             # Definiciones TypeScript
└── pages/
    └── ...                       # Páginas de la aplicación
```

### Variables de Entorno

```env
VITE_API_URL=http://localhost:8000
```

## Código de Estado HTTP

- **200** - OK: Operación exitosa
- **201** - Created: Recurso creado exitosamente
- **404** - Not Found: Recurso no encontrado
- **422** - Unprocessable Entity: Error de validación
- **500** - Internal Server Error: Error del servidor
