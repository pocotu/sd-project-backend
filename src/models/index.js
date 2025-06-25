import sequelize from '../config/database.js';
import User from './User.js';
import Product from './Product.js';
import Category from './Category.js';

const models = {
  User,
  Product,
  Category
};

// Initialize associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export {
  sequelize,
  User,
  Product,
  Category
}; 