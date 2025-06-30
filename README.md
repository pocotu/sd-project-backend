# SD Project Backend

## Descripción General

Este proyecto es el backend de una plataforma de gestión y comercialización de productos, construido con Node.js y Express. Implementa principios SOLID y una arquitectura modular, permitiendo la gestión de usuarios, productos, reportes exportables, roles y permisos (RBAC), y métricas del sistema. 

## Características Principales

- **Gestión de usuarios**: Registro, autenticación, roles y permisos.
- **Gestión de productos**: CRUD de productos, categorías, lotes y stock.
- **Reportes exportables**: Solicitud, generación y descarga de reportes en formatos CSV, PDF y Excel sobre productos, métricas, valoraciones y contactos.
- **RBAC**: Control de acceso basado en roles y permisos granulares.
- **Métricas y estadísticas**: Reportes de actividad y rendimiento del sistema.
- **Manejo de archivos**: Subida y descarga de archivos, incluyendo imágenes y reportes.
- **API RESTful**: Endpoints organizados y documentados para integración frontend o terceros.

## Estructura del Proyecto

```
src/
  app.js                # Configuración principal de Express
  server.js             # Punto de entrada del servidor
  api/
    controllers/        # Controladores de rutas (incluye reportes, roles, permisos, etc.)
    middlewares/        # Middlewares (autenticación, RBAC, logging, etc.)
    routes/             # Definición de rutas
  application/
    dtos/               # Data Transfer Objects
    services/           # Lógica de negocio (servicios)
  config/               # Configuración de base de datos, CORS, JWT, etc.
  database/
    migrations/         # Migraciones de base de datos
    seeders/            # Seeders para datos iniciales
  domain/
    models/             # Modelos de dominio
  infrastructure/
    database/           # Configuración y utilidades de base de datos
    repositories/       # Repositorios para acceso a datos
    utils/              # Utilidades generales (logger, generadores de archivos, etc.)
  models/               # Modelos Sequelize
  scripts/              # Scripts de migración y utilidades
  tests/                # Pruebas de integración y setup
utils/                  # Utilidades generales
uploads/                # Archivos subidos y reportes generados
```

## Instalación

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd sd-project-backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto con la configuración necesaria (ver ejemplo `.env.example`).

4. **Configurar la base de datos**

- Edita `src/config/database.config.js` según tu entorno.
- Ejecuta migraciones y seeders:

```bash
npm run migrate
npm run seed
```

5. **Iniciar el servidor**

```bash
npm run dev
```

El servidor estará disponible en el puerto configurado (por defecto 3000).

## Endpoints Principales

- **/api/auth/**: Autenticación y registro de usuarios
- **/api/products/**: Gestión de productos
- **/api/categories/**: Gestión de categorías
- **/api/reports/**: Solicitud, consulta y cancelación de reportes
- **/api/export-reports/download/:filename**: Descarga de reportes generados
- **/api/roles/**: Gestión de roles y permisos
- **/api/metrics/**: Consulta de métricas del sistema

## Reportes Exportables

- **Productos**: Listado de productos con filtros y métricas
- **Métricas**: Estadísticas generales del sistema
- **Valoraciones**: Reseñas y calificaciones de productos
- **Contactos**: Mensajes y consultas recibidas

Formatos soportados: `csv`, `pdf`, `excel`

## Seguridad

- Autenticación basada en JWT
- Control de acceso granular con RBAC
- Middlewares de seguridad (Helmet, CORS, etc.)

## Scripts Útiles

- `npm run migrate`: Ejecuta migraciones de base de datos
- `npm run seed`: Ejecuta seeders
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm run test`: Ejecuta pruebas

## Pruebas

Las pruebas de integración se encuentran en `src/tests/integration/`. Para ejecutarlas:

```bash
npm run test
```

## Dependencias Principales

- express
- sequelize
- jsonwebtoken
- helmet
- cors
- compression
- winston (logger)
- jest (testing)

## Licencia

Este proyecto es de uso académico y/o privado. Consulta el archivo LICENSE para más detalles.

---

**Autor:** Equipo SD Project
**Fecha:** Junio 2025
