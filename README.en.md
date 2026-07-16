# Order Management System

[Version en espanol](README.md)

## Description

Order management system designed for small businesses and independent ventures. It provides a centralized REST API to manage customers, products, couriers, and orders. The system supports orders with multiple items, delivery assignment, order status tracking, and reliable historical records of business operations.

<br>

## Goals

The main goal of this project is to provide a REST API for order management in small businesses.

Main features include:

- User management.
- Customer management.
- Product management.
- Courier management.
- Order creation and administration.
- Order status control.
- Historical operation tracking.

<br>

## Main Technologies

- JavaScript
- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT
- Jest
- pnpm

<br>

## Project Architecture

The project follows a layered architecture with domain-based separation of responsibilities.

The main request flow is:

```txt
HTTP request
  -> routes
  -> middlewares
  -> validators
  -> controllers
  -> services
  -> models / database
  -> response
```

Each layer has a clear responsibility:

- `routes/`: defines endpoints and connects middlewares, validators, and controllers.
- `middlewares/`: centralizes token verification, rate limiting, field validation, and global error handling.
- `validators/`: contains input validation rules for body, params, and query params.
- `controllers/`: receives the validated request, extracts data from `req`, and delegates business logic.
- `services/`: contains domain business logic, including transactional operations and module-specific rules.
- `db/models/`: defines Sequelize models and their relationships.
- `db/migrations/`: versions database schema changes.
- `errors/`: defines custom errors for controlled API responses.
- `__test__/`: contains tests for endpoints, services, middlewares, and utility functions.
- `docs/`: contains the Swagger/OpenAPI specification.

```txt
.
|-- app.js
|-- server.js
|-- env.js
|-- docs/
|   `-- swagger.yml
`-- src/
    |-- controllers/
    |-- db/
    |   |-- config/
    |   |-- migrations/
    |   `-- models/
    |-- errors/
    |-- middlewares/
    |-- routes/
    |-- services/
    |   |-- auth/
    |   |   `-- utils/
    |   |-- couriers/
    |   |-- customers/
    |   |-- orders/
    |   |   `-- utils/
    |   |-- products/
    |   `-- users/
    |-- validators/
    `-- __test__/
