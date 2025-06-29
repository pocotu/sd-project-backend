import { ExportReportService } from '../../application/services/exportReport.service.js';
import { logger } from '../../infrastructure/utils/logger.js';
import path from 'path';
import fs from 'fs';

/**
 * Controlador para gestión de reportes de exportación
 * Implementa endpoints REST para solicitar y gestionar reportes
 * Siguiendo principios SOLID: SRP (Single Responsibility), DIP (Dependency Inversion)
 */
class ExportReportController {
  constructor() {
    this.exportReportService = new ExportReportService();
  }

  /**
   * Solicitar generación de reporte
   * POST /api/reports/request
   */
  async requestReport(req, res) {
    try {
      const { tipo_reporte, formato, filtros = {} } = req.body;
      const usuario_id = req.user.id;

      logger.info(`Solicitando reporte: ${tipo_reporte} en formato ${formato}`, '[API]');

      const result = await this.exportReportService.requestReport({
        usuario_id,
        tipo_reporte,
        formato,
        filtros
      });

      res.status(201).json(result);
      logger.info(`Reporte solicitado exitosamente por usuario ${usuario_id}`, '[API]');
    } catch (error) {
      logger.error(`Error solicitando reporte: ${error.message}`, '[API]');
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener reportes del usuario
   * GET /api/reports
   */
  async getUserReports(req, res) {
    try {
      const usuario_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      logger.info(`Obteniendo reportes del usuario ${usuario_id}`, '[API]');

      const result = await this.exportReportService.getUserReports(usuario_id, { page, limit });

      res.status(200).json(result);
      logger.info(`Reportes obtenidos exitosamente para usuario ${usuario_id}`, '[API]');
    } catch (error) {
      logger.error(`Error obteniendo reportes del usuario: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener reporte específico
   * GET /api/reports/:id
   */
  async getReport(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.id;

      logger.info(`Obteniendo reporte ${id} para usuario ${usuario_id}`, '[API]');

      const result = await this.exportReportService.getReport(parseInt(id), usuario_id);

      res.status(200).json(result);
      logger.info(`Reporte ${id} obtenido exitosamente`, '[API]');
    } catch (error) {
      logger.error(`Error obteniendo reporte: ${error.message}`, '[API]');
      
      if (error.message.includes('No autorizado') || error.message.includes('no encontrado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    }
  }

  /**
   * Cancelar reporte pendiente
   * PATCH /api/reports/:id/cancel
   */
  async cancelReport(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.id;

      logger.info(`Cancelando reporte ${id} para usuario ${usuario_id}`, '[API]');

      const result = await this.exportReportService.cancelReport(parseInt(id), usuario_id);

      res.status(200).json(result);
      logger.info(`Reporte ${id} cancelado exitosamente`, '[API]');
    } catch (error) {
      logger.error(`Error cancelando reporte: ${error.message}`, '[API]');
      
      if (error.message.includes('No autorizado') || error.message.includes('no encontrado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error.message.includes('Solo se pueden cancelar')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    }
  }

  /**
   * Descargar archivo de reporte
   * GET /api/export-reports/download/:filename
   */
  async downloadReport(req, res) {
    try {
      const { filename } = req.params;
      const usuario_id = req.user.id;

      logger.info(`Descargando archivo ${filename} para usuario ${usuario_id}`, '[API]');

      // Verificar que el usuario tiene permiso para descargar este archivo
      const reports = await this.exportReportService.getUserReports(usuario_id, { limit: 1000 });
      const userReport = reports.data.reports.find(r => r.nombreArchivo === filename);

      if (!userReport) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado o no autorizado'
        });
      }

      if (userReport.estado !== 'completado') {
        return res.status(400).json({
          success: false,
          message: 'El reporte no está listo para descarga'
        });
      }

      // Verificar que el archivo no ha expirado
      if (userReport.expiraAt && new Date() > new Date(userReport.expiraAt)) {
        return res.status(410).json({
          success: false,
          message: 'El archivo ha expirado'
        });
      }

      // Construir ruta del archivo
      const filePath = path.join(process.cwd(), 'uploads', 'exports', filename);

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado en el servidor'
        });
      }

      // Determinar el tipo MIME basado en la extensión
      const ext = path.extname(filename).toLowerCase();
      let mimeType = 'application/octet-stream';
      
      switch (ext) {
        case '.csv':
          mimeType = 'text/csv';
          break;
        case '.xlsx':
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case '.pdf':
          mimeType = 'application/pdf';
          break;
      }

      // Configurar headers para descarga
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', mimeType);

      // Enviar archivo
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        logger.info(`Archivo ${filename} descargado exitosamente por usuario ${usuario_id}`, '[API]');
      });

      fileStream.on('error', (error) => {
        logger.error(`Error enviando archivo ${filename}: ${error.message}`, '[API]');
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error enviando archivo'
          });
        }
      });

    } catch (error) {
      logger.error(`Error descargando reporte: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Limpiar reportes expirados (endpoint de administración)
   * DELETE /api/reports/cleanup
   */
  async cleanupExpiredReports(req, res) {
    try {
      logger.info('Iniciando limpieza de reportes expirados', '[API]');

      const result = await this.exportReportService.cleanupExpiredReports();

      res.status(200).json(result);
      logger.info('Limpieza de reportes completada', '[API]');
    } catch (error) {
      logger.error(`Error limpiando reportes expirados: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener tipos de reportes disponibles
   * GET /api/reports/types
   */
  async getReportTypes(req, res) {
    try {
      const reportTypes = [
        {
          tipo: 'productos',
          nombre: 'Reporte de Productos',
          descripcion: 'Listado de productos con métricas',
          formatosDisponibles: ['csv', 'excel', 'pdf']
        },
        {
          tipo: 'metricas',
          nombre: 'Reporte de Métricas',
          descripcion: 'Métricas de rendimiento y estadísticas',
          formatosDisponibles: ['csv', 'excel', 'pdf']
        },
        {
          tipo: 'valoraciones',
          nombre: 'Reporte de Valoraciones',
          descripcion: 'Reseñas y calificaciones recibidas',
          formatosDisponibles: ['csv', 'excel', 'pdf']
        },
        {
          tipo: 'contactos',
          nombre: 'Reporte de Contactos',
          descripcion: 'Mensajes y consultas recibidas',
          formatosDisponibles: ['csv', 'excel', 'pdf']
        }
      ];

      res.status(200).json({
        success: true,
        data: reportTypes
      });
    } catch (error) {
      logger.error(`Error obteniendo tipos de reportes: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default ExportReportController;
