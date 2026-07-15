# Sistema gestor de pedidos

## Descripción

Sistema gestor de pedidos orientado a pequeños comercios o emprendimientos, diseñado para administrar clientes, productos, repartidores y órdenes desde una API centralizada. Permite registrar pedidos con múltiples elementos, asignar responsables de entrega, controlar estados como pendiente, cancelado o completado, y conservar un historial confiable de las operaciones realizadas.

<br>

## Objetivos

El objetivo principal del proyecto es proporcionar una API REST para la gestión de pedidos en pequeños comercios o emprendimientos.

Las funcionalidades principales incluyen:

- Gestión de usuarios.
- Gestión de clientes.
- Gestión de productos.
- Gestión de repartidores.
- Creación y administración de órdenes.
- Control de estados de pedidos.
- Registro histórico de operaciones.

<br>

## Tecnologías principales

- JavaScript
- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT
- Jest
- pnpm

<br>

## Arquitectura del proyecto

El proyecto sigue una arquitectura basada en capas, con separación de responsabilidades.

```txt
docs/
src/
├── errors/
├── controllers/
├── services/
│   ├── auth/
│   │   └── utils/
│   └── products/
├── middlewares/
├── routes/
├── db/
│   ├── config/
│   ├── models/
│   ├── migrations/
│   └── seeders/
├── __test__/
└── validators/
```

<br>

## Requisitos previos

Herramientas necesarias antes de instalar el proyecto:

- Node.js
- pnpm
- PostgreSQL

<br>

## Instalación

Una vez clonado el repositorio, instalar las dependencias del proyecto:

```bash
pnpm install
```

<br>

## Variables de entorno

El proyecto utiliza diferentes archivos de variables de entorno según el ambiente de ejecución.

### `.env`

Archivo utilizado para configurar los datos base de conexión a PostgreSQL en local.

```env
DB_USER="Usuario de PostgreSQL"
DB_PASS="Contraseña de PostgreSQL"
DB_HOST=localhost
DB_PORT="Puerto en el que corre la base de datos, normalmente 5432"
```

### `.env.dev`

Archivo utilizado para indicar la base de datos de desarrollo y las claves secretas de JWT correspondientes.

```env
DB_NAME="Base de datos de desarrollo"
JWT_ACCESS_SECRET="Clave secreta para firmar y verificar tokens de acceso para desarrollo"
JWT_REFRESH_SECRET="Clave secreta para firmar y verificar tokens de refresco para desarrollo"
```

### `.env.test`

Archivo utilizado para indicar la base de datos de pruebas y las claves secretas de JWT correspondientes.

```env
DB_NAME="Base de datos de pruebas"
JWT_ACCESS_SECRET="Clave secreta para firmar y verificar tokens de acceso para pruebas"
JWT_REFRESH_SECRET="Clave secreta para firmar y verificar tokens de refresco para pruebas"
```

<br>

## Ejecución del proyecto

Para ejecutar el proyecto en modo desarrollo:

```bash
pnpm dev
```

Por defecto, el servidor se ejecuta en:

```text
http://localhost:3000
```

El puerto puede configurarse mediante la variable de entorno `PORT`.

<br>

## Scripts disponibles

Tabla con los comandos disponibles del proyecto.

| Comando                      | Descripción                                                            |
| ---------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                   | Inicia el servidor en modo desarrollo usando Nodemon.                  |
| `pnpm test`                  | Ejecuta todas las pruebas.                                             |
| `pnpm migration-create`      | Crea una nueva migración con Sequelize CLI.                            |
| `pnpm migrate-dev`           | Ejecuta las migraciones pendientes en el entorno de desarrollo.        |
| `pnpm migrate-test`          | Ejecuta las migraciones pendientes en el entorno de pruebas.           |
| `pnpm undo-migrate-dev`      | Revierte la última migración ejecutada en el entorno de desarrollo.    |
| `pnpm undo-migrate-test`     | Revierte la última migración ejecutada en el entorno de pruebas.       |
| `pnpm all-undo-migrate-dev`  | Revierte todas las migraciones ejecutadas en el entorno de desarrollo. |
| `pnpm all-undo-migrate-test` | Revierte todas las migraciones ejecutadas en el entorno de pruebas.    |

<br>

## Base de datos

El proyecto utiliza PostgreSQL como sistema de gestión de base de datos y Sequelize como ORM.

La administración del esquema de la base de datos y la ejecución de migraciones se realiza mediante Sequelize CLI.

### Entornos de desarrollo y pruebas

Para los entornos de desarrollo y pruebas se requiere una instancia de PostgreSQL accesible y la creación previa de las bases de datos correspondientes a cada entorno.

Una vez configuradas las variables de entorno, las migraciones pueden ejecutarse utilizando los scripts disponibles en el proyecto.

