import { User } from '../../domain/models/user.model.js';
import { BaseRepository } from './base.repository.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.model.findOne({ where: { email } });
  }

  async createUser(userData) {
    return await this.model.create(userData);
  }

  async updateUser(id, userData) {
    const user = await this.model.findByPk(id);
    if (!user) return null;
    return await user.update(userData);
  }

  async deleteUser(id) {
    const user = await this.model.findByPk(id);
    if (!user) return false;
    await user.destroy();
    return true;
  }

  async findById(id) {
    return await this.model.findByPk(id);
  }

  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  async updateLoginAttempts(id, attempts) {
    const user = await this.model.findByPk(id);
    if (!user) return null;
    return await user.update({ failedLoginAttempts: attempts });
  }

  async updateLastLogin(id) {
    const user = await this.model.findByPk(id);
    if (!user) return null;
    return await user.update({ 
      lastLogin: new Date(),
      failedLoginAttempts: 0 
    });
  }

  async forcePasswordChange(id) {
    const user = await this.model.findByPk(id);
    if (!user) return null;
    return await user.update({ 
      forcePasswordChange: true,
      lastPasswordChange: new Date()
    });
  }

  // Permite eliminar todos los usuarios (para tests)
  async deleteAll() {
    await this.model.destroy({ where: {}, truncate: true, cascade: true });
  }
} 