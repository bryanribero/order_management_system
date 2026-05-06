# Sistema gestor de pedidos

## Descripción

Sistema gestor de pedidos orientado a pequeños comercios o emprendimientos, diseñado para administrar clientes, productos, repartidores y órdenes desde una API centralizada. Permite registrar pedidos con múltiples items, asignar responsables de entrega, controlar estados como pendiente, cancelado o completado, y conservar un historial confiable de las operaciones realizadas.

<br>

## Tecnologías principales

- JavaScript
- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT
- Jest
- ESLint
- Prettier
- pnpm

<br>

## Requisitos previos

Herramientas necesarias antes de instalar el proyecto.

- Node.js
- pnpm
- PostgreSQL

<br>

## Scripts disponibles

Tabla con los comandos disponibles del proyecto.

| Comando                 | Descripción                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`              | Inicia el servidor en modo desarrollo usando Nodemon.                  |
| `pnpm migration-create` | Crea una nueva migración con Sequelize CLI.                            |
| `pnpm migrate-dev`      | Ejecuta las migraciones pendientes en el entorno de desarrollo.        |
| `pnpm undo-migrate-dev` | Revierte la última migración ejecutada en el entorno de desarrollo.    |
| `all-undo-migrate-dev`  | Revierte todas las migraciones ejecutadas en el entorno de desarrollo. |
