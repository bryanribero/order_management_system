# Changelog

## [2.0.0](https://github.com/bryanribero/order_management_system/compare/v1.0.0...v2.0.0) (2026-11-27)


### ⚠ BREAKING CHANGES

* introducir nueva estructura de autenticación

### Features

* agregando funcion keepAlive para mantener el servidor activo ([f27dfb7](https://github.com/bryanribero/order_management_system/commit/f27dfb75c068a0a0c572e6659554fd9b11368c8f))
* **auth:** Se agrego un endpoint /auth/me para verificar el estado del refresh token ([163821b](https://github.com/bryanribero/order_management_system/commit/163821be7b65b061b919606006c58de548e59ded))
* **categories:** creacion de la ruta para mostrar todas las categorias disponibles ([8404085](https://github.com/bryanribero/order_management_system/commit/84040851b59e1dd617159dca5fa6cfa56162cad1))
* **categories:** creación de la tabla categories con datos iniciales con nombres de categorias ([e3f9a0b](https://github.com/bryanribero/order_management_system/commit/e3f9a0bbc58fa02aba2833472188d1aee51a354c))
* **cors:** Agregando al dominio la url de vercel ([754c094](https://github.com/bryanribero/order_management_system/commit/754c094936d28a98a41fec41ceaeff2f2990b252))
* **dashboard:** agregar endpoint de estadísticas del panel ([5ff54ef](https://github.com/bryanribero/order_management_system/commit/5ff54efdd7498c3da82cb7c482eef92736a6d587))
* Implementación en la documentación para el apartado de dashboard ([de9136d](https://github.com/bryanribero/order_management_system/commit/de9136ddbfd01f2e6933260b63773ee9c509baab))
* introducir nueva estructura de autenticación ([c6b0089](https://github.com/bryanribero/order_management_system/commit/c6b008920a9dde42c3acd90b32aee6168ae120e0))
* **order:** Creación de nuevo endpoint para obtener las ordenes de un cliente en especifico ([3d28178](https://github.com/bryanribero/order_management_system/commit/3d28178c30c33cfbe8a9f5444cd804f1beef932c))
* **orders:** incluir created_at en la respuesta del endpoint ([071230d](https://github.com/bryanribero/order_management_system/commit/071230d1d8d92e8ab1a29daae2fdaafb6529f3a8))
* **product:** agregando un nuevo valor al endpoint get de products, en donde devolvera la paginacion ([adf1275](https://github.com/bryanribero/order_management_system/commit/adf12755b08d4bef3776701d476970211171cd21))
* **products:** Se agrego un nuevo endpoint llamado stats, el cual da datos extras sobre los productos ([1e34615](https://github.com/bryanribero/order_management_system/commit/1e34615ccc6f73ed5826df631e95f0e56359c2df))
* se creo el modelo Category y se agrego la relacion con el modelo de los productos ([ee572b4](https://github.com/bryanribero/order_management_system/commit/ee572b42a369abc0fa303a96e5e474bf93c1ccdc))


### Bug Fixes

* Ajuste el origen de vercel ([c55f5db](https://github.com/bryanribero/order_management_system/commit/c55f5db9b47b309c95b2af9f1822a542fe66d971))
* arreglando servicio updateProductById ([05f0b3b](https://github.com/bryanribero/order_management_system/commit/05f0b3b4060c293b56c728a96141c500fe6e97b2))
* arregle la nomeclatura de una variable ([9f60a23](https://github.com/bryanribero/order_management_system/commit/9f60a233929891ff292b5f649c45d0765415bf3d))
* **auth:** Ajustando la propiedad SameSite de la cookie a None para permitir el envío de cookies entre distintos orígenes. ([b521264](https://github.com/bryanribero/order_management_system/commit/b5212647b699c654ffbf519b0d7a0b51e05f00eb))
* **product:** ajustando parametro de filtrado para los productos, para que acepte el parametro word ([fb18f90](https://github.com/bryanribero/order_management_system/commit/fb18f908bbc28528f81343a1b10418e8d797d852))
* **products:** Ajustando un error en el servicio de getUserProducts ([18586d9](https://github.com/bryanribero/order_management_system/commit/18586d9d46e156dd44bf0fb67e06f16d1196198c))
* **rate:** Ajustando la cantidad de peticiones que se pueden hacer para auth y products ([e84469c](https://github.com/bryanribero/order_management_system/commit/e84469cbd9991a1c1060640c6a9075c293e3459f))


### Reverts

* elimine el servicio de keep-alive ([1377cb6](https://github.com/bryanribero/order_management_system/commit/1377cb62855650da21f872aefcc7f3222be096a9))
