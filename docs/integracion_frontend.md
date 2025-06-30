# Documentación de Integración Frontend-Backend

## Introducción
Este documento es una guía completa para que el equipo frontend integre su aplicación con el backend de SD Project. Incluye ejemplos de endpoints, flujos de autenticación, formatos de respuesta, manejo de errores, y detalles de recursos clave.

---

## 1. Autenticación y Seguridad
- **Autenticación:** Basada en JWT. El token se obtiene al iniciar sesión y debe enviarse en el header `Authorization: Bearer <token>` en cada petición protegida.
- **CORS:** Configurado para aceptar peticiones desde el frontend (ajustable en `.env`).
- **RBAC:** El acceso a muchos endpoints depende del rol y permisos del usuario.

### Flujo de autenticación
1. El usuario se registra (`POST /api/auth/register`) o inicia sesión (`POST /api/auth/login`).
2. El backend responde con un JWT.
3. El frontend almacena el token y lo envía en cada petición protegida:
   ```http
   Authorization: Bearer <token>
   ```
4. Si el token expira o es inválido, el backend responde con 401.

---

## 2. Endpoints Principales y Ejemplos

### Usuarios y Autenticación
- `POST /api/auth/register` — Registro de usuario
- `POST /api/auth/login` — Login, retorna JWT
- `POST /api/auth/logout` — Logout
- `POST /api/auth/forgot-password` — Solicitar recuperación de contraseña
- `POST /api/auth/reset-password` — Resetear contraseña

### Productos
- `GET /api/products` — Listar productos (paginado, filtrado)
- `GET /api/products/:id` — Detalle de producto
- `POST /api/products` — Crear producto (requiere permisos, soporta imagen)
- `PUT /api/products/:id` — Actualizar producto
- `DELETE /api/products/:id` — Eliminar producto

### Categorías
- `GET /api/categories` — Listar categorías
- `POST /api/categories` — Crear categoría
- `PUT /api/categories/:id` — Actualizar categoría
- `DELETE /api/categories/:id` — Eliminar categoría

### Carrito de Compras
- `GET /api/cart` — Obtener carrito del usuario
- `POST /api/cart/items` — Agregar producto al carrito
- `PUT /api/cart/items/:productId` — Actualizar cantidad
- `DELETE /api/cart/items/:productId` — Remover producto
- `DELETE /api/cart` — Vaciar carrito

### Pedidos (Órdenes)
- `POST /api/orders` — Crear pedido
- `GET /api/orders` — Listar pedidos del usuario
- `GET /api/orders/:id` — Detalle de pedido
- `PATCH /api/orders/:id/cancel` — Cancelar pedido
- `GET /api/orders/admin/all` — Listar todos los pedidos (admin)
- `PATCH /api/orders/admin/:id/status` — Actualizar estado (admin)

### Perfiles de Productor
- `GET /api/producer-profile` — Obtener perfil de productor
- `POST /api/producer-profile` — Crear perfil
- `PUT /api/producer-profile` — Actualizar perfil
- `DELETE /api/producer-profile` — Eliminar perfil

### Valoraciones y Reseñas
- `POST /api/reviews` — Crear reseña de producto
- `GET /api/reviews` — Listar reseñas

### Contactos
- `POST /api/contacts` — Crear contacto
- `PATCH /api/contacts/:id/status` — Actualizar estado (admin)

### Calificación de Vendedores
- `POST /api/seller-ratings` — Calificar vendedor
- `GET /api/seller-ratings` — Listar calificaciones

### Insignias (Gamificación)
- `GET /api/insignias` — Listar insignias
- `GET /api/insignias/my` — Mis insignias
- `POST /api/insignias` — Crear insignia (admin)
- `POST /api/insignias/grant` — Otorgar insignia (admin)
- `DELETE /api/insignias/revoke` — Revocar insignia (admin)

### Roles y Permisos (RBAC)
- `GET /api/roles` — Listar roles
- `POST /api/roles` — Crear rol
- `PUT /api/roles/:id` — Actualizar rol
- `DELETE /api/roles/:id` — Eliminar rol
- `POST /api/roles/assign` — Asignar rol a usuario
- `GET /api/roles/users/with-roles` — Usuarios con roles
- `GET /api/permissions` — Listar permisos
- `POST /api/permissions` — Crear permiso
- `POST /api/permissions/initialize` — Inicializar permisos por defecto

### Métricas y Reportes
- `GET /api/metrics/products` — Métricas de productos
- `GET /api/metrics/sellers` — Métricas de vendedores
- `GET /api/metrics/consolidated` — Estadísticas consolidadas
- `GET /api/metrics/admin/dashboard` — Dashboard admin

### Reportes Exportables
- `GET /api/reports/types` — Tipos de reportes disponibles
- `POST /api/reports/request` — Solicitar generación de reporte
- `GET /api/reports` — Listar reportes del usuario
- `GET /api/reports/:id` — Detalle de un reporte
- `PATCH /api/reports/:id/cancel` — Cancelar reporte pendiente
- `GET /api/reports/download/:filename` — Descargar archivo generado
- `DELETE /api/reports/cleanup` — Limpiar reportes expirados (admin)

#### Tipos de reportes soportados
- `productos` — Listado de productos
- `metricas` — Métricas del sistema
- `valoraciones` — Reseñas y calificaciones
- `contactos` — Mensajes de contacto

#### Formatos soportados
- `csv`, `pdf`, `excel`

---

## 3. Ejemplo de Solicitud y Descarga de Reporte
```json
POST /api/reports/request
{
  "tipo_reporte": "productos",
  "formato": "csv",
  "filtros": { "categoria_id": 1 }
}
```
Respuesta:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "estado": "generando",
    "urlDescarga": null
  }
}
```
Para descargar el archivo generado:
```
GET /api/reports/download/:filename
```

---

## 4. Formato de Respuestas y Manejo de Errores
- Todas las respuestas siguen el formato:
  ```json
  {
    "success": true/false,
    "data": { ... },
    "message": "...",
    "error": "..." // si aplica
  }
  ```
- Errores comunes: 400 (datos inválidos), 401 (no autenticado), 403 (sin permisos), 404 (no encontrado), 500 (error interno).

---

## 5. Recomendaciones para Frontend
- Manejar expiración de token y redirigir a login si es necesario.
- Validar los permisos del usuario antes de mostrar acciones sensibles.
- Usar paginación y filtros en listados grandes.
- Mostrar mensajes claros al usuario según el campo `message` o `error` de la respuesta.
- Para descargas de reportes, usar el endpoint `/api/reports/download/:filename`.
- Consultar `/api/reports/types` para saber los reportes disponibles y sus formatos.

---

## 6. Recursos Útiles y Extras
- [README principal del backend](../README.md)
- Consultar la documentación de cada endpoint en el backend para detalles de parámetros y respuestas.
- Para pruebas automáticas, revisar la carpeta `src/tests/integration/`.
- Para ver ejemplos de payloads y respuestas, consultar los controladores en `src/api/controllers/`.

