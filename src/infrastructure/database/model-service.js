import { createUserModel } from '../../models/user.model.js';

class ModelService {
  constructor(database) {
    this.database = database;
    this.models = {
      User: createUserModel(database)
    };
  }

  async findUserByEmail(email) {
    try {
      return await this.models.User.findOne({
        where: { email }
      });
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  async findAllTables() {
    try {
      return await this.database.getQueryInterface().showAllTables();
    } catch (error) {
      throw new Error(`Error al obtener tablas: ${error.message}`);
    }
  }
}

export const createModelService = (database) => new ModelService(database); 