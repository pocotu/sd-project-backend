import dotenv from 'dotenv';

dotenv.config();

const config = {
  development: {
    database: process.env.DB_NAME || 'emprendimiento_db',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  test: {
    database: process.env.DB_TEST_NAME || 'emprendimiento_db_test',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
};

export default config;