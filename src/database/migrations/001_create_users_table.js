const migration = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      lastName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      roleId: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      isActive: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1,
        allowNull: false
      },
      forcePasswordChange: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        allowNull: false
      },
      lastPasswordChange: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      failedLoginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
    
    await queryInterface.addIndex('users', ['isActive'], { name: 'idx_users_activo' });
    await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email' });
    await queryInterface.addIndex('users', ['roleId'], { name: 'idx_users_roleId' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};

export default migration;