> **Nota:** los archivos generados por Sequelize CLI utilizan sintaxis CommonJS. Por este motivo, las migraciones, seeders y archivos de configuración generados deben utilizar la extensión `.cjs`.

Para ejecutar las migraciones:

```bash
pnpm migrate-{entorno}
```

<br>

## Pruebas

El proyecto utiliza Jest y Supertest para realizar pruebas automatizadas sobre la API.

Los archivos de prueba se encuentran en el directorio `__test__`.

Las pruebas utilizan el archivo `.env.test` para configurar la conexión con la base de datos de pruebas y la clave JWT utilizada durante la ejecución.

Antes de ejecutar las pruebas, verificar que la base de datos indicada en `.env.test` exista.

Para ejecutar las pruebas:

```bash
pnpm test
```

> **Nota:** para ejecutar una prueba específica, puede indicarse el nombre del archivo luego de `pnpm test`. Por ejemplo: `pnpm test -- authRefresh.endpoint.test.js`.

<br>

## Seguridad

El proyecto implementa diferentes medidas de seguridad para proteger la API y los datos almacenados.

- Autenticación mediante JWT.
- Hash de contraseñas utilizando bcrypt.
- Protección de cabeceras HTTP mediante Helmet.
- Limitación de peticiones mediante Express Rate Limit.
- Configuración de CORS.
- Validación de datos utilizando Express Validator.
- Manejo centralizado de errores.

<br>

## Documentación de la API

La documentación interactiva de la API está disponible mediante Swagger UI.

Swagger permite visualizar los endpoints disponibles, sus parámetros, cuerpos de solicitud y posibles respuestas.

| Entorno          | URL                              |
| ---------------- | -------------------------------- |
| Desarrollo local | <http://localhost:3000/api-docs> |

Los archivos relacionados con la documentación se encuentran en:

```txt
./docs/swagger.yml
```

<br>

## Endpoints de autenticación

Los endpoints de autenticación disponibles actualmente son:

| Método | Endpoint             | Descripción                                                                  |
| ------ | -------------------- | ---------------------------------------------------------------------------- |
| POST   | `/api/auth/register` | Registra un usuario nuevo.                                                   |
| POST   | `/api/auth/login`    | Autentica un usuario y devuelve `accessToken` y `refreshToken`.              |
| POST   | `/api/auth/logout`   | Cierra la sesión revocando los refresh tokens activos del usuario.           |
| POST   | `/api/auth/refresh`  | Renueva el `accessToken` y el `refreshToken` usando un refresh token válido. |

Los endpoints protegidos utilizan el encabezado `Authorization` con el esquema `Bearer`.

<br>

## Endpoints de usuarios

Los endpoints de usuario disponibles actualmente son:

| Método | Endpoint            | Descripción                                                          |
| ------ | ------------------- | -------------------------------------------------------------------- |
| PATCH  | `/api/users`        | Actualiza el email y/o contraseña del usuario autenticado.           |
| POST   | `/api/users/delete` | Elimina el usuario autenticado cuando se envía la contraseña actual. |

Ambos endpoints requieren un `accessToken` válido en el encabezado `Authorization` con el esquema `Bearer`.

<br>

## Endpoints de couriers

Los endpoints de couriers disponibles actualmente son:

| Método | Endpoint            | Descripción                                                                                             |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------------- |
| POST   | `/api/couriers`     | Crea un courier asociado al usuario autenticado. El nombre es obligatorio y debe ser único por usuario. |
| GET    | `/api/couriers`     | Obtiene los couriers del usuario autenticado con paginación.                                            |
| GET    | `/api/couriers/:id` | Obtiene un courier del usuario autenticado por su identificador.                                        |
| PATCH  | `/api/couriers/:id` | Actualiza un courier del usuario autenticado por su identificador.                                      |
| DELETE | `/api/couriers/:id` | Marca como eliminado lógicamente un courier del usuario autenticado por su identificador.               |

Los couriers eliminados lógicamente se excluyen de las consultas activas y no se eliminan físicamente de la base de datos.

Los endpoints de couriers requieren un `accessToken` válido en el encabezado `Authorization` con el esquema `Bearer`.

<br>

### Query params para `GET /api/couriers`

| Query param | Descripción                                               | Valor por defecto | Límite |
| ----------- | --------------------------------------------------------- | ----------------- | ------ |
| `page`      | Número de página a consultar. Debe ser mayor o igual a 1. | `1`               | -      |
| `limit`     | Cantidad de couriers por página. Debe estar entre 1 y 50. | `20`              | `50`   |

<br>

### Path params para `/api/couriers/:id`

| Path param | Descripción                                                             |
| ---------- | ----------------------------------------------------------------------- |
| `id`       | Identificador del courier. Debe ser un número entero mayor o igual a 1. |

<br>

### Body para `POST /api/couriers` y `PATCH /api/couriers/:id`

