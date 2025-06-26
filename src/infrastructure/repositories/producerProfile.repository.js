import ProducerProfile from '../../models/ProducerProfile.js';
import { BaseRepository } from './base.repository.js';
import { logger } from '../utils/logger.js';

export class ProducerProfileRepository extends BaseRepository {
  constructor() {
    super(ProducerProfile);
  }
  
  // Métodos adicionales específicos de perfiles de productor
  async findByUserId(usuario_id) {
    try {
      return await this.model.findOne({ where: { usuario_id } });
    } catch (error) {
      logger.error(`Error en findByUserId: ${error.message}`, error);
      throw error;
    }
  }
  
  async create(profileData) {
    try {
      // Asegurarse de que el perfil tenga todos los campos requeridos
      if (!profileData.usuario_id) {
        throw new Error('ID de usuario es requerido para crear un perfil');
      }
      
      if (!profileData.nombre_negocio || !profileData.ubicacion) {
        throw new Error('Nombre de negocio y ubicación son campos requeridos');
      }
      
      return await this.model.create(profileData);
    } catch (error) {
      logger.error(`Error en create: ${error.message}`, error);
      throw error;
    }
  }
  
  async update(id, data) {
    try {
      const profile = await this.model.findByPk(id);
      if (!profile) {
        throw new Error('Perfil no encontrado');
      }
      
      return await profile.update(data);
    } catch (error) {
      logger.error(`Error en update: ${error.message}`, error);
      throw error;
    }
  }
}
