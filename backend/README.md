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

---

## 🛠️ Repair Order API Endpoints

### 1. Create a Repair Order
```bash
curl -X POST http://localhost:8088/api/repair-orders \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": 1,
    "reportedIssue": "Device does not power on",
    "priority": "HIGH",
    "diagnosisNotes": "Initial inspection pending",
    "technicianNotes": null,
    "estimatedCost": 2500.00
  }'
```

### 2. List All Repair Orders
```bash
curl http://localhost:8088/api/repair-orders
```

### 3. Filter Repair Orders by Status
```bash
curl http://localhost:8088/api/repair-orders?status=DIAGNOSING
```

### 4. Get Repair Order by ID
```bash
curl http://localhost:8088/api/repair-orders/1
```

### 5. Get Repair Order by Order Number
```bash
curl http://localhost:8088/api/repair-orders/order-number/CRA-20260716-A1B2C3D4
```

### 6. Get Repair Orders for a Device
```bash
curl http://localhost:8088/api/devices/1/repair-orders
```

### 7. Update Repair Details
```bash
curl -X PUT http://localhost:8088/api/repair-orders/1 \
  -H "Content-Type: application/json" \
  -d '{
    "reportedIssue": "Device does not power on, liquid damage suspected",
    "priority": "URGENT",
    "diagnosisNotes": "Detected liquid residue on the logic board.",
    "technicianNotes": "Cleaned the board and replaced blown capacitor.",
    "estimatedCost": 2500.00,
    "finalCost": 2800.00
  }'
```

### 8. Update Repair Status
```bash
curl -X PATCH http://localhost:8088/api/repair-orders/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DIAGNOSING"
  }'
```

### 9. Delete an Eligible Repair Order
```bash
curl -X DELETE http://localhost:8088/api/repair-orders/1
```

---

## ⏳ Repair Order Timeline API Endpoints

### 1. Get Repair Order Timeline
```bash
curl http://localhost:8088/api/repair-orders/1/timeline
```

### Design Notes:
- Timeline entries are generated automatically by the backend system.
- Clients are not allowed to directly create, edit, or delete timeline entries (no write endpoints exist).
- The timeline records three main event types: creation (`REPAIR_ORDER_CREATED`), status transitions (`STATUS_CHANGED`), and changes to editable details (`REPAIR_DETAILS_UPDATED`).
- Details updates store only changed fields list alphabetically without exposing old/new field values.
- Deletions are cascaded, removing associated timeline histories when the parent repair order is deleted.

---

## 📊 Dashboard API Endpoints

### 1. Get Dashboard Statistics
```bash
curl http://localhost:8088/api/dashboard
```

### Response Payload:
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalCustomers": 12,
    "totalDevices": 18,
    "totalRepairOrders": 24,
    "activeRepairOrders": 10,
    "waitingForCustomerApproval": 2,
    "waitingForPart": 1,
    "readyForDelivery": 3,
    "urgentRepairOrders": 1,
    "completedToday": 2,
    "deliveredToday": 1,
    "repairOrdersByStatus": [
      { "status": "RECEIVED", "count": 1 },
      { "status": "DIAGNOSING", "count": 2 },
      { "status": "WAITING_FOR_CUSTOMER_APPROVAL", "count": 2 },
      { "status": "APPROVED", "count": 1 },
      { "status": "IN_REPAIR", "count": 0 },
      { "status": "WAITING_FOR_PART", "count": 1 },
      { "status": "COMPLETED", "count": 0 },
      { "status": "READY_FOR_DELIVERY", "count": 3 },
      { "status": "DELIVERED", "count": 12 },
      { "status": "CANCELLED", "count": 2 }
    ],
    "generatedAt": "2026-07-17T10:30:00Z"
  }
}
```

### Design Notes:
- The dashboard is completely read-only (no write operations are supported).
- Daily statistics (`completedToday` and `deliveredToday`) use UTC calendar date boundaries (inclusive start and exclusive end of UTC calendar day).
- Revenue, payment, inventory, and other non-operational metrics are not included in this foundation sprint.
