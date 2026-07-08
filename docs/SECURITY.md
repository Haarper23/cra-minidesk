# Security Architecture & Rules

This document outlines the security-by-default standards, architectural constraints, and coding practices implemented to secure **CRA MiniDesk**.

---

## 🔒 Secure-by-Default Rules

We enforce a strict posture across all layers:
1.  **Least Privilege**: The application database user (`cra_user`) has access limited strictly to the `cra_minidesk` database schema. Superuser access is banned in application runtime.
2.  **Transport Encryption**: All client-server communications in production must use HTTPS with TLS 1.3. Local development fallback to HTTP is restricted solely to localhost loops.
3.  **Tauri Isolation**: Tauri's API surface is restricted. Only required native bindings are enabled in the Tauri configuration (`tauri.conf.json`) to prevent arbitrary system execution from the UI layer.

---

## 🛡️ Server-Side Validation

Client validation is only for user convenience. The backend treats all incoming payloads as untrusted.
*   **JSR 380 Validation**: Every REST API controller class enforces validation constraints (e.g., `@NotNull`, `@Size`, `@Pattern`, `@Email`) on `@RequestBody` transfer objects.
*   **Input Sanitization**: Strings containing text input are sanitized to prevent cross-site scripting (XSS) and SQL injection (which is also prevented by Hibernate/JPA parameterized queries).
*   **Domain Validation**: Business rules (e.g., trying to complete a repair order that has no diagnostics logged) are validated within the transaction service boundary.

---

## 🔑 Authentication & Authorization (Future Implementation)

A stateless security configuration will be integrated during Sprint 2/3.
*   **JWT Token Scheme**: The desktop client will obtain a JWT (JSON Web Token) upon login. The token will be attached to the `Authorization: Bearer <token>` header of every subsequent HTTP request.
*   **Role-Based Access Control (RBAC)**: Enforced via Spring Security annotations (e.g., `@PreAuthorize`).
    *   *Technician*: Can manage repairs, inventory, and devices.
    *   *Administrator*: Full access, including employee management, configurations, and billing adjustments.

---

## 📁 Sensitive Data Rules

*   **Keychain Storage**: JWT tokens and configuration secrets are never written to disk in plain text. They must be stored using Tauri’s secure keychain integrations (leveraging macOS Keychain).
*   **Memory Hygiene**: Secrets are cleared from variables immediately after usage.

---

## 🔑 Password Storage Rules

Passwords must never be stored in plain text or reversible formats.
*   **Hashing Standard**: The backend will use **BCrypt** (with a work factor of 12) or **Argon2id** via Spring Security's crypto package.
*   **Salts**: A unique cryptographically secure salt is generated per password.

---

## 📝 Logging Rules

Logs must serve audit needs without violating user privacy.
*   **No PII (Personally Identifiable Information)**: Customer names, phone numbers, email addresses, and physical addresses must never be written to stdout or log files. Use database IDs for tracking context.
*   **No Secrets**: Passwords, raw JWT tokens, and cryptographic keys are explicitly stripped/excluded from log outputs.
*   **Structured Logs**: Spring Boot is configured to write structured logs, ensuring trace IDs are propagated across threads to facilitate debugging.
