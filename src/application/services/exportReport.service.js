import { ExportReportRepository } from '../../infrastructure/repositories/exportReport.repository.js';
import { logger } from '../../infrastructure/utils/logger.js';
import FileGenerator from '../../utils/fileGenerator.js';
import SimpleFileGenerator from '../../utils/simpleFileGenerator.js';
import { User, Product, Review, Contact, ProducerProfile } from '../../models/index.js';
import { Op } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

// Use simple file generator in test environment
const fileGenerator = process.env.NODE_ENV === 'test' ? SimpleFileGenerator : FileGenerator;

/**
 * Servicio para gestión de reportes de exportación
 * Implementa la lógica de negocio para generar y gestionar reportes
 * Siguiendo principios SOLID: SRP, OCP, DIP
 */
export class ExportReportService {
  constructor() {
    this.exportReportRepository = new ExportReportRepository();
    this.reportsDir = path.join(process.cwd(), 'exports');
  }

  /**
   * Inicializar directorio de reportes
   */
  async initializeReportsDirectory() {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
    } catch (error) {
      logger.error(`Error creando directorio de reportes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Solicitar generación de reporte
   * @param {Object} requestData - Datos de la solicitud
   * @returns {Promise<Object>} Reporte solicitado
   */
  async requestReport(requestData) {
    try {
      const { usuario_id, tipo_reporte, formato, filtros = {} } = requestData;

      // Validar parámetros
      this._validateReportRequest(tipo_reporte, formato);

      // Crear solicitud en la base de datos
      const report = await this.exportReportRepository.createReportRequest({
        usuario_id,
        tipo_reporte,
        formato,
        parametros_filtro: filtros
      });

      // Iniciar generación en background (podría ser una cola de trabajos)
      this._processReportGeneration(report.id);

      return {
        success: true,
        message: 'Reporte solicitado exitosamente',
        data: {
          reportId: report.id,
          estado: report.estado,
          tipo: report.tipo_reporte,
          formato: report.formato,
          solicitadoAt: report.solicitado_at
        }
      };
    } catch (error) {
      logger.error(`Error solicitando reporte: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener reportes de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Reportes del usuario
   */
  async getUserReports(userId, options = {}) {
    try {
      const result = await this.exportReportRepository.findByUserId(userId, options);
      
      return {
        success: true,
        data: {
          reports: result.rows.map(report => ({
            id: report.id,
            tipo: report.tipo_reporte,
            formato: report.formato,
            estado: report.estado,
            nombreArchivo: report.nombre_archivo,
            urlDescarga: report.url_descarga,
            solicitadoAt: report.solicitado_at,
            completadoAt: report.completado_at,
            expiraAt: report.expires_at
          })),
          pagination: {
            total: result.count,
            page: parseInt(options.page) || 1,
            limit: parseInt(options.limit) || 10,
            totalPages: Math.ceil(result.count / (parseInt(options.limit) || 10))
          }
        }
      };
    } catch (error) {
      logger.error(`Error obteniendo reportes del usuario: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener reporte específico
   * @param {number} reportId - ID del reporte
   * @param {string} userId - ID del usuario (para verificar permisos)
   * @returns {Promise<Object>} Datos del reporte
   */
  async getReport(reportId, userId) {
    try {
      const report = await this.exportReportRepository.findById(reportId);
      
      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      // Verificar que el usuario es propietario del reporte
      if (report.usuario_id !== userId) {
        throw new Error('No autorizado para acceder a este reporte');
      }

      return {
        success: true,
        data: {
          id: report.id,
          tipo: report.tipo_reporte,
          formato: report.formato,
          estado: report.estado,
          nombreArchivo: report.nombre_archivo,
          urlDescarga: report.url_descarga,
          parametrosFiltro: report.parametros_filtro ? JSON.parse(report.parametros_filtro) : {},
          solicitadoAt: report.solicitado_at,
          completadoAt: report.completado_at,
          expiraAt: report.expires_at
        }
      };
    } catch (error) {
      logger.error(`Error obteniendo reporte: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancelar reporte pendiente
   * @param {number} reportId - ID del reporte
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Resultado de la cancelación
   */
  async cancelReport(reportId, userId) {
    try {
      const report = await this.exportReportRepository.findById(reportId);
      
      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      if (report.usuario_id !== userId) {
        throw new Error('No autorizado para cancelar este reporte');
      }

      if (report.estado !== 'generando') {
        throw new Error('Solo se pueden cancelar reportes en estado "generando"');
      }

      await this.exportReportRepository.markAsError(reportId);

      return {
        success: true,
        message: 'Reporte cancelado exitosamente'
      };
    } catch (error) {
      logger.error(`Error cancelando reporte: ${error.message}`);
      throw error;
    }
  }

  /**
   * Limpiar reportes expirados
   * @returns {Promise<Object>} Resultado de la limpieza
   */
  async cleanupExpiredReports() {
    try {
      const deletedCount = await this.exportReportRepository.deleteExpiredReports();
      
      return {
        success: true,
        message: `${deletedCount} reportes expirados eliminados`
      };
    } catch (error) {
      logger.error(`Error limpiando reportes expirados: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validar solicitud de reporte
   * @private
   */
  _validateReportRequest(tipoReporte, formato) {
    const tiposValidos = ['productos', 'metricas', 'valoraciones', 'contactos'];
    const formatosValidos = ['csv', 'pdf', 'excel'];

    if (!tiposValidos.includes(tipoReporte)) {
      throw new Error(`Tipo de reporte inválido. Tipos válidos: ${tiposValidos.join(', ')}`);
    }

    if (!formatosValidos.includes(formato)) {
      throw new Error(`Formato inválido. Formatos válidos: ${formatosValidos.join(', ')}`);
    }
  }

  /**
   * Procesar generación de reporte en background
   * @private
   */
  async _processReportGeneration(reportId) {
    // Esta función se ejecuta en background
    // En una implementación real, esto podría ser una cola de trabajos
    setTimeout(async () => {
      try {
        await this._generateReport(reportId);
      } catch (error) {
        logger.error(`Error generando reporte ${reportId}: ${error.message}`);
        await this.exportReportRepository.markAsError(reportId);
      }
    }, 100); // Simular procesamiento asíncrono
  }

  /**
   * Generar reporte específico
   * @private
   */
  async _generateReport(reportId) {
    try {
      const report = await this.exportReportRepository.findById(reportId);
      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      // Obtener datos para el reporte
      const reportData = await this._getReportData(report.tipo_reporte, 
        report.parametros_filtro ? JSON.parse(report.parametros_filtro) : {});
      
      // Generar archivo según el formato
      const fileName = `reporte_${report.tipo_reporte}_${Date.now()}`;
      let filePath;
      
      switch (report.formato) {
        case 'csv':
          filePath = await fileGenerator.generateCSV(
            reportData.data, 
            reportData.headers, 
            fileName
          );
          break;
        case 'excel':
          filePath = await fileGenerator.generateExcel(
            reportData.data, 
            reportData.headers, 
            fileName
          );
          break;
        case 'pdf':
          filePath = await fileGenerator.generatePDF(
            reportData.data, 
            reportData.headers, 
            fileName,
            {
              title: reportData.title,
              metadata: {
                'Tipo de Reporte': report.tipo_reporte,
                'Fecha de Generación': new Date().toLocaleString('es-ES'),
                'Total de Registros': reportData.data.length
              }
            }
          );
          break;
        default:
          throw new Error(`Formato no soportado: ${report.formato}`);
      }
      
      // Crear URL de descarga
      const fileNameOnly = path.basename(filePath);
      const downloadUrl = `/api/export-reports/download/${fileNameOnly}`;
      
      // Marcar como completado
      await this.exportReportRepository.markAsCompleted(reportId, fileNameOnly, downloadUrl);
      
      logger.info(`Reporte generado exitosamente: ${fileNameOnly}`);
      
      // Limpiar archivos antiguos
      fileGenerator.cleanupOldFiles().catch(err => 
        logger.warn(`Error limpiando archivos antiguos: ${err.message}`));
        
    } catch (error) {
      logger.error(`Error en _generateReport: ${error.message}`);
      await this.exportReportRepository.markAsError(reportId);
      throw error;
    }
  }

  /**
   * Obtener datos para el reporte según el tipo
   * @private
   */
  async _getReportData(tipoReporte, filtros = {}) {
    switch (tipoReporte) {
      case 'productos':
        return await this._getProductosData(filtros);
      case 'valoraciones':
        return await this._getValoracionesData(filtros);
      case 'contactos':
        return await this._getContactosData(filtros);
      case 'metricas':
        return await this._getMetricasData(filtros);
      default:
        throw new Error(`Tipo de reporte no soportado: ${tipoReporte}`);
    }
  }

  /**
   * Obtener datos de productos
   * @private
   */
  async _getProductosData(filtros) {
    const whereClause = {};
    
    if (filtros.categoria_id) {
      whereClause.categoria_id = filtros.categoria_id;
    }
    
    if (filtros.fecha_desde) {
      whereClause.created_at = {
        [Op.gte]: new Date(filtros.fecha_desde)
      };
    }

    const productos = await Product.findAll({
      where: whereClause,
      include: [
        { 
          model: ProducerProfile, 
          as: 'perfilProductor',
          include: [
            { 
              model: User, 
              as: 'usuario', 
              attributes: ['firstName', 'lastName'] 
            }
          ]
        }
      ],
      limit: filtros.limite || 1000
    });

    return {
      title: 'Reporte de Productos',
      headers: [
        { id: 'id', title: 'ID' },
        { id: 'nombre', title: 'Nombre' },
        { id: 'precio', title: 'Precio' },
        { id: 'categoria', title: 'Categoría' },
        { id: 'productor', title: 'Productor' },
        { id: 'stock', title: 'Stock' },
        { id: 'activo', title: 'Activo' },
        { id: 'fecha_creacion', title: 'Fecha Creación' }
      ],
      data: productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        categoria: p.categoria_id,
        productor: p.perfilProductor?.usuario ? `${p.perfilProductor.usuario.firstName} ${p.perfilProductor.usuario.lastName}` : 'N/A',
        stock: p.stock || 0,
        activo: p.activo ? 'Sí' : 'No',
        fecha_creacion: p.created_at.toLocaleDateString('es-ES')
      }))
    };
  }

  /**
   * Obtener datos de valoraciones
   * @private
   */
  async _getValoracionesData(filtros) {
    const whereClause = {};
    
    if (filtros.calificacion_min) {
      whereClause.calificacion = {
        [Op.gte]: filtros.calificacion_min
      };
    }

    const valoraciones = await Review.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'Usuario', attributes: ['firstName', 'lastName'] },
        { model: Product, as: 'Producto', attributes: ['nombre'] }
      ],
      limit: filtros.limite || 1000
    });

    return {
      title: 'Reporte de Valoraciones',
      headers: [
        { id: 'id', title: 'ID' },
        { id: 'producto', title: 'Producto' },
        { id: 'usuario', title: 'Usuario' },
        { id: 'calificacion', title: 'Calificación' },
        { id: 'comentario', title: 'Comentario' },
        { id: 'fecha', title: 'Fecha' }
      ],
      data: valoraciones.map(v => ({
        id: v.id,
        producto: v.Producto ? v.Producto.nombre : 'N/A',
        usuario: v.Usuario ? `${v.Usuario.firstName} ${v.Usuario.lastName}` : 'N/A',
        calificacion: v.calificacion,
        comentario: v.comentario || '',
        fecha: v.created_at.toLocaleDateString('es-ES')
      }))
    };
  }

  /**
   * Obtener datos de contactos
   * @private
   */
  async _getContactosData(filtros) {
    const whereClause = {};
    
    if (filtros.estado) {
      whereClause.estado = filtros.estado;
    }

    const contactos = await Contact.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'Usuario', attributes: ['firstName', 'lastName', 'email'] }
      ],
      limit: filtros.limite || 1000
    });

    return {
      title: 'Reporte de Contactos',
      headers: [
        { id: 'id', title: 'ID' },
        { id: 'nombre', title: 'Nombre' },
        { id: 'email', title: 'Email' },
        { id: 'asunto', title: 'Asunto' },
        { id: 'estado', title: 'Estado' },
        { id: 'fecha', title: 'Fecha' }
      ],
      data: contactos.map(c => ({
        id: c.id,
        nombre: c.Usuario ? `${c.Usuario.firstName} ${c.Usuario.lastName}` : c.nombre,
        email: c.Usuario ? c.Usuario.email : c.email,
        asunto: c.asunto,
        estado: c.estado,
        fecha: c.created_at.toLocaleDateString('es-ES')
      }))
    };
  }

  /**
   * Obtener datos de métricas
   * @private
   */
  async _getMetricasData(filtros) {
    // Simulación de métricas del sistema
    const productCount = await Product.count();
    const reviewCount = await Review.count();
    const userCount = await User.count();
    const contactCount = await Contact.count();

    return {
      title: 'Reporte de Métricas del Sistema',
      headers: [
        { id: 'metrica', title: 'Métrica' },
        { id: 'valor', title: 'Valor' },
        { id: 'descripcion', title: 'Descripción' }
      ],
      data: [
        {
          metrica: 'Total Productos',
          valor: productCount,
          descripcion: 'Número total de productos en el sistema'
        },
        {
          metrica: 'Total Valoraciones',
          valor: reviewCount,
          descripcion: 'Número total de valoraciones registradas'
        },
        {
          metrica: 'Total Usuarios',
          valor: userCount,
          descripcion: 'Número total de usuarios registrados'
        },
        {
          metrica: 'Total Contactos',
          valor: contactCount,
          descripcion: 'Número total de formularios de contacto'
        }
      ]
    };
  }
}
