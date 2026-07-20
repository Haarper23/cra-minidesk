# CRA MiniDesk

> **Computer Repair & Service Management Platform**  
> A high-performance, professional-grade desktop and service management suite tailored for modern computer repair businesses. Designed to handle repair tracking, customer communications, devices, inventory, and billing seamlessly.

---

## 🚀 Tech Stack

The CRA MiniDesk architecture is divided into a robust, secure backend and a native-feeling desktop experience, optimized for macOS Apple Silicon.

*   **Frontend / Desktop**: React 18, TypeScript, Tauri 2 (native OS bindings, light resource footprint), TanStack Query, Zod.
*   **Backend**: Java 21, Spring Boot 3.3.1, REST APIs, Flyway (migrations), Maven Wrapper.
*   **Database**: PostgreSQL 16.
*   **Infrastructure**: Docker Compose (local DB orchestrations), GitHub Actions (CI/CD workflows).

---

## 🛠️ Main Features

*   **Customer & Device Management**: Detailed customer database, device logs (serial numbers, specifications, history).
*   **Repair Workflow Tracker**: Interactive status updates (Pending, Diagnostics, Awaiting Parts, Testing, Ready, Delivered) with customer notification hooks.
*   **Dashboard & Statistics**: Real-time service metrics, status breakdown, active and urgent repair order indicators.
*   **Billing & Payments**: Integrated PDF receipt generation, invoice tracking, payment statuses.
*   **Inventory Control**: Real-time component tracking, reorder indicators, association of parts to repair tickets.
*   **Secure-by-Default Design**: Role-based access controls, robust validation, secure token exchange.

---

## 📂 Project Structure

```text
cra-minidesk/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD pipelines
├── backend/                # Java 21 Spring Boot REST API (222 tests)
│   └── README.md
├── desktop/                # React / TypeScript / Tauri desktop client (Sprint 5A)
│   └── README.md
├── docs/                   # Exhaustive project documentation
│   ├── ARCHITECTURE.md     # Architectural patterns and system flow
│   ├── SECURITY.md         # Secure coding rules and constraints
│   ├── ROADMAP.md          # Multi-sprint delivery plan
│   └── DEVELOPMENT.md      # Setup, local testing, and tools list
├── docker-compose.yml      # Local development database orchestration
├── .gitignore              # Standard ignore configurations (IDE, Node, Java, macOS)
└── README.md               # Main project README (this file)
```

---

## 📊 Current Status

- **Backend Foundation (Sprints 1–4)**:
  - [x] Customer management API
  - [x] Device management API
  - [x] Repair order workflow & timeline API
  - [x] Dashboard statistics API
  - [x] Search, filtering, pagination & sorting
  - [x] PostgreSQL Testcontainers (222 backend automated tests passing)

- **Sprint 5A — React + Tauri Desktop Foundation**:
  - [x] Tauri 2 native desktop application shell (`com.berke.cra-minidesk`)
  - [x] Responsive layout with dark slate sidebar and professional light main canvas
  - [x] All-Turkish UI navigation & feedback components
  - [x] Live Dashboard screen connected to Spring Boot backend (`/api/dashboard`)
  - [x] Runtime Zod schema validation & fetch API client with timeout and typed errors
  - [x] Module placeholder screens (`/customers`, `/devices`, `/repair-orders`)
  - [x] 21 automated frontend unit and integration tests passing
  - [x] Production Vite build & Tauri debug bundle (`CRA MiniDesk.app` & `.dmg`)
  - [ ] Authentication (Not implemented yet - scheduled for future sprint)

---

## 📝 Development Notes

All core documentation for starting, writing, and contributing to the project is located under the [docs/](file:///Users/berkeemredeveci/AntigravityProjects/cra-minidesk/docs) directory:
- Refer to [desktop/README.md](file:///Users/berkeemredeveci/AntigravityProjects/cra-minidesk/desktop/README.md) to build and run the desktop client.
- Refer to [docs/DEVELOPMENT.md](file:///Users/berkeemredeveci/AntigravityProjects/cra-minidesk/docs/DEVELOPMENT.md) to initialize the PostgreSQL environment via Docker Compose and check required dependencies.
- Refer to [docs/ARCHITECTURE.md](file:///Users/berkeemredeveci/AntigravityProjects/cra-minidesk/docs/ARCHITECTURE.md) to understand data flow and component relationships.
