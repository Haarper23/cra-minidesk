# CRA MiniDesk Desktop Client

Desktop application for CRA MiniDesk (Computer Repair & Service Management Platform) built with **Tauri 2**, **React 18**, **TypeScript**, **Vite**, and **TanStack Query**.

---

## 📋 Requirements & Prerequisites

- **Node.js**: `v24.x` or higher
- **Package Manager**: `pnpm` (managed via Corepack)
- **Rust**: `v1.96.x` or higher
- **macOS Toolchain**: Xcode Command Line Tools (`xcode-select --install`)

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd desktop
pnpm install
```

### 2. Environment Setup

Create `.env` based on `.env.example`:

```bash
cp .env.example .env
```

Default configuration:

```env
VITE_API_BASE_URL=http://localhost:8088/api
```

> **API Base URL Behavior**: The application reads `VITE_API_BASE_URL` (defaulting to `http://localhost:8088/api`), validates the URL structure, and normalizes any trailing slashes automatically.

---

## 🏃 Running the Application

### Start Spring Boot Backend

Ensure PostgreSQL is running (`docker compose up -d`) and start the backend service:

```bash
cd backend
./mvnw spring-boot:run
```

Verify backend health at `http://localhost:8088/api/health`.

### Option A: Web Development Mode

```bash
cd desktop
pnpm dev
```

Navigates to `http://localhost:5173`.

### Option B: Tauri Native Desktop Application Mode

```bash
cd desktop
pnpm tauri:dev
```

Launches the native **CRA MiniDesk** desktop window connected to Vite live reload and the Spring Boot backend.

---

## 👥 Customer Management Module (Sprint 5B)

The Customer Management module (`/customers`) delivers a complete desktop experience:

- **List & Search**: Real-time free-text search across customer full name, email, and phone number with 350ms input debounce and accessible clear button.
- **Sorting**: Toggle ascending/descending sorts by column headers (`fullName`, `email`, `createdAt`, `updatedAt`).
- **Pagination**: Zero-based Spring Boot `PageResponse` metadata translation into 1-based UI pages with page bounds protection and automatic regression to previous page upon last item deletion.
- **Create Customer**: Accessible modal dialog (`CustomerFormDialog`) with client-side Zod validation and safe backend error presentation (e.g. duplicate email conflicts).
- **Edit Customer**: Modal dialog prefilling existing customer values with state preservation on error.
- **Delete Customer**: Modal confirmation dialog (`DeleteCustomerDialog`) displaying target customer name and relationship warning, with safe HTTP 409 conflict handling when customer owns devices or repair orders.
- **URL Synchronization**: Route search parameters (`?query=...&page=0&sortBy=createdAt&sortDirection=desc`) persist search and filter states.

---

## 💻 Device Management Module (Sprint 5C)

The Device Management module (`/devices`) replaces the earlier placeholder with a production-ready desktop experience:

- **List, Search & Filters**: Search devices across brand, model, serial number, and condition notes with 350ms input debounce. Filter by customer and device type (`LAPTOP`, `DESKTOP`, `PHONE`, `TABLET`, `MONITOR`, `PRINTER`, `OTHER`).
- **Global & Customer Search API**: Supported by `GET /api/devices` and `GET /api/customers/{customerId}/devices`.
- **Sorting**: Toggle ascending/descending sorts by column headers (`brand`, `model`, `deviceType`, `createdAt`, `updatedAt`).
- **Pagination**: Zero-based Spring Boot `PageResponse` pagination with automatic page regression.
- **Create Device**: Accessible modal dialog (`DeviceFormDialog`) with live customer selector (`useCustomers`), device type selector, client-side Zod validation, and backend error handling.

## 🛠️ Repair Orders Management Module (Sprint 5D)

The Repair Orders Management module (`/repair-orders`) delivers a production desktop experience for servicing workflows:

- **List, Search & Filters**: Search across service order number, customer name, device brand/model, and reported issue with 350ms input debounce. Filter by status (`RECEIVED`, `DIAGNOSING`, `WAITING_FOR_CUSTOMER_APPROVAL`, `APPROVED`, `IN_REPAIR`, `WAITING_FOR_PART`, `COMPLETED`, `READY_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) and priority (`LOW`, `NORMAL`, `HIGH`, `URGENT`).
- **Sorting & Pagination**: Toggle ascending/descending sorts by column headers (`orderNumber`, `priority`, `status`, `createdAt`) with 1-based pagination.
- **Create & Edit Order**: Accessible modal dialog (`RepairOrderFormDialog`) featuring bounded server-backed customer selector (`useCustomerSearch`, size=20) and customer-dependent bounded device selector (`useDeviceSearch`, size=20). Validated using Zod schemas.
- **Order Details**: Read-only modal dialog (`RepairOrderDetailsDialog`) displaying complete customer, device, cost breakdown, diagnosis, technician notes, and status timestamps.
- **Status Workflow Transition**: Modal dialog (`StatusChangeDialog`) enforcing valid domain state transitions (e.g. `RECEIVED` -> `DIAGNOSING`, `CANCELLED`) and preventing invalid transitions on terminal states (`DELIVERED`, `CANCELLED`). Uses typed HTTP `PATCH /api/repair-orders/{id}/status`.
- **Delete Repair Order**: Confirmation modal dialog (`DeleteRepairOrderDialog`) restricting deletion to repair orders in `RECEIVED` or `CANCELLED` status.
- **URL Synchronization**: Route search parameters (`?query=...&status=...&priority=...&page=0&sortBy=createdAt&sortDirection=desc`) persist search and filter states.
- **URL Synchronization**: Route search parameters (`?query=...&customerId=...&deviceType=...&page=0&sortBy=createdAt&sortDirection=desc`) persist search and filter states.

---

## 🧪 Testing & Code Quality

```bash
# Run TypeScript type check
pnpm typecheck

# Run ESLint
pnpm lint

# Check code formatting with Prettier
pnpm format:check

# Format code with Prettier
pnpm format

# Run Vitest unit & integration test suite (113 tests)
pnpm test:run
```

---

## 📦 Building for Production / Debug

```bash
# Build Vite frontend static bundle
pnpm build

# Check Tauri environment diagnostic info
pnpm tauri info

# Build native Tauri debug application & DMG
pnpm tauri build --debug
```

---

## ⚠️ Notes & Current Architecture State

- **Authentication**: Authentication is **not implemented yet** (planned for future sprints).
- **Module Status**:
  - `Gösterge Paneli (/dashboard)`: Fully implemented and connected to real Spring Boot backend statistics.
  - `Müşteriler (/customers)`: Fully implemented in Sprint 5B with CRUD, search, pagination, sorting, and 409 conflict handling.
  - `Cihazlar (/devices)`: Fully implemented in Sprint 5C with CRUD, customer selector, device type filter, search, pagination, sorting, and 409 conflict handling.
  - `Servis Kayıtları (/repair-orders)`: Fully implemented in Sprint 5D with status machine, customer and device selectors, priority filters, repair details modal, status change modal, deletion rules, and URL parameter persistence.
- **Common macOS Issues**: If `tauri build` fails on macOS, verify that Xcode Command Line Tools are installed (`xcode-select --install`) and that `pnpm` is active via Corepack (`corepack enable`).