```

<br>

## Data Model and Relationships

The data model is centered around the authenticated user. Each user manages their own products, customers, couriers, and orders.

### Main Entities

| Entity         | Table           | Description |
| -------------- | --------------- | ----------- |
| `User`         | `users`         | Represents the system user. Stores email, hashed password, and role. |
| `RefreshToken` | `refresh_token` | Stores refresh token hashes, expiration date, and revocation date. |
| `Product`      | `products`      | Product owned by a user, with optional SKU, price, stock, and soft delete. |
| `Customer`     | `customers`     | Customer owned by a user, with contact data, address, and soft delete. |
| `Courier`      | `couriers`      | Courier owned by a user, with contact data and soft delete. |
| `Order`        | `orders`        | Order associated with a customer and optionally assigned to a courier. Tracks status and total amount. |
| `OrderItem`    | `order_items`   | Product detail inside an order, with unit price, quantity, and subtotal. |

### Main Relationships

| Relationship | Cardinality | Description |
| ------------ | ----------- | ----------- |
| `User -> Product` | One to many | A user can have many products. |
| `User -> Customer` | One to many | A user can register many customers. |
| `User -> Courier` | One to many | A user can register many couriers. |
| `User -> RefreshToken` | One to many | A user can have multiple issued or revoked refresh tokens. |
| `Customer -> Order` | One to many | A customer can be associated with many orders. |
| `Courier -> Order` | One to many | A courier can be assigned to many orders. The assignment can be optional. |
| `Order -> OrderItem` | One to many | An order can contain multiple items. |
| `Product -> OrderItem` | One to many | A product can appear in multiple order items. |

### Relevant Domain Rules

- Main resources are always queried in the context of the authenticated user.
- `products`, `customers`, and `couriers` use soft delete through `deleted_at`.
- Orders support the `pending`, `cancelled`, and `completed` statuses.
- When an order is created, product stock is decreased and `total_amount` is calculated.
- When items in a pending order are updated, the order total is recalculated and stock is adjusted.
- Refresh tokens are not stored in plain text: their hash is stored and they can be revoked with `revoked_at`.

<br>

## Prerequisites

Required tools before installing the project:

- Node.js
- pnpm `10.33.3` or compatible
- PostgreSQL
- A PostgreSQL database created for development and another one for testing
- A production PostgreSQL connection URL, for example on Render

<br>

## Installation

After cloning the repository, install project dependencies:

```bash
pnpm install
```

<br>

## Environment Variables

The project uses different environment variable files depending on the execution environment.

### `.env`

File used to configure base PostgreSQL connection data for local environments.

```env
DB_USER="PostgreSQL user"
DB_PASS="PostgreSQL password"
DB_HOST=localhost
DB_PORT="Port where the database runs, usually 5432"
```

### `.env.dev`

File used to define the development database and JWT secrets.

```env
DB_NAME="Development database"
JWT_ACCESS_SECRET="Secret key to sign and verify access tokens in development"
JWT_REFRESH_SECRET="Secret key to sign and verify refresh tokens in development"
```

### `.env.test`

File used to define the test database and JWT secrets.

```env
DB_NAME="Test database"
JWT_ACCESS_SECRET="Secret key to sign and verify access tokens in tests"
JWT_REFRESH_SECRET="Secret key to sign and verify refresh tokens in tests"
```

### `.env.prod`

File used to run the server or migrations against the production database.

```env
DATABASE_URL="Production PostgreSQL connection URL"
JWT_ACCESS_SECRET="Secret key to sign and verify access tokens in production"
JWT_REFRESH_SECRET="Secret key to sign and verify refresh tokens in production"
```

> **Note:** in production, the project uses `DATABASE_URL` and SSL connection according to the Sequelize configuration.

<br>

## Running the Project

To run the project in development mode:

```bash
pnpm dev
```

By default, the server runs at:

```text
http://localhost:3000
```

The port can be configured through the `PORT` environment variable.

To run the project in production mode:

```bash
pnpm start
```

This command starts the server with `NODE_ENV=prod`, so it loads variables from `.env` and `.env.prod`.

The production API is available at:

```text
https://order-management-system-995e.onrender.com
```

<br>

## Available Scripts

Available project commands:

| Command                           | Description |
| --------------------------------- | ----------- |
| `pnpm dev`                        | Starts the development server using Nodemon. |
| `pnpm start`                      | Starts the production server with `NODE_ENV=prod`. |
| `pnpm test`                       | Runs all automated tests with Jest and Supertest. |
| `pnpm migration-create -- <name>` | Creates a new migration with Sequelize CLI. |
| `pnpm migrate-dev`                | Runs pending migrations on the development database. |
| `pnpm migrate-test`               | Runs pending migrations on the test database. |
| `pnpm migrate-prod`               | Runs pending migrations on the production database. |
| `pnpm undo-migrate-dev`           | Reverts the last migration executed in development. |
| `pnpm undo-migrate-test`          | Reverts the last migration executed in tests. |
| `pnpm undo-migrate-prod`          | Reverts the last migration executed in production. |
| `pnpm all-undo-migrate-dev`       | Reverts all migrations executed in development. |
| `pnpm all-undo-migrate-test`      | Reverts all migrations executed in tests. |
| `pnpm all-undo-migrate-prod`      | Reverts all migrations executed in production. Use with caution. |

<br>

## Database

The project uses PostgreSQL as the database management system and Sequelize as the ORM.

Database schema management and migrations are handled through Sequelize CLI.

### Supported Environments

| Environment | Variables used       | Migration command |
| ----------- | -------------------- | ----------------- |
| Development | `.env` and `.env.dev` | `pnpm migrate-dev` |
| Tests       | `.env` and `.env.test` | `pnpm migrate-test` |
| Production  | `.env` and `.env.prod` | `pnpm migrate-prod` |

Development and test environments require an accessible PostgreSQL instance and previously created databases for each environment.

In production, Sequelize uses `DATABASE_URL` with SSL enabled. Before deploying or starting the production server, verify that the variable exists and migrations have been executed.

To run migrations by environment:

```bash
pnpm migrate-dev
pnpm migrate-test
pnpm migrate-prod
```

To revert migrations:

```bash
pnpm undo-migrate-dev
pnpm undo-migrate-test
pnpm undo-migrate-prod
```

> **Note:** files generated by Sequelize CLI use CommonJS syntax. For that reason, generated migrations, seeders, and configuration files must use the `.cjs` extension.

<br>

## Tests

The project uses Jest and Supertest for automated API tests.

Test files are located in the `__test__` directory.

Tests use `.env.test` to configure the test database connection and JWT secrets during execution.

Before running tests, verify that the database defined in `.env.test` exists.

To run tests:

```bash
pnpm test
```

> **Note:** to run a specific test, pass the file name after `pnpm test`. Example: `pnpm test -- authRefresh.endpoint.test.js`.

<br>

## Security

The project implements several security measures to protect the API and stored data.

- JWT authentication.
- Password hashing with bcrypt.
- HTTP header protection with Helmet.
- Request limiting with Express Rate Limit.
- CORS configuration.
- Data validation with Express Validator.
- Centralized error handling.

<br>

## Production Deployment

The project is ready to run in production using `NODE_ENV=prod`.

Recommended deployment flow:

1. Configure `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `PORT` in the hosting provider.
2. Install dependencies with `pnpm install`.
3. Run pending migrations with `pnpm migrate-prod`.
4. Start the server with `pnpm start`.

