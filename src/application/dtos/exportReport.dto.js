/**
 * DTOs para Export Report
 * Data Transfer Objects para encapsular datos de transferencia
 */

/**
 * DTO para solicitud de reporte
 */
export class CreateExportReportDto {
  constructor({ tipo_reporte, formato, filtros = {} }) {
    this.tipo_reporte = tipo_reporte;
    this.formato = formato;
    this.filtros = filtros;
  }

  /**
   * Validar datos de entrada
   */
  validate() {
    const errors = [];

    // Validar tipo de reporte
    const tiposValidos = ['productos', 'metricas', 'valoraciones', 'contactos'];
    if (!this.tipo_reporte || !tiposValidos.includes(this.tipo_reporte)) {
      errors.push(`Tipo de reporte inválido. Valores válidos: ${tiposValidos.join(', ')}`);
    }

    // Validar formato
    const formatosValidos = ['csv', 'pdf', 'excel'];
    if (!this.formato || !formatosValidos.includes(this.formato)) {
      errors.push(`Formato inválido. Valores válidos: ${formatosValidos.join(', ')}`);
    }

    // Validar filtros
    if (this.filtros && typeof this.filtros !== 'object') {
      errors.push('Los filtros deben ser un objeto');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convertir a objeto para base de datos
   */
  toDbObject(usuario_id) {
    return {
      usuario_id,
      tipo_reporte: this.tipo_reporte,
      formato: this.formato,
      parametros_filtro: JSON.stringify(this.filtros)
    };
  }
}

/**
 * DTO para respuesta de reporte
 */
export class ExportReportResponseDto {
  constructor(report) {
    this.id = report.id;
    this.tipo = report.tipo_reporte;
    this.formato = report.formato;
    this.estado = report.estado;
    this.nombreArchivo = report.nombre_archivo;
    this.urlDescarga = report.url_descarga;
    this.parametrosFiltro = report.parametros_filtro ? JSON.parse(report.parametros_filtro) : {};
    this.solicitadoAt = report.solicitado_at;
    this.completadoAt = report.completado_at;
    this.expiraAt = report.expires_at;
  }

  /**
   * Convertir a respuesta API
   */
  toApiResponse() {
    return {
      id: this.id,
      tipo: this.tipo,
      formato: this.formato,
      estado: this.estado,
      nombreArchivo: this.nombreArchivo,
      urlDescarga: this.urlDescarga,
      parametrosFiltro: this.parametrosFiltro,
      fechas: {
        solicitado: this.solicitadoAt,
        completado: this.completadoAt,
        expira: this.expiraAt
      }
    };
  }
}

/**
 * DTO para lista de reportes
 */
export class ExportReportListDto {
  constructor(reports, pagination) {
    this.reports = reports.map(report => new ExportReportResponseDto(report));
    this.pagination = pagination;
  }

  /**
   * Convertir a respuesta API
   */
  toApiResponse() {
    return {
      reports: this.reports.map(report => report.toApiResponse()),
      pagination: this.pagination
    };
  }
}

/**
 * DTO para filtros de reporte
 */
export class ReportFiltersDto {
  constructor(filtros = {}) {
    this.categoria_id = filtros.categoria_id;
    this.fecha_desde = filtros.fecha_desde;
    this.fecha_hasta = filtros.fecha_hasta;
    this.estado = filtros.estado;
    this.calificacion_min = filtros.calificacion_min;
    this.limite = filtros.limite || 1000;
  }

  /**
   * Validar filtros
   */
  validate() {
    const errors = [];

    // Validar fechas
    if (this.fecha_desde && isNaN(Date.parse(this.fecha_desde))) {
      errors.push('Fecha desde inválida');
    }

    if (this.fecha_hasta && isNaN(Date.parse(this.fecha_hasta))) {
      errors.push('Fecha hasta inválida');
    }

    if (this.fecha_desde && this.fecha_hasta && 
        new Date(this.fecha_desde) > new Date(this.fecha_hasta)) {
      errors.push('La fecha desde no puede ser mayor que la fecha hasta');
    }

    // Validar calificación
    if (this.calificacion_min && (this.calificacion_min < 1 || this.calificacion_min > 5)) {
      errors.push('Calificación mínima debe estar entre 1 y 5');
    }

    // Validar límite
    if (this.limite && (this.limite < 1 || this.limite > 10000)) {
      errors.push('Límite debe estar entre 1 y 10000');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convertir a objeto de consulta Sequelize
   */
  toSequelizeWhere() {
    const where = {};

    if (this.categoria_id) {
      where.categoria_id = this.categoria_id;
    }

    if (this.estado) {
      where.estado = this.estado;
    }

    if (this.fecha_desde || this.fecha_hasta) {
      where.created_at = {};
      if (this.fecha_desde) {
        where.created_at[Op.gte] = new Date(this.fecha_desde);
      }
      if (this.fecha_hasta) {
        where.created_at[Op.lte] = new Date(this.fecha_hasta);
      }
    }

    return where;
  }
}
