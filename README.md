# Asset Management

Standalone Spring Boot service implementing asset lifecycle status management. This project is intentionally separate from Enfec One; Enfec One is used only as the architectural reference.

## Requirement-to-code analysis

| Requirement | Implementation |
|---|---|
| Reuse existing Asset model if available | No confirmed Asset entity was found in the supplied Enfec One backend source; therefore this standalone project defines `AssetEntity`. |
| Lifecycle statuses | `AssetStatus`: `IN_STOCK`, `ASSIGNED`, `IN_REPAIR`, `RETIRED` |
| Create asset | `POST /api/v1/assets` |
| Read assets | `GET /api/v1/assets`, `GET /api/v1/assets/{id}` |
| Update status | `PATCH /api/v1/assets/{id}/status` |
| Validate supported statuses | Java enum + PostgreSQL CHECK constraint |
| Invalid requests | Global handler returns HTTP 400 |
| Missing asset | `AssetNotFoundException` -> HTTP 404 |
| Duplicate asset tag | `DuplicateAssetTagException` -> HTTP 409 |
| Persistence | JPA repository + PostgreSQL + Flyway |
| Architecture | Controller -> Service -> Repository -> DB |
| Testing | JUnit/Mockito service tests + Postman collection |

## Statuses

- `IN_STOCK`
- `ASSIGNED`
- `IN_REPAIR`
- `RETIRED`

Only these values are accepted by the API. No additional transition restrictions were invented because the requirement specifies supported statuses but does not define a transition matrix.

## API flow

```text
Postman / Client
      |
      v
AssetController
      |
      v
AssetService / AssetServiceImpl
      |
      v
AssetRepository (Spring Data JPA)
      |
      v
PostgreSQL asset table
```

## Run locally

Prerequisites: Java 21, Docker, and a Gradle-capable IDE or Gradle installation.

Start PostgreSQL:

```bash
docker compose up -d
```

The standalone database is exposed on host port `5434`, so it does not conflict with Enfec One's PostgreSQL on `5432`.

Run the application from IntelliJ using `AssetManagementApplication`, or with Gradle:

```bash
./gradlew bootRun
```

Default API base URL: `http://localhost:8084`

## Manual API test

Create:

```http
POST /api/v1/assets
Content-Type: application/json

{
  "assetTag": "LAP-001",
  "name": "Dell Latitude 5440",
  "category": "Laptop",
  "manufacturer": "Dell",
  "model": "Latitude 5440",
  "status": "IN_STOCK"
}
```

Update status:

```http
PATCH /api/v1/assets/{id}/status
Content-Type: application/json

{
  "status": "ASSIGNED"
}
```

Invalid status example:

```json
{"status":"LOST"}
```

Expected result: HTTP 400 with `INVALID_REQUEST`.

## Automated tests

```bash
./gradlew test
```

The tests cover default status, status persistence through the service, and missing-asset handling.

## Branching / assessment rule

Do not push or merge this project into `main` or any shared branch. Use a local/private assessment branch or repository only.

## Asset Request Workflow

The application now includes an Asset Request workflow alongside the existing Asset Management lifecycle.

Workflow:

`PENDING_APPROVAL -> APPROVED -> FULFILLMENT_PENDING -> ASSIGNED -> FULFILLED -> CLOSED`

When Finance approval is required:

`PENDING_APPROVAL -> FINANCE_PENDING -> FULFILLMENT_PENDING -> ASSIGNED -> FULFILLED -> CLOSED`

Higher Authority rejection and Finance rejection move the request to `REJECTED`.

Procurement/Purchase is intentionally not included in this version.

### Request pages

- `/requests` - Admin Asset Requests
- `/hr` - HR Dashboard
- `/manager` - Manager Dashboard
- `/finance` - Finance Dashboard
- `/approvals` - Higher Authority Approvals

### Demo users

- Admin: `admin` / `admin123`
- HR: `hr` / `hr123`
- Manager: `manager` / `manager123`
- Finance: `finance` / `finance123`
- Higher Authority: `approver` / `approver123`
- Employee: `employee` / `employee123`

Demo users are created automatically by `DataInitializer` when they do not already exist.

### Close Request

Only a fulfilled request can be marked closed. Closing records `closedBy`, `closedAt`, and an optional closure note and adds a request-history entry.
