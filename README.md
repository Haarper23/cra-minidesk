# CRA MiniDesk

> **Computer Repair & Service Management Platform**  
> A high-performance, professional-grade desktop and service management suite tailored for modern computer repair businesses. Designed to handle repair tracking, customer communications, devices, inventory, and billing seamlessly.

---

## 🚀 Tech Stack

The CRA MiniDesk architecture is divided into a robust, secure backend and a native-feeling desktop experience, optimized for macOS Apple Silicon.

*   **Frontend / Desktop**: React, TypeScript, Tauri (native OS bindings, light resource foot-print).
*   **Backend**: Java 21, Spring Boot, REST APIs, Flyway (migrations), Maven Wrapper.
*   **Database**: PostgreSQL 16.
*   **Infrastructure**: Docker Compose (local DB orchestrations), GitHub Actions (CI/CD workflows).

---

## 🛠️ Main Features

*   **Customer & Device Management**: Detailed customer database, device logs (serial numbers, specifications, history).
*   **Repair Workflow Tracker**: Interactive status updates (Pending, Diagnostics, Awaiting Parts, Testing, Ready, Delivered) with customer notification hooks.
*   **Billing & Payments**: Integrated PDF receipt generation, invoice tracking, payment statuses.
*   **Inventory Control**: Real-time component tracking, reorder indicators, association of parts to repair tickets.
*   **Secure-by-Default Design**: Role-based access controls, robust validation, secure token exchange.

---

## 📂 Project Structure

```text
cra-minidesk/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD pipelines
├── backend/                # Java 21 Spring Boot REST API
│   └── README.md
├── desktop/                # React / TypeScript / Tauri desktop client
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

**Sprint 0 — Product Foundation**
- [x] Directory structure setup.
- [x] Initial configuration for `.gitignore`, `docker-compose.yml`.
- [x] Architecture, Security, Roadmap, and Development guidelines documented.
- [ ] Sprint 1 implementation (Customer & Device Management) — *Pending*.

---

## 📝 Development Notes

All core documentation for starting, writing, and contributing to the project is located under the [docs/](file:///Users/berkeemredeveci/AntigravityProjects/cra-minidesk/docs) directory:
- Refer to [docs/DEVELOPMENT.md](file:///Users/berkeemredeveci/AntigravityProjects/cra-minidesk/docs/DEVELOPMENT.md) to initialize the PostgreSQL environment via Docker Compose and check required dependencies.
- Refer to [docs/ARCHITECTURE.md](file:///Users/berkeemredeveci/AntigravityProjects/cra-minidesk/docs/ARCHITECTURE.md) to understand data flow and component relationships.
