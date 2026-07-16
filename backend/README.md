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

---

## 👥 Customer API Endpoints

### 1. Create a Customer
```bash
curl -X POST http://localhost:8088/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "email": "jane.doe@example.com",
    "phoneNumber": "+1234567890",
    "notes": "Prefers morning appointments."
  }'
```

### 2. List All Customers
```bash
curl http://localhost:8088/api/customers
```

### 3. Get Customer by ID
```bash
curl http://localhost:8088/api/customers/1
```

### 4. Update a Customer
```bash
curl -X PUT http://localhost:8088/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "phoneNumber": "+9876543210",
    "notes": "Prefers morning appointments. Updated contact info."
  }'
```

### 5. Delete a Customer
```bash
curl -X DELETE http://localhost:8088/api/customers/1
```

---

## 💻 Device API Endpoints

### 1. Create a Device for Customer
```bash
curl -X POST http://localhost:8088/api/customers/1/devices \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Apple",
    "model": "MacBook Air M2",
    "serialNumber": "MBA-M2-TEST-001",
    "deviceType": "LAPTOP",
    "color": "Midnight",
    "accessories": "Charger included",
    "conditionNotes": "Small scratch on the lid"
  }'
```

### 2. List All Devices for Customer
```bash
curl http://localhost:8088/api/customers/1/devices
```

### 3. Get Device by ID
```bash
curl http://localhost:8088/api/devices/1
```

### 4. Update a Device
```bash
curl -X PUT http://localhost:8088/api/devices/1 \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Apple",
    "model": "MacBook Air M3",
    "serialNumber": "MBA-M3-TEST-999",
    "deviceType": "LAPTOP",
    "color": "Midnight Black",
    "accessories": "Charger and case included",
    "conditionNotes": "Small scratch on the lid. Otherwise pristine."
  }'
```

### 5. Delete a Device
```bash
curl -X DELETE http://localhost:8088/api/devices/1
```