| Campo   | Descripción                                  |
| ------- | -------------------------------------------- |
| `name`  | Nombre del courier. Obligatorio en creación. |
| `phone` | Teléfono del courier. Opcional.              |
| `note`  | Nota adicional sobre el courier. Opcional.   |

<br>

## Endpoints de customers

Los endpoints de customers disponibles actualmente son:

| Método | Endpoint            | Descripción                                                                                          |
| ------ | ------------------- | ---------------------------------------------------------------------------------------------------- |
| POST   | `/api/customers`    | Crea un customer asociado al usuario autenticado. Los campos `name` y `address` son obligatorios.    |
| GET    | `/api/customers`    | Obtiene los customers activos del usuario autenticado con paginación.                                 |
| GET    | `/api/customers/:id`| Obtiene un customer del usuario autenticado por su identificador.                                     |
| PATCH  | `/api/customers/:id`| Actualiza un customer del usuario autenticado por su identificador.                                   |
| DELETE | `/api/customers/all`| Marca como eliminados lógicamente todos los customers activos del usuario autenticado cuando se confirma la acción. |
| DELETE | `/api/customers/:id`| Marca como eliminado lógicamente un customer del usuario autenticado por su identificador.          |

Los customers eliminados lógicamente se excluyen de las consultas activas y no se eliminan físicamente de la base de datos.

Los endpoints de customers requieren un `accessToken` válido en el encabezado `Authorization` con el esquema `Bearer`.

<br>

### Query params para `GET /api/customers`

| Query param | Descripción                                               | Valor por defecto | Límite |
| ----------- | --------------------------------------------------------- | ----------------- | ------ |
| `page`      | Número de página a consultar. Debe ser mayor o igual a 1. | `1`               | -      |
| `limit`     | Cantidad de customers por página. Debe estar entre 1 y 50. | `20`              | `50`   |

<br>

### Body para `POST /api/customers` y `PATCH /api/customers/:id`

| Campo    | Descripción                                          |
| -------- | ---------------------------------------------------- |
| `name`   | Nombre del cliente. Obligatorio en creación.         |
| `address`| Dirección del cliente. Obligatoria en creación.      |
| `email`  | Email opcional del cliente.                         |
| `phone`  | Teléfono opcional del cliente.                      |
| `note`   | Nota adicional del cliente. Opcional.               |

<br>

## Endpoints de productos

Los endpoints de productos disponibles actualmente son:

| Método | Endpoint            | Descripción                                                                                   |
| ------ | ------------------- | --------------------------------------------------------------------------------------------- |
| POST   | `/api/products`     | Crea un producto asociado al usuario autenticado. El SKU es opcional.                         |
| GET    | `/api/products`     | Obtiene los productos del usuario autenticado con paginación.                                 |
| GET    | `/api/products/:id` | Obtiene un producto del usuario autenticado por su identificador.                             |
| PATCH  | `/api/products`     | Actualiza productos del usuario autenticado filtrando por nombre.                             |
| PATCH  | `/api/products/:id` | Actualiza un producto del usuario autenticado por su identificador.                           |
| DELETE | `/api/products`     | Marca como eliminados lógicamente los productos del usuario autenticado filtrando por nombre. |
| DELETE | `/api/products/:id` | Marca como eliminado lógicamente un producto del usuario autenticado por su identificador.    |

Los productos eliminados lógicamente se excluyen de las consultas activas y no se eliminan físicamente de la base de datos.

Los endpoints de productos requieren un `accessToken` válido en el encabezado `Authorization` con el esquema `Bearer`.

<br>

### Query params para `GET /api/products`

| Query param | Descripción                                                | Valor por defecto | Límite |
| ----------- | ---------------------------------------------------------- | ----------------- | ------ |
| `page`      | Número de página a consultar. Debe ser mayor o igual a 1.  | `1`               | -      |
| `limit`     | Cantidad de productos por página. Debe estar entre 1 y 50. | `20`              | `50`   |

<br>

### Path params para `/api/products/:id`

| Path param | Descripción                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `id`       | Identificador del producto. Debe ser un número entero mayor o igual a 1. |

<br>

### Query params para `PATCH /api/products` y `DELETE /api/products`

| Query param | Descripción                                                              |
| ----------- | ------------------------------------------------------------------------ |
| `word`      | Texto utilizado para filtrar productos por nombre. No puede estar vacío. |

<br>

### Body para `PATCH /api/products` y `PATCH /api/products/:id`

| Campo   | Descripción                         |
| ------- | ----------------------------------- |
| `sku`   | Nuevo código opcional del producto. |
| `name`  | Nuevo nombre del producto.          |
| `price` | Nuevo precio decimal del producto.  |
| `stock` | Nuevo stock del producto.           |

<br>

El endpoint `DELETE /api/products/:id` acepta el siguiente path param:

| Path param | Descripción                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `id`       | Identificador del producto. Debe ser un número entero mayor o igual a 1. |
