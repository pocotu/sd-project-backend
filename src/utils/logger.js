// Sistema de logging centralizado con prefijos

class Logger {
  static backend(message, ...args) {
    console.log(`[Backend] ${message}`, ...args);
  }

  static database(message, ...args) {
    console.log(`[Database] ${message}`, ...args);
  }

  static server(message, ...args) {
    console.log(`[Server] ${message}`, ...args);
  }

  static auth(message, ...args) {
    console.log(`[Auth] ${message}`, ...args);
  }

  static api(message, ...args) {
    console.log(`[API] ${message}`, ...args);
  }

  static error(prefix, message, ...args) {
    console.error(`[${prefix}] ❌ ${message}`, ...args);
  }

  static success(prefix, message, ...args) {
    console.log(`[${prefix}] ✅ ${message}`, ...args);
  }

  static info(prefix, message, ...args) {
    console.log(`[${prefix}] ℹ️  ${message}`, ...args);
  }

  static warn(prefix, message, ...args) {
    console.warn(`[${prefix}] ⚠️  ${message}`, ...args);
  }
}

export { Logger };