The current production instance is deployed on Render:

```text
https://order-management-system-995e.onrender.com
```

<br>

## API Documentation

The interactive API documentation is available through Swagger UI.

Swagger allows users to inspect available endpoints, parameters, request bodies, and possible responses.

| Environment       | URL |
| ----------------- | --- |
| Local development | <http://localhost:3000/api-docs> |
| Production        | <https://order-management-system-995e.onrender.com/api-docs> |

Documentation files are located at:

```txt
./docs/swagger.yml
```

<br>

## Authentication Endpoints

Currently available authentication endpoints:

| Method | Endpoint             | Description |
| ------ | -------------------- | ----------- |
| POST   | `/api/auth/register` | Registers a new user. |
| POST   | `/api/auth/login`    | Authenticates a user and returns `accessToken` and `refreshToken`. |
| POST   | `/api/auth/logout`   | Logs out by revoking the user's active refresh tokens. |
| POST   | `/api/auth/refresh`  | Renews `accessToken` and `refreshToken` using a valid refresh token. |

Protected endpoints use the `Authorization` header with the `Bearer` scheme.

<br>

## User Endpoints

Currently available user endpoints:

| Method | Endpoint            | Description |
| ------ | ------------------- | ----------- |
| PATCH  | `/api/users`        | Updates the authenticated user's email and/or password. |
| DELETE | `/api/users/delete` | Deletes the authenticated user when the current password is provided. |

Both endpoints require a valid `accessToken` in the `Authorization` header with the `Bearer` scheme.

<br>

## Courier Endpoints

Currently available courier endpoints:

| Method | Endpoint            | Description |
| ------ | ------------------- | ----------- |
| POST   | `/api/couriers`     | Creates a courier associated with the authenticated user. Name is required and must be unique per user. |
| GET    | `/api/couriers`     | Gets the authenticated user's couriers with pagination. |
| GET    | `/api/couriers/:id` | Gets one authenticated user's courier by identifier. |
| PATCH  | `/api/couriers/:id` | Updates one authenticated user's courier by identifier. |
| DELETE | `/api/couriers/:id` | Soft deletes one authenticated user's courier by identifier. |

Soft-deleted couriers are excluded from active queries and are not physically deleted from the database.

Courier endpoints require a valid `accessToken` in the `Authorization` header with the `Bearer` scheme.

<br>

### Query Params for `GET /api/couriers`

| Query param | Description | Default value | Limit |
| ----------- | ----------- | ------------- | ----- |
| `page`      | Page number to query. Must be greater than or equal to 1. | `1` | - |
| `limit`     | Number of couriers per page. Must be between 1 and 50. | `20` | `50` |

<br>

### Path Params for `/api/couriers/:id`

| Path param | Description |
| ---------- | ----------- |
| `id`       | Courier identifier. Must be an integer greater than or equal to 1. |

<br>

### Body for `POST /api/couriers` and `PATCH /api/couriers/:id`

| Field   | Description |
| ------- | ----------- |
| `name`  | Courier name. Required on creation. |
| `phone` | Courier phone number. Optional. |
| `note`  | Additional note about the courier. Optional. |

<br>

## Customer Endpoints

Currently available customer endpoints:

| Method | Endpoint             | Description |
| ------ | -------------------- | ----------- |
| POST   | `/api/customers`     | Creates a customer associated with the authenticated user. `name` and `address` are required. |
| GET    | `/api/customers`     | Gets active customers for the authenticated user with pagination. |
| GET    | `/api/customers/:id` | Gets one authenticated user's customer by identifier. |
| PATCH  | `/api/customers/:id` | Updates one authenticated user's customer by identifier. |
| DELETE | `/api/customers/all` | Soft deletes all active customers for the authenticated user when the action is confirmed. |
| DELETE | `/api/customers/:id` | Soft deletes one authenticated user's customer by identifier. |

Soft-deleted customers are excluded from active queries and are not physically deleted from the database.

Customer endpoints require a valid `accessToken` in the `Authorization` header with the `Bearer` scheme.

<br>

### Query Params for `GET /api/customers`

| Query param | Description | Default value | Limit |
| ----------- | ----------- | ------------- | ----- |
| `page`      | Page number to query. Must be greater than or equal to 1. | `1` | - |
| `limit`     | Number of customers per page. Must be between 1 and 50. | `20` | `50` |

<br>

### Body for `POST /api/customers` and `PATCH /api/customers/:id`

| Field     | Description |
| --------- | ----------- |
| `name`    | Customer name. Required on creation. |
| `address` | Customer address. Required on creation. |
| `email`   | Optional customer email. |
| `phone`   | Optional customer phone number. |
| `note`    | Optional customer note. |

