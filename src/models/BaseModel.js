import { Model } from 'sequelize';

export class BaseModel extends Model {
  static init(attributes, options) {
    return super.init(attributes, {
      ...options,
      timestamps: true,
      paranoid: true, // Soft deletes
    });
  }

  static associate(models) {
    // To be implemented by child models
  }
} 