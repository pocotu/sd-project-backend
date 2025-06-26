import { logger } from '../../infrastructure/utils/logger.js';
import { Contact } from '../../models/index.js';

export class ContactController {
  static async createContact(req, res) {
    try {
      const { emprendedor_id, nombre_contacto, email_contacto, telefono_contacto, mensaje, producto_id } = req.body;
      const userId = req.user?.id;

      const contact = await Contact.create({
        emprendedor_id: emprendedor_id || '00000000-0000-0000-0000-000000000000', // Default placeholder
        usuario_id: userId || null,
        nombre_contacto,
        email_contacto,
        telefono_contacto,
        mensaje,
        producto_id: producto_id || null,
        estado: 'nuevo'
      });

      res.status(201).json({
        status: 'success',
        message: 'Contacto creado exitosamente',
        data: contact
      });
    } catch (error) {
      logger.error('Error creating contact:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  static async updateContactStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const contact = await Contact.findByPk(id);
      if (!contact) {
        return res.status(404).json({
          status: 'error',
          message: 'Contacto no encontrado'
        });
      }

      await contact.update({ estado });

      res.status(200).json({
        status: 'success',
        message: 'Estado de contacto actualizado',
        data: contact
      });
    } catch (error) {
      logger.error('Error updating contact status:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }
}
