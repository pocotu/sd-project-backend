/**
 * DTOs para Insignias
 * Data Transfer Objects para encapsular datos de transferencia de insignias
 */

/**
 * DTO para crear insignia
 */
export class CreateInsigniaDto {
  constructor({ nombre, descripcion, tipo, criterio, icono_url }) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.tipo = tipo;
    this.criterio = criterio;
    this.icono_url = icono_url;
  }

  /**
   * Validar datos de entrada
   */
  validate() {
    const errors = [];

    // Validar nombre
    if (!this.nombre || this.nombre.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    if (this.nombre && this.nombre.length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }

    // Validar descripción
    if (!this.descripcion || this.descripcion.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (this.descripcion && this.descripcion.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    // Validar tipo
    const tiposValidos = ['ventas', 'actividad', 'logro', 'valoracion', 'producto'];
    if (!this.tipo || !tiposValidos.includes(this.tipo)) {
      errors.push(`Tipo inválido. Valores válidos: ${tiposValidos.join(', ')}`);
    }

    // Validar criterio
    if (this.criterio) {
      if (typeof this.criterio === 'string') {
        try {
          JSON.parse(this.criterio);
        } catch (error) {
          errors.push('El criterio debe ser un JSON válido');
        }
      } else if (typeof this.criterio !== 'object') {
        errors.push('El criterio debe ser un objeto o string JSON');
      }
    }

    // Validar icono_url
    if (this.icono_url && !this._isValidUrl(this.icono_url)) {
      errors.push('URL del icono inválida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convertir a objeto para base de datos
   */
  toDbObject() {
    return {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim(),
      tipo: this.tipo,
      criterio: typeof this.criterio === 'object' 
        ? JSON.stringify(this.criterio) 
        : this.criterio,
      icono_url: this.icono_url,
      activo: true
    };
  }

  /**
   * Validar URL
   * @private
   */
  _isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

/**
 * DTO para actualizar insignia
 */
export class UpdateInsigniaDto {
  constructor({ nombre, descripcion, tipo, criterio, icono_url, activo }) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.tipo = tipo;
    this.criterio = criterio;
    this.icono_url = icono_url;
    this.activo = activo;
  }

  /**
   * Validar datos de entrada (solo campos proporcionados)
   */
  validate() {
    const errors = [];

    // Validar nombre si se proporciona
    if (this.nombre !== undefined) {
      if (!this.nombre || this.nombre.trim().length < 3) {
        errors.push('El nombre debe tener al menos 3 caracteres');
      }
      if (this.nombre && this.nombre.length > 100) {
        errors.push('El nombre no puede exceder 100 caracteres');
      }
    }

    // Validar descripción si se proporciona
    if (this.descripcion !== undefined) {
      if (!this.descripcion || this.descripcion.trim().length < 10) {
        errors.push('La descripción debe tener al menos 10 caracteres');
      }
      if (this.descripcion && this.descripcion.length > 500) {
        errors.push('La descripción no puede exceder 500 caracteres');
      }
    }

    // Validar tipo si se proporciona
    if (this.tipo !== undefined) {
      const tiposValidos = ['ventas', 'actividad', 'logro', 'valoracion', 'producto'];
      if (!tiposValidos.includes(this.tipo)) {
        errors.push(`Tipo inválido. Valores válidos: ${tiposValidos.join(', ')}`);
      }
    }

    // Validar criterio si se proporciona
    if (this.criterio !== undefined) {
      if (typeof this.criterio === 'string') {
        try {
          JSON.parse(this.criterio);
        } catch (error) {
          errors.push('El criterio debe ser un JSON válido');
        }
      } else if (typeof this.criterio !== 'object') {
        errors.push('El criterio debe ser un objeto o string JSON');
      }
    }

    // Validar icono_url si se proporciona
    if (this.icono_url !== undefined && this.icono_url && !this._isValidUrl(this.icono_url)) {
      errors.push('URL del icono inválida');
    }

    // Validar activo si se proporciona
    if (this.activo !== undefined && typeof this.activo !== 'boolean') {
      errors.push('El campo activo debe ser verdadero o falso');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convertir a objeto para base de datos (solo campos proporcionados)
   */
  toDbObject() {
    const updateData = {};

    if (this.nombre !== undefined) {
      updateData.nombre = this.nombre.trim();
    }
    
    if (this.descripcion !== undefined) {
      updateData.descripcion = this.descripcion.trim();
    }
    
    if (this.tipo !== undefined) {
      updateData.tipo = this.tipo;
    }
    
    if (this.criterio !== undefined) {
      updateData.criterio = typeof this.criterio === 'object' 
        ? JSON.stringify(this.criterio) 
        : this.criterio;
    }
    
    if (this.icono_url !== undefined) {
      updateData.icono_url = this.icono_url;
    }
    
    if (this.activo !== undefined) {
      updateData.activo = this.activo;
    }

    return updateData;
  }

  /**
   * Validar URL
   * @private
   */
  _isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

/**
 * DTO para respuesta de insignia
 */
export class InsigniaResponseDto {
  constructor(insignia) {
    this.id = insignia.id;
    this.nombre = insignia.nombre;
    this.descripcion = insignia.descripcion;
    this.tipo = insignia.tipo;
    this.criterio = insignia.criterio ? JSON.parse(insignia.criterio) : {};
    this.icono_url = insignia.icono_url;
    this.activo = insignia.activo;
    this.created_at = insignia.created_at;
    this.updated_at = insignia.updated_at;
  }

  /**
   * Convertir a respuesta API
   */
  toApiResponse() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      tipo: this.tipo,
      criterio: this.criterio,
      icono_url: this.icono_url,
      activo: this.activo,
      fechas: {
        creada: this.created_at,
        actualizada: this.updated_at
      }
    };
  }
}

/**
 * DTO para asignación de insignia a usuario
 */
export class UsuarioInsigniaResponseDto {
  constructor(usuarioInsignia) {
    this.id = usuarioInsignia.id;
    this.usuario_id = usuarioInsignia.usuario_id;
    this.insignia_id = usuarioInsignia.insignia_id;
    this.fecha_obtenida = usuarioInsignia.fecha_obtenida;
    this.insignia = usuarioInsignia.Insignia ? new InsigniaResponseDto(usuarioInsignia.Insignia) : null;
  }

  /**
   * Convertir a respuesta API
   */
  toApiResponse() {
    return {
      id: this.id,
      usuario_id: this.usuario_id,
      insignia_id: this.insignia_id,
      fecha_obtenida: this.fecha_obtenida,
      insignia: this.insignia ? this.insignia.toApiResponse() : null
    };
  }
}

/**
 * DTO para lista de insignias
 */
export class InsigniaListDto {
  constructor(insignias, pagination = null) {
    this.insignias = insignias.map(insignia => new InsigniaResponseDto(insignia));
    this.pagination = pagination;
  }

  /**
   * Convertir a respuesta API
   */
  toApiResponse() {
    const response = {
      insignias: this.insignias.map(insignia => insignia.toApiResponse())
    };

    if (this.pagination) {
      response.pagination = this.pagination;
    }

    return response;
  }
}

/**
 * DTO para criterios de insignia
 */
export class InsigniaCriterioDto {
  constructor(tipo, criterio = {}) {
    this.tipo = tipo;
    this.criterio = criterio;
  }

  /**
   * Validar criterios según el tipo
   */
  validate() {
    const errors = [];

    switch (this.tipo) {
      case 'ventas':
        if (!this.criterio.minVentas && !this.criterio.minMonto) {
          errors.push('Las insignias de ventas requieren minVentas o minMonto');
        }
        if (this.criterio.minVentas && (this.criterio.minVentas < 1 || this.criterio.minVentas > 10000)) {
          errors.push('minVentas debe estar entre 1 y 10000');
        }
        if (this.criterio.minMonto && this.criterio.minMonto < 0) {
          errors.push('minMonto debe ser mayor a 0');
        }
        break;

      case 'valoracion':
        if (!this.criterio.minReviews && !this.criterio.minRating) {
          errors.push('Las insignias de valoración requieren minReviews o minRating');
        }
        if (this.criterio.minRating && (this.criterio.minRating < 1 || this.criterio.minRating > 5)) {
          errors.push('minRating debe estar entre 1 y 5');
        }
        break;

      case 'producto':
        if (!this.criterio.minProductos) {
          errors.push('Las insignias de producto requieren minProductos');
        }
        if (this.criterio.minProductos && this.criterio.minProductos < 1) {
          errors.push('minProductos debe ser mayor a 0');
        }
        break;

      case 'actividad':
        if (!this.criterio.tipoActividad || !this.criterio.minValor) {
          errors.push('Las insignias de actividad requieren tipoActividad y minValor');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener criterios por defecto según el tipo
   */
  static getDefaultCriteria(tipo) {
    switch (tipo) {
      case 'ventas':
        return { minVentas: 1 };
      case 'valoracion':
        return { minReviews: 1, minRating: 4.0 };
      case 'producto':
        return { minProductos: 1 };
      case 'actividad':
        return { tipoActividad: 'general', minValor: 1 };
      case 'logro':
        return { descripcion: 'Logro especial' };
      default:
        return {};
    }
  }
}
