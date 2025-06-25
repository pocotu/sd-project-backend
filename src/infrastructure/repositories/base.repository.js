export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id) {
    return await this.model.findByPk(id);
  }

  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  async update(id, data) {
    const instance = await this.model.findByPk(id);
    if (!instance) return null;
    await instance.update(data);
    return instance;
  }

  async delete(id) {
    const instance = await this.model.findByPk(id);
    if (!instance) return false;
    await instance.destroy();
    return true;
  }
}