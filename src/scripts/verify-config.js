#!/usr/bin/env node

/**
 * Script de verificación de configuración para entorno de nube
 * Verifica que todas las variables de entorno requeridas estén configuradas
 * Implementa principios SOLID para mantenibilidad
 */

import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Clase para validación de configuración (SRP - Single Responsibility Principle)
 */
class ConfigValidator {
  constructor() {
    this.requiredVars = {
      // Variables de base de datos
      'DB_HOST': 'Host de la base de datos',
      'DB_PORT': 'Puerto de la base de datos (ej: 3306)',
      'DB_NAME': 'Nombre de la base de datos',
      'DB_USER': 'Usuario de la base de datos',
      'DB_PASSWORD': 'Contraseña de la base de datos',
      
      // Variables del servidor
      'PORT': 'Puerto del servidor (ej: 3000)',
      'NODE_ENV': 'Entorno de ejecución (development/production)',
      
      // Variables de seguridad
      'JWT_SECRET': 'Clave secreta para JWT (mínimo 32 caracteres)',
      'BCRYPT_SALT_ROUNDS': 'Rounds para bcrypt (ej: 10)',
      
      // Variables de admin
      'ADMIN_EMAIL': 'Email del administrador',
      'ADMIN_INITIAL_PASSWORD': 'Contraseña inicial del admin',
      'ADMIN_FIRST_NAME': 'Nombre del admin',
      'ADMIN_LAST_NAME': 'Apellido del admin'
    };

    this.optionalVars = {
      'DB_TEST_NAME': 'Nombre de la base de datos de pruebas',
      'JWT_EXPIRES_IN': 'Tiempo de expiración del JWT (ej: 24h)',
      'CORS_ORIGIN': 'Origen permitido para CORS',
      'LOG_LEVEL': 'Nivel de logging',
      'ADMIN_FORCE_PASSWORD_CHANGE': 'Forzar cambio de contraseña'
    };
  }

  /**
   * Valida una variable individual (OCP - Open/Closed Principle)
   */
  validateVariable(varName, value) {
    const result = { isValid: true, errorMsg: '' };
    
    switch (varName) {
      case 'DB_PORT':
      case 'PORT':
        const port = parseInt(value);
        if (isNaN(port) || port < 1 || port > 65535) {
          result.isValid = false;
          result.errorMsg = ' (debe ser un número entre 1-65535)';
        }
        break;
      case 'JWT_SECRET':
        if (value.length < 16) {
          result.isValid = false;
          result.errorMsg = ' (debe tener al menos 16 caracteres)';
        }
        break;
      case 'BCRYPT_SALT_ROUNDS':
        const rounds = parseInt(value);
        if (isNaN(rounds) || rounds < 8 || rounds > 15) {
          result.isValid = false;
          result.errorMsg = ' (debe ser un número entre 8-15)';
        }
        break;
      case 'ADMIN_EMAIL':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          result.isValid = false;
          result.errorMsg = ' (formato de email inválido)';
        }
        break;
      case 'NODE_ENV':
        if (!['development', 'production', 'test'].includes(value)) {
          result.isValid = false;
          result.errorMsg = ' (debe ser: development, production o test)';
        }
        break;
    }
    
    return result;
  }

  /**
   * Verifica variables requeridas
   */
  checkRequiredVars() {
    console.log('📋 Variables Requeridas:');
    let hasErrors = false;
    let hasWarnings = false;
    
    for (const [varName, description] of Object.entries(this.requiredVars)) {
      const value = process.env[varName];
      
      if (!value) {
        console.log(`  ❌ ${varName}: FALTANTE - ${description}`);
        hasErrors = true;
      } else {
        const validation = this.validateVariable(varName, value);
        
        if (validation.isValid) {
          console.log(`  ✅ ${varName}: OK`);
        } else {
          console.log(`  ⚠️  ${varName}: CONFIGURADO pero inválido${validation.errorMsg}`);
          hasWarnings = true;
        }
      }
    }
    
    return { hasErrors, hasWarnings };
  }

  /**
   * Verifica variables opcionales
   */
  checkOptionalVars() {
    console.log('\n🔧 Variables Opcionales:');
    
    for (const [varName, description] of Object.entries(this.optionalVars)) {
      const value = process.env[varName];
      
      if (!value) {
        console.log(`  ⚪ ${varName}: No configurado - ${description}`);
      } else {
        console.log(`  ✅ ${varName}: Configurado`);
      }
    }
  }

  /**
   * Verifica la seguridad de la configuración
   */
  checkSecurity() {
    console.log('\n🔒 Verificaciones de Seguridad:');
    let hasWarnings = false;
    
    // Verificar que no sea la configuración de ejemplo
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      console.log('  ⚠️  JWT_SECRET: Usando valor de ejemplo - CAMBIAR INMEDIATAMENTE');
      hasWarnings = true;
    } else {
      console.log('  ✅ JWT_SECRET: Valor personalizado');
    }
    
    if (process.env.ADMIN_INITIAL_PASSWORD === 'change-this-password') {
      console.log('  ⚠️  ADMIN_INITIAL_PASSWORD: Usando valor de ejemplo - CAMBIAR INMEDIATAMENTE');
      hasWarnings = true;
    } else {
      console.log('  ✅ ADMIN_INITIAL_PASSWORD: Valor personalizado');
    }
    
    if (process.env.DB_HOST === 'your-cloud-database-host') {
      console.log('  ⚠️  DB_HOST: Usando valor de ejemplo - CAMBIAR INMEDIATAMENTE');
      hasWarnings = true;
    } else {
      console.log('  ✅ DB_HOST: Valor personalizado');
    }
    
    return hasWarnings;
  }

  /**
   * Ejecuta la validación completa
   */
  run() {
    console.log('🔍 Verificando configuración de variables de entorno...\n');
    
    const requiredResult = this.checkRequiredVars();
    this.checkOptionalVars();
    const securityWarnings = this.checkSecurity();
    
    // Resultado final
    console.log('\n' + '='.repeat(50));
    if (requiredResult.hasErrors) {
      console.log('❌ CONFIGURACIÓN INCOMPLETA');
      console.log('Faltan variables requeridas. El servidor NO puede iniciar.');
      console.log('Revisa el archivo CLOUD_SETUP.md para instrucciones.');
      return false;
    } else if (requiredResult.hasWarnings || securityWarnings) {
      console.log('⚠️  CONFIGURACIÓN COMPLETA CON ADVERTENCIAS');
      console.log('Todas las variables están presentes pero hay problemas de seguridad/validación.');
      console.log('El servidor puede iniciar pero se recomienda revisar las advertencias.');
      return true;
    } else {
      console.log('✅ CONFIGURACIÓN COMPLETA Y VÁLIDA');
      console.log('Todas las variables están configuradas correctamente.');
      console.log('El servidor está listo para iniciar.');
      return true;
    }
  }
}

/**
 * Función principal (LSP - Liskov Substitution Principle)
 */
function checkConfiguration() {
  const validator = new ConfigValidator();
  return validator.run();
}

// Ejecutar verificación si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const isValid = checkConfiguration();
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('❌ Error al verificar configuración:', error.message);
    process.exit(1);
  }
}

export { checkConfiguration };
