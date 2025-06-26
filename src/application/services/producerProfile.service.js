import { ProducerProfileRepository } from '../../infrastructure/repositories/producerProfile.repository.js';
import { logger } from '../../infrastructure/utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class ProducerProfileService {
  constructor() {
    this.producerProfileRepository = new ProducerProfileRepository();
  }

  async createProfile(usuario_id, data) {
    try {
      // Asegurar que el usuario no tenga ya un perfil
      const existing = await this.producerProfileRepository.findByUserId(usuario_id);
      if (existing) {
        const error = new Error('El usuario ya tiene un perfil de productor');
        error.name = 'UniqueConstraintError';
        throw error;
      }

      // Validar campos requeridos
      if (!data.nombre_negocio || !data.ubicacion) {
        throw new Error('Nombre de negocio y ubicación son campos requeridos');
      }

      // Añadir un UUID si no está presente
      const profileData = {
        ...data,
        usuario_id,
        id: data.id || uuidv4(),
        verificado: data.verificado !== undefined ? data.verificado : 0,
        activo: data.activo !== undefined ? data.activo : 1
      };

      return await this.producerProfileRepository.create(profileData);
    } catch (error) {
      logger.error(`Error en createProfile: ${error.message}`, error);
      throw error;
    }
  }

  async updateProfile(usuario_id, data) {
    try {
      const profile = await this.producerProfileRepository.findByUserId(usuario_id);
      if (!profile) throw new Error('Perfil de productor no encontrado');
      return await this.producerProfileRepository.update(profile.id, data);
    } catch (error) {
      logger.error(`Error en updateProfile: ${error.message}`, error);
      throw error;
    }
  }

  async getProfileByUserId(usuario_id) {
    try {
      return await this.producerProfileRepository.findByUserId(usuario_id);
    } catch (error) {
      logger.error(`Error en getProfileByUserId: ${error.message}`, error);
      throw error;
    }
  }

  async getAllProfiles() {
    try {
      return await this.producerProfileRepository.findAll();
    } catch (error) {
      logger.error(`Error en getAllProfiles: ${error.message}`, error);
      throw error;
    }
  }

  async deleteProfile(usuario_id) {
    try {
      const profile = await this.producerProfileRepository.findByUserId(usuario_id);
      if (!profile) throw new Error('Perfil de productor no encontrado');
      
      return await this.producerProfileRepository.delete(profile.id);
    } catch (error) {
      logger.error(`Error en deleteProfile: ${error.message}`, error);
      throw error;
    }
  }
}

export const producerProfileService = new ProducerProfileService();
