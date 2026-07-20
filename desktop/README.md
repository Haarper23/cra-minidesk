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

The Customer Management module (`/customers`) replaces the earlier placeholder with a production-ready desktop experience:

- **List & Search**: Real-time free-text search across customer full name, email, and phone number with 350ms input debounce and accessible clear button.
- **Sorting**: Toggle ascending/descending sorts by column headers (`fullName`, `email`, `createdAt`, `updatedAt`).
- **Pagination**: Zero-based Spring Boot `PageResponse` metadata translation into 1-based UI pages with page bounds protection and automatic regression to previous page upon last item deletion.
- **Create Customer**: Accessible modal dialog (`CustomerFormDialog`) with client-side Zod validation and safe backend error presentation (e.g. duplicate email conflicts).
- **Edit Customer**: Modal dialog prefilling existing customer values with state preservation on error.
- **Delete Customer**: Modal confirmation dialog (`DeleteCustomerDialog`) displaying target customer name and relationship warning.
- **URL Synchronization**: Route search parameters (`?query=...&page=0&sortBy=createdAt&sortDirection=desc`) persist search and filter states.

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

# Run Vitest unit & integration test suite
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
  - `Müşteriler (/customers)`: Fully implemented in Sprint 5B with CRUD, search, pagination, and sorting.
  - `Cihazlar (/devices)`: Module placeholder for Sprint 5C.
  - `Servis Kayıtları (/repair-orders)`: Module placeholder for Sprint 5D.
- **Common macOS Issues**: If `tauri build` fails on macOS, verify that Xcode Command Line Tools are installed (`xcode-select --install`) and that `pnpm` is active via Corepack (`corepack enable`).
