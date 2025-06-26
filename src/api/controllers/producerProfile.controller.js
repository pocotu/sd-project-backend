import { producerProfileService } from '../../application/services/producerProfile.service.js';
import { ProducerProfileDTO } from '../../application/dtos/producerProfile.dto.js';
import { logger } from '../../infrastructure/utils/logger.js';

export class ProducerProfileController {
  async create(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Usuario no autenticado o token inválido' 
        });
      }

      const usuario_id = req.user.id;
      logger.info(`Creando perfil para el usuario: ${usuario_id}`);
      
      // Verificar campos requeridos
      if (!req.body.nombre_negocio || !req.body.ubicacion) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Nombre de negocio y ubicación son campos requeridos' 
        });
      }
      
      const profile = await producerProfileService.createProfile(usuario_id, req.body);
      res.status(201).json({ status: 'success', data: new ProducerProfileDTO(profile) });
    } catch (error) {
      logger.error(`Error al crear perfil: ${error.message}`, error);
      let message = error.message;
      let statusCode = 400;
      
      if (error.name === 'UniqueConstraintError' || error.message.includes('ya tiene un perfil')) {
        message = 'El usuario ya tiene un perfil de productor';
      } else if (error.name === 'SequelizeValidationError') {
        message = 'Datos de perfil inválidos';
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        message = 'Usuario no encontrado';
      }
      
      res.status(statusCode).json({ status: 'error', message });
    }
  }

  async update(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Usuario no autenticado o token inválido' 
        });
      }

      const usuario_id = req.user.id;
      const profile = await producerProfileService.updateProfile(usuario_id, req.body);
      res.status(200).json({ status: 'success', data: new ProducerProfileDTO(profile) });
    } catch (error) {
      logger.error(`Error al actualizar perfil: ${error.message}`, error);
      let statusCode = 400;
      let message = error.message;
      
      if (error.message.includes('no encontrado')) {
        statusCode = 404;
        message = 'Perfil de productor no encontrado';
      }
      
      res.status(statusCode).json({ status: 'error', message });
    }
  }

  async getMyProfile(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Usuario no autenticado o token inválido' 
        });
      }
      
      const usuario_id = req.user.id;
      const profile = await producerProfileService.getProfileByUserId(usuario_id);
      if (!profile) return res.status(404).json({ status: 'error', message: 'Perfil de productor no encontrado' });
      res.status(200).json({ status: 'success', data: new ProducerProfileDTO(profile) });
    } catch (error) {
      logger.error(`Error al obtener perfil: ${error.message}`, error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const profiles = await producerProfileService.getAllProfiles();
      res.status(200).json({ 
        status: 'success', 
        data: profiles.map(profile => new ProducerProfileDTO(profile)) 
      });
    } catch (error) {
      logger.error(`Error al obtener perfiles: ${error.message}`, error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async delete(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Usuario no autenticado o token inválido' 
        });
      }

      const usuario_id = req.user.id;
      const profile = await producerProfileService.getProfileByUserId(usuario_id);
      
      if (!profile) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Perfil de productor no encontrado' 
        });
      }

      await producerProfileService.deleteProfile(usuario_id);
      res.status(200).json({ 
        status: 'success', 
        message: 'Perfil de productor eliminado exitosamente' 
      });
    } catch (error) {
      logger.error(`Error al eliminar perfil: ${error.message}`, error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}
