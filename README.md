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

## Endpoints de productos

Los endpoints de productos disponibles actualmente son:

| Método | Endpoint            | Descripción                                                           |
| ------ | ------------------- | --------------------------------------------------------------------- |
| POST   | `/api/products`     | Crea un producto asociado al usuario autenticado. El SKU es opcional. |
| GET    | `/api/products`     | Obtiene los productos del usuario autenticado con paginación.         |
| PATCH  | `/api/products`     | Actualiza productos del usuario autenticado filtrando por nombre.     |
| GET    | `/api/products/:id` | Obtiene un producto del usuario autenticado por su identificador.     |

Los endpoints de productos requieren un `accessToken` válido en el encabezado `Authorization` con el esquema `Bearer`.

<br>

El endpoint `GET /api/products` acepta los siguientes query params opcionales:

| Query param | Descripción                                                | Valor por defecto | Límite |
| ----------- | ---------------------------------------------------------- | ----------------- | ------ |
| `page`      | Número de página a consultar. Debe ser mayor o igual a 1.  | `1`               | -      |
| `limit`     | Cantidad de productos por página. Debe estar entre 1 y 50. | `20`              | `50`   |

<br>

El endpoint `GET /api/products/:id` acepta el siguiente path param:

| Path param | Descripción                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `id`       | Identificador del producto. Debe ser un número entero mayor o igual a 1. |

<br>

El endpoint `PATCH /api/products` acepta el siguiente query param obligatorio:

| Query param | Descripción                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| `word`      | Texto utilizado para filtrar productos por nombre. No puede estar vacío.    |

El body de `PATCH /api/products` contiene los campos que se quieren actualizar:

| Campo   | Descripción                              |
| ------- | ---------------------------------------- |
| `sku`   | Nuevo código opcional del producto.      |
| `name`  | Nuevo nombre del producto.               |
| `price` | Nuevo precio decimal del producto.       |
| `stock` | Nuevo stock del producto.                |

Respuestas principales de `PATCH /api/products`:

| Estado | Descripción                                                                  |
| ------ | ---------------------------------------------------------------------------- |
| `200`  | Devuelve los productos actualizados.                                          |
| `400`  | El query param `word` no fue enviado, está vacío o el JSON es inválido.       |
| `401`  | No se envió un access token válido.                                           |
| `404`  | No se encontró ningún producto del usuario autenticado que coincida con `word`. |
| `429`  | Se superó el límite de solicitudes para productos.                            |
