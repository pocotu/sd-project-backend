// Datos de prueba específicos para tests de autenticación

export const authFixtures = {
  // Usuarios válidos para testing
  validUsers: [
    {
      email: 'test.user1@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User1'
    },
    {
      email: 'test.user2@example.com',
      password: 'SecurePass456!',
      firstName: 'Test',
      lastName: 'User2'
    },
    {
      email: 'admin.test@example.com',
      password: 'AdminPass789!',
      firstName: 'Admin',
      lastName: 'Test'
    }
  ],

  // Usuarios con datos inválidos para testing de validación
  invalidUsers: [
    {
      email: 'invalid-email',
      password: '123',
      firstName: '',
      lastName: '',
      expectedError: 'Datos de usuario inválidos'
    },
    {
      email: 'test@',
      password: 'weak',
      firstName: 'A',
      lastName: 'B',
      expectedError: 'Datos de usuario inválidos'
    },
    {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      expectedError: 'Datos de usuario inválidos'
    },
    {
      email: 'test@example.com',
      password: '123',
      firstName: 'Test',
      lastName: 'User',
      expectedError: 'Datos de usuario inválidos'
    },
    {
      email: 'test@example.com',
      password: 'password',
      firstName: 'Test',
      lastName: 'User',
      expectedError: 'Datos de usuario inválidos'
    }
  ],

  // Credenciales de login para testing
  loginCredentials: {
    valid: {
      email: 'test.user@example.com',
      password: 'Password123!'
    },
    invalidPassword: {
      email: 'test.user@example.com',
      password: 'WrongPassword123!'
    },
    invalidEmail: {
      email: 'nonexistent@example.com',
      password: 'Password123!'
    },
    empty: {
      email: '',
      password: ''
    }
  },

  // Tokens para testing
  tokens: {
    valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4LTkwYWItMTJjMy0zNGQ1LTU2Nzg5MGFiY2RlZiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVJZCI6IjEyMzQ1Njc4LTkwYWItMTJjMy0zNGQ1LTU2Nzg5MGFiY2RlZiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxNjM0NjU0MjkwfQ.example',
    invalid: 'invalid.token.here',
    expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4LTkwYWItMTJjMy0zNGQ1LTU2Nzg5MGFiY2RlZiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVJZCI6IjEyMzQ1Njc4LTkwYWItMTJjMy0zNGQ1LTU2Nzg5MGFiY2RlZiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxNjM0NTY3ODkwfQ.expired'
  },

  // Respuestas esperadas
  expectedResponses: {
    register: {
      success: {
        status: 'success',
        data: {
          token: expect.any(String),
          user: {
            id: expect.any(String),
            email: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String),
            roleId: expect.any(String)
          }
        }
      },
      duplicateEmail: {
        status: 'error',
        message: 'El email ya está registrado'
      },
      validationError: {
        status: 'error',
        message: 'Datos de usuario inválidos'
      }
    },
    login: {
      success: {
        status: 'success',
        data: {
          token: expect.any(String),
          user: {
            id: expect.any(String),
            email: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String),
            roleId: expect.any(String)
          }
        }
      },
      invalidCredentials: {
        status: 'error',
        message: 'Credenciales inválidas'
      }
    },
    logout: {
      success: {
        status: 'success',
        message: 'Sesión cerrada exitosamente'
      },
      noToken: {
        status: 'error',
        message: 'No se proporcionó token de autenticación'
      },
      invalidToken: {
        status: 'error',
        message: expect.any(String)
      }
    }
  }
};

// Helper para generar datos únicos
export const generateUniqueAuthData = (baseData = {}) => {
  const timestamp = new Date().getTime();
  const randomSuffix = Math.random().toString(36).substring(7);
  
  return {
    email: `test.${timestamp}.${randomSuffix}@example.com`,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    ...baseData
  };
}; 