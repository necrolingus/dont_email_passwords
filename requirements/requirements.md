# Requirements

This document tracks functional and non-functional requirements for the project.

## Functional Requirements

- FR-001: The API must expose endpoints under `/api` for storing, retrieving, deleting secrets, and reading configuration/statistics.
- FR-002: The project must generate OpenAPI documentation from inline JSDoc annotations using `swagger-jsdoc`.
- FR-003: The project must serve Swagger UI using `swagger-ui-express`.
- FR-004: The application must expose an interactive Swagger UI endpoint at `/swagger`.
- FR-005: The application should expose raw OpenAPI JSON at `/swagger.json` for tooling support.
- FR-006: OpenAPI documentation must include all existing API endpoints:
  - `POST /api/secret`
  - `GET /api/secret/{key}`
  - `DELETE /api/secret/{key}`
  - `GET /api/config`
  - `GET /api/stats`
- FR-007: The project must maintain this requirements document in `requirements/requirements.md`.
- FR-008: Functional and non-functional requirements must be explicitly separated in this file.
- FR-009: The project must provide an MCP server implementation using `@modelcontextprotocol/sdk`.
- FR-010: The MCP server must expose an HTTP MCP endpoint at `/mcp`.
- FR-011: The MCP server must expose a health endpoint at `/health`.
- FR-012: MCP tools must call the existing REST API endpoints (`/api/*`) rather than internal business modules.
- FR-013: The MCP server must provide tools that map to existing API capabilities:
  - `store_secret` -> `POST /api/secret`
  - `get_secret` -> `GET /api/secret/{key}`
  - `delete_secret` -> `DELETE /api/secret/{key}`
  - `get_config` -> `GET /api/config`
  - `get_stats` -> `GET /api/stats`
- FR-014: The MCP server must be runnable as part of the Docker deployment.

## Non-Functional Requirements

- NFR-001: Swagger integration must preserve existing API behavior and response semantics.
- NFR-002: Swagger integration must be compatible with the current Node.js ESM project structure.
- NFR-003: Documentation endpoints must work alongside existing global middleware (headers/rate limiting).
- NFR-004: The requirements tracking process must remain lightweight and readable for contributors.
- NFR-005: OpenAPI metadata should remain clear and maintainable for future endpoint additions.
- NFR-006: MCP integration must remain loosely coupled and isolated in a dedicated module.
- NFR-007: MCP-to-REST calls must use configurable base URL and timeout values via environment variables.
- NFR-008: MCP error messages should preserve upstream HTTP status/body context where possible.
- NFR-009: MCP and REST services should support containerized deployment with separate processes.

## Change Log

- 2026-05-15: Initial requirements baseline created with Swagger and requirements-tracking scope.
- 2026-05-15: Added MCP server requirements for HTTP transport, REST endpoint adapter strategy, and Docker deployment.
