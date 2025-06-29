import sequelize from '../config/database.js';
import { logger } from '../infrastructure/utils/logger.js';

/**
 * Seeder para insignias predeterminadas del sistema
 * Siguiendo principios SOLID: SRP (Single Responsibility)
 */
export default async function seedInsignias() {
  try {
    logger.info('Iniciando seeder de insignias predeterminadas');

    const insignias = [
      // Insignias de productos
      {
        nombre: 'Primer Producto',
        descripcion: 'Felicidades por crear tu primer producto en la plataforma',
        icono_url: '/icons/first-product.svg',
        color_hex: '#4CAF50',
        tipo: 'productos',
        umbral_requerido: 1,
        activa: 1
      },
      {
        nombre: 'Productor Activo',
        descripcion: 'Has creado 5 productos, ¡sigue así!',
        icono_url: '/icons/active-producer.svg',
        color_hex: '#2196F3',
        tipo: 'productos',
        umbral_requerido: 5,
        activa: 1
      },
      {
        nombre: 'Productor Experto',
        descripcion: 'Increíble, ya tienes 10 productos en tu catálogo',
        icono_url: '/icons/expert-producer.svg',
        color_hex: '#FF9800',
        tipo: 'productos',
        umbral_requerido: 10,
        activa: 1
      },
      {
        nombre: 'Maestro Productor',
        descripcion: 'Impresionante, has alcanzado 25 productos',
        icono_url: '/icons/master-producer.svg',
        color_hex: '#9C27B0',
        tipo: 'productos',
        umbral_requerido: 25,
        activa: 1
      },
      {
        nombre: 'Leyenda del Catálogo',
        descripcion: 'Extraordinario, tienes 50 productos o más',
        icono_url: '/icons/catalog-legend.svg',
        color_hex: '#F44336',
        tipo: 'productos',
        umbral_requerido: 50,
        activa: 1
      },

      // Insignias de valoraciones
      {
        nombre: 'Primera Valoración',
        descripcion: 'Has recibido tu primera valoración de un cliente',
        icono_url: '/icons/first-rating.svg',
        color_hex: '#FFEB3B',
        tipo: 'valoraciones',
        umbral_requerido: 1,
        activa: 1
      },
      {
        nombre: 'Bien Valorado',
        descripcion: 'Has recibido 10 valoraciones de tus productos',
        icono_url: '/icons/well-rated.svg',
        color_hex: '#8BC34A',
        tipo: 'valoraciones',
        umbral_requerido: 10,
        activa: 1
      },
      {
        nombre: 'Muy Valorado',
        descripcion: 'Excelente, ya tienes 25 valoraciones',
        icono_url: '/icons/highly-rated.svg',
        color_hex: '#4CAF50',
        tipo: 'valoraciones',
        umbral_requerido: 25,
        activa: 1
      },
      {
        nombre: 'Súper Valorado',
        descripcion: 'Increíble, has alcanzado 50 valoraciones',
        icono_url: '/icons/super-rated.svg',
        color_hex: '#00BCD4',
        tipo: 'valoraciones',
        umbral_requerido: 50,
        activa: 1
      },
      {
        nombre: 'Estrella de la Plataforma',
        descripcion: 'Eres una estrella con 100 valoraciones o más',
        icono_url: '/icons/platform-star.svg',
        color_hex: '#FFD700',
        tipo: 'valoraciones',
        umbral_requerido: 100,
        activa: 1
      },

      // Insignias de ventas (para futuro)
      {
        nombre: 'Primera Venta',
        descripcion: 'Felicidades por tu primera venta completada',
        icono_url: '/icons/first-sale.svg',
        color_hex: '#4CAF50',
        tipo: 'ventas',
        umbral_requerido: 1,
        activa: 0 // Desactivada hasta implementar sistema de ventas
      },
      {
        nombre: 'Vendedor Exitoso',
        descripcion: 'Has completado 10 ventas exitosas',
        icono_url: '/icons/successful-seller.svg',
        color_hex: '#2196F3',
        tipo: 'ventas',
        umbral_requerido: 10,
        activa: 0 // Desactivada hasta implementar sistema de ventas
      }
    ];

    // Insertar insignias si no existen
    for (const insignia of insignias) {
      const [result, created] = await sequelize.models.Insignia.findOrCreate({
        where: { nombre: insignia.nombre },
        defaults: insignia
      });

      if (created) {
        logger.info(`Insignia creada: ${insignia.nombre}`);
      } else {
        logger.info(`Insignia ya existe: ${insignia.nombre}`);
      }
    }

    logger.info('Seeder de insignias completado exitosamente');
  } catch (error) {
    logger.error(`Error en seeder de insignias: ${error.message}`);
    throw error;
  }
}
