// Setup global para tests - Suprimir logs innecesarios
beforeAll(() => {
  // Guardar las funciones originales
  global.originalConsoleLog = console.log;
  global.originalConsoleError = console.error;
  
  // Suprimir console.log y console.error durante tests
  if (process.env.NODE_ENV === 'test') {
    console.log = () => {};
    console.error = () => {};
  }
});

afterAll(() => {
  // Restaurar las funciones originales
  if (global.originalConsoleLog) {
    console.log = global.originalConsoleLog;
  }
  if (global.originalConsoleError) {
    console.error = global.originalConsoleError;
  }
});

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.SUPPRESS_TEST_LOGS = 'true'; 