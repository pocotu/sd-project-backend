import { Role } from '../../domain/models/role.model.js';
 
export class RoleRepository {
  async findByName(nombre) {
    return await Role.findOne({ where: { nombre } });
  }
} 