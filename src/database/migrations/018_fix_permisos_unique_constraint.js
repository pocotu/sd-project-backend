// Migration to fix unique constraint on permisos table
'use strict';

const migration = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the table exists
      const tableDescription = await queryInterface.describeTable('PERMISOS');
      
      // Drop existing unique constraint if it exists and add a new one
      // that includes both accion and recurso
      try {
        await queryInterface.removeIndex('PERMISOS', 'accion');
      } catch (error) {
        // Index might not exist, continue
      }

      // Add unique constraint on combination of accion and recurso
      await queryInterface.addIndex('PERMISOS', ['accion', 'recurso'], {
        unique: true,
        name: 'idx_permisos_accion_recurso_unique'
      });

      console.log('✅ [Migration] Fixed PERMISOS unique constraint successfully');
    } catch (error) {
      console.log('ℹ️ [Migration] PERMISOS table might not exist yet, skipping constraint fix');
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeIndex('PERMISOS', 'idx_permisos_accion_recurso_unique');
      
      // Re-add the old constraint if needed
      await queryInterface.addIndex('PERMISOS', ['accion'], {
        unique: true,
        name: 'accion'
      });
    } catch (error) {
      // Ignore errors during rollback
      console.log('⚠️ [Migration] Error rolling back PERMISOS constraint fix:', error.message);
    }
  }
};

export default migration;
