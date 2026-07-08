# Development Guide

Welcome to the **CRA MiniDesk** workspace. This guide explains how to configure your local machine, run development services, and align with core workflows.

---

## 🛠️ Required Tools

Ensure the following tools are installed on your macOS Apple Silicon development system:

*   **Java Development Kit (JDK)**: JDK 21 (Temurin or GraalVM recommended).
*   **Docker**: Docker Desktop for Mac (Apple Silicon version).
*   **Node.js**: Node 20 LTS or higher.
*   **Tauri Prerequisites**: Rust development toolchain (`rustup`, `cargo`) along with system webkit libraries.
*   **IDE**: IntelliJ IDEA (Ultimate or Community) or VS Code.

---

## 🗄️ Database Setup (Docker Compose)

The local development stack uses PostgreSQL 16 hosted via Docker. 

### Start Database
Run the following command in the project root:
```bash
docker compose up -d
```

### Stop Database
To spin down the database without deleting the persistent volume:
```bash
docker compose down
```

### Connection Details
*   **Host**: `localhost`
*   **Port**: `55432` (mapped from standard container port `5432`)
*   **Database**: `cra_minidesk`
*   **Username**: `cra_user`
*   **Password**: `cra_password`

---

## 📁 Workspace Structure

*   **`backend/`**: Serves as the Java 21 Spring Boot maven project. It includes database migration files (Flyway), API controllers, and unit tests.
*   **`desktop/`**: Serves as the Tauri application enclosing a React/TypeScript web app. Renders pages using Vite.

---

## 🔄 Development Workflow

Follow this systematic approach when building features:

### 1. Database Migrations
When adding database fields or tables, always create a raw SQL migration file under `backend/src/main/resources/db/migration/V{Version}__{Description}.sql`. Do not manually modify existing database objects directly.

### 2. Backend Coding
Start the Spring Boot server locally. Verify endpoints with unit tests. Avoid committing untested controller integrations.

### 3. Desktop Coding
Run the client with Tauri:
```bash
# Inside the desktop/ folder
npm run tauri dev
```
This launches a native OS wrapper communicating with your local Spring Boot instance.

### 4. Git Flow & Branching
*   Main branch is protected: `main`.
*   Create feature branches: `feature/sprint-{N}-{description}`.
*   Commit message syntax: Follow [Conventional Commits](https://www.conventionalcommits.org/):
    *   `feat: add customer profile fields`
    *   `fix: resolve status state validation overflow`
    *   `chore: update workflow config`
