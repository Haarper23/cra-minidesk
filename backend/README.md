# CRA MiniDesk Backend

This directory contains the Spring Boot backend service for **CRA MiniDesk (Computer Repair & Service Management Platform)**.

---

## 🛠️ Stack & Requirements

*   **Java Version**: JDK 21 (LTS)
*   **Framework**: Spring Boot 3.3.1 (REST API Architecture)
*   **Database**: PostgreSQL 16
*   **Database Migration**: Flyway Migration
*   **Validation**: JSR 380 (Validation API)
*   **Build Tool**: Maven Wrapper (`mvnw`)

---

## 🚀 Running Local Database

Before booting the backend, start the PostgreSQL container using Docker Compose from the project **root** directory:

```bash
# Go to root workspace and start database container
docker compose up -d
```

Connection parameters are defined inside [application.yml](file:///Users/berkeemredeveci/AntigravityProjects/cra-minidesk/backend/src/main/resources/application.yml):
*   **Endpoint**: `localhost:55432`
*   **Database**: `cra_minidesk`
*   **User / Password**: `cra_user` / `cra_password`

---

## 🧪 Running Automated Tests

Run the following command inside the `backend/` folder to run the unit and integration tests (including the Spring Boot context loader and health check endpoints):

```bash
./mvnw test
```

---

## 🏃 Running the Application

To boot up the Spring Boot development server on local port `8088`:

```bash
./mvnw spring-boot:run
```

---

## 📡 Health Endpoints

You can verify the backend is running by querying the health API:

```bash
curl http://localhost:8088/api/health
```

### Response Payload:
```json
{
  "success": true,
  "message": "CRA MiniDesk backend is running",
  "data": {
    "status": "UP"
  }
}
```
