import { productService } from '../../application/services/product.service.js';

export class ProductController {
  async create(req, res) {
    try {
      const product = await productService.createProduct(req.body, req.file);
      // Mapear la respuesta para los tests (campos en inglés)
      res.status(201).json({
        status: 'success',
        data: {
          id: product.id,
          name: product.nombre,
          description: product.descripcion,
          price: product.precio,
          unit: product.unidad,
          type: product.tipo,
          slug: product.slug,
          categoryId: product.categoria_id,
          producerProfileId: product.perfil_productor_id,
          isActive: product.activo,
          featured: product.destacado,
          views: product.vistas,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        }
      });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getAll(req, res) {
    const products = await productService.getAllProducts();
    const data = products.map(product => ({
      id: product.id,
      name: product.nombre,
      description: product.descripcion,
      price: product.precio,
      unit: product.unidad,
      type: product.tipo,
      slug: product.slug,
      categoryId: product.categoria_id,
      producerProfileId: product.perfil_productor_id,
      isActive: product.activo,
      featured: product.destacado,
      views: product.vistas,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
    res.status(200).json({ status: 'success', data });
  }

  async getById(req, res) {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.status(200).json({
      status: 'success',
      data: {
        id: product.id,
        name: product.nombre,
        description: product.descripcion,
        price: product.precio,
        unit: product.unidad,
        type: product.tipo,
        slug: product.slug,
        categoryId: product.categoria_id,
        producerProfileId: product.perfil_productor_id,
        isActive: product.activo,
        featured: product.destacado,
        views: product.vistas,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }
    });
  }

  async update(req, res) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.file);
      if (!product) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
      res.status(200).json({
        status: 'success',
        data: {
          id: product.id,
          name: product.nombre,
          description: product.descripcion,
          price: product.precio,
          unit: product.unidad,
          type: product.tipo,
          slug: product.slug,
          categoryId: product.categoria_id,
          producerProfileId: product.perfil_productor_id,
          isActive: product.activo,
          featured: product.destacado,
          views: product.vistas,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        }
      });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}