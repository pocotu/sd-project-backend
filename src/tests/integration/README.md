# Tests de Integración

Esta carpeta contiene todos los tests de integración del proyecto, organizados por módulos y siguiendo las mejores prácticas.

## Estructura

```
integration/
├── README.md                    # Documentación de tests
├── config/                      # Configuración compartida
│   ├── test-setup.js           # Setup global de tests
│   ├── test-database.js        # Configuración de BD para tests
│   └── test-helpers.js         # Helpers compartidos
├── auth/                        # Tests de autenticación
│   ├── auth.test.js            # Tests de endpoints de auth
│   └── auth.fixtures.js        # Datos de prueba para auth
├── users/                       # Tests de usuarios
│   ├── user.test.js            # Tests de CRUD de usuarios
│   └── user.fixtures.js        # Datos de prueba para usuarios
├── products/                    # Tests de productos
│   ├── product.test.js         # Tests de CRUD de productos
│   └── product.fixtures.js     # Datos de prueba para productos
├── categories/                  # Tests de categorías
│   ├── category.test.js        # Tests de CRUD de categorías
│   └── category.fixtures.js    # Datos de prueba para categorías
└── phase/                       # Tests por fases del proyecto
    ├── phase1.test.js          # Tests de Fase 1 (estructura base)
    └── phase2.test.js          # Tests de Fase 2 (autenticación)
```

## Convenciones

### Nomenclatura
- Archivos de test: `*.test.js`
- Archivos de datos: `*.fixtures.js`
- Archivos de configuración: `*.config.js` o `*.setup.js`

### Estructura de Tests
```javascript
describe('Módulo: Nombre del Módulo', () => {
  beforeAll(async () => {
    // Setup inicial
  });

  beforeEach(async () => {
    // Limpieza antes de cada test
  });

  afterAll(async () => {
    // Limpieza final
  });

  describe('Endpoint: /api/endpoint', () => {
    it('should do something when condition', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Helpers Compartidos
- `TestData`: Generación de datos de prueba
- `TestAssertions`: Validaciones de respuestas
- `TestHelper`: Configuración y limpieza de BD
- `TestDatabase`: Operaciones de BD para tests

## Ejecución

```bash
# Ejecutar todos los tests de integración
npm run test:integration

# Ejecutar tests de un módulo específico
npm run test:integration:auth

# Ejecutar tests de una fase específica
npm run test:integration:phase1
``` 