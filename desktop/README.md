# CRA MiniDesk Desktop Client

This directory will host the cross-platform desktop user interface for CRA MiniDesk.

## 🛠️ Planned Stack

*   **Runtime Shell**: Tauri (Rust-based core, utilizing native system WebViews)
*   **UI Framework**: React
*   **Language**: TypeScript
*   **Build Tool**: Vite

## 📌 Implementation Notes

The desktop application is scheduled for bootstrapping and UI development in Sprint 4. It will communicate exclusively with the Spring Boot backend service via a REST API. Running within Tauri guarantees native windowing integrations, security constraints, and a lightweight footprint on macOS.
