import Role from '../../models/Role.js';
 
export class RoleRepository {
  async findByName(nombre) {
    return await Role.findOne({ where: { nombre } });
  }
} 