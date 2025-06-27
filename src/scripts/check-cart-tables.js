import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

try {
  const [results] = await sequelize.query("SHOW TABLES LIKE 'CARRITOS'");
  console.log('CARRITOS table exists:', results.length > 0);
  
  const [results2] = await sequelize.query("SHOW TABLES LIKE 'CARRITO_ITEMS'");
  console.log('CARRITO_ITEMS table exists:', results2.length > 0);
  
  if (results.length > 0) {
    console.log('Cart tables already exist from the original database schema');
  }
  
  await sequelize.close();
} catch(e) { 
  console.error('Error:', e.message); 
  process.exit(1); 
}