<br>

## Product Endpoints

Currently available product endpoints:

| Method | Endpoint            | Description |
| ------ | ------------------- | ----------- |
| POST   | `/api/products`     | Creates a product associated with the authenticated user. SKU is optional. |
| GET    | `/api/products`     | Gets the authenticated user's products with pagination. |
| GET    | `/api/products/:id` | Gets one authenticated user's product by identifier. |
| PATCH  | `/api/products`     | Updates authenticated user's products filtered by name. |
| PATCH  | `/api/products/:id` | Updates one authenticated user's product by identifier. |
| DELETE | `/api/products`     | Soft deletes authenticated user's products filtered by name. |
| DELETE | `/api/products/:id` | Soft deletes one authenticated user's product by identifier. |

Soft-deleted products are excluded from active queries and are not physically deleted from the database.

Product endpoints require a valid `accessToken` in the `Authorization` header with the `Bearer` scheme.

<br>

### Query Params for `GET /api/products`

| Query param | Description | Default value | Limit |
| ----------- | ----------- | ------------- | ----- |
| `page`      | Page number to query. Must be greater than or equal to 1. | `1` | - |
| `limit`     | Number of products per page. Must be between 1 and 50. | `20` | `50` |

<br>

### Path Params for `/api/products/:id`

| Path param | Description |
| ---------- | ----------- |
| `id`       | Product identifier. Must be an integer greater than or equal to 1. |

<br>

### Query Params for `PATCH /api/products` and `DELETE /api/products`

| Query param | Description |
| ----------- | ----------- |
| `word`      | Text used to filter products by name. Cannot be empty. |

<br>

### Body for `PATCH /api/products` and `PATCH /api/products/:id`

| Field   | Description |
| ------- | ----------- |
| `sku`   | New optional product code. |
| `name`  | New product name. |
| `price` | New decimal product price. |
| `stock` | New product stock. |

<br>

The `DELETE /api/products/:id` endpoint accepts the following path param:

| Path param | Description |
| ---------- | ----------- |
| `id`       | Product identifier. Must be an integer greater than or equal to 1. |

<br>

## Order Endpoints

Currently available order endpoints:

| Method | Endpoint                 | Description |
| ------ | ------------------------ | ----------- |
| POST   | `/api/orders`            | Creates an order associated with the authenticated user, decreases product stock, and calculates the total. |
| GET    | `/api/orders`            | Gets authenticated user's orders with pagination and optional status filter. |
| GET    | `/api/orders/:id`        | Gets one authenticated user's order by identifier. |
| PATCH  | `/api/orders/status/:id` | Updates a `pending` order status to `completed` or `cancelled`. |
| PATCH  | `/api/orders/:id`        | Updates `id_courier`, `note`, and order items. Only allowed when the order is `pending`. |

Order endpoints require a valid `accessToken` in the `Authorization` header with the `Bearer` scheme.

<br>

### Query Params for `GET /api/orders`

| Query param | Description | Default value | Limit |
| ----------- | ----------- | ------------- | ----- |
| `page`      | Page number to query. Must be greater than or equal to 1. | `1` | - |
| `limit`     | Number of orders per page. Must be between 1 and 50. | `20` | `50` |
| `status`    | Status used to filter orders. | - | `pending`, `completed`, `cancelled` |

<br>

### Path Params for `/api/orders/:id` and `/api/orders/status/:id`

| Path param | Description |
| ---------- | ----------- |
| `id`       | Order identifier. Must be an integer greater than or equal to 1. |

<br>

### Body for `POST /api/orders`

| Field         | Description |
| ------------- | ----------- |
| `actionToken` | UUID used for creation idempotency. Required. |
| `id_customer` | Order customer identifier. Required. |
| `id_courier`  | Assigned courier identifier. Required. |
| `note`        | Additional order note. Optional. |
| `items`       | Array of order products. Must contain at least one item. |

Each `items` element must include:

| Field        | Description |
| ------------ | ----------- |
| `id_product` | Product identifier. Required. |
| `quantity`   | Requested product quantity. Must be greater than 0. |

<br>

### Body for `PATCH /api/orders/:id`

| Field        | Description |
| ------------ | ----------- |
| `id_courier` | New assigned courier. Optional. |
| `note`       | New order note. Optional. |
| `items`      | Optional object with item operations: `delete` to remove and `create` to create. |

The `items.delete` field must be an array with `order_items` identifiers to remove. When an item is removed, its quantity is returned to the corresponding product stock.

The `items.create` field must be an array of new items with `id_product` and `quantity`. When an item is created, stock is decreased and the order `total_amount` is recalculated.

<br>

### Body for `PATCH /api/orders/status/:id`

| Field    | Description |
| -------- | ----------- |
| `status` | New order status. Can be `completed` or `cancelled`. |
