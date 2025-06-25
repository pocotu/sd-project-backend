import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../../infrastructure/repositories/user.repository.js';
import { RoleRepository } from '../../infrastructure/repositories/role.repository.js';
import { config } from '../../config/index.js';
import { logger } from '../../infrastructure/utils/logger.js';

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
  }

  async register(userData) {
    try {
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Buscar el roleId del rol 'user'
      const userRole = await this.roleRepository.findByName('user');
      if (!userRole) throw new Error('Default role not found');

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.userRepository.createUser({
        ...userData,
        password: hashedPassword,
        roleId: userRole.id // Asignar el roleId por defecto
      });

      return this.generateToken(user);
    } catch (error) {
      logger.error('Error in register:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        await this.userRepository.updateLoginAttempts(user.id, user.failedLoginAttempts + 1);
        throw new Error('Credenciales inválidas');
      }

      if (user.failedLoginAttempts > 0) {
        await this.userRepository.updateLoginAttempts(user.id, 0);
      }

      await this.userRepository.updateLastLogin(user.id);
      return this.generateToken(user);
    } catch (error) {
      logger.error('Error in login:', error);
      throw error;
    }
  }

  async logout(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Aquí podrías implementar lógica adicional para el logout
      // como invalidar tokens, etc.
      return true;
    } catch (error) {
      logger.error('Error in logout:', error);
      throw error;
    }
  }

  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      roleId: user.roleId
    };

    return {
      token: jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId
      }
    };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw new Error('Invalid token');
    }
  }
}

export const authService = new AuthService(); 