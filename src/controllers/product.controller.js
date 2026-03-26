import { ProductModel } from "../models/product.model.js";

const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.findAll();
    res.status(200).json({
      success: true,
      message: "Lista de productos",
      data: products,
      errors: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno al obtener los productos",
      data: [],
      errors: [error.message],
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(Number(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Producto con ID ${id} no encontrado`,
        data: [],
        errors: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "Producto encontrado correctamente",
      data: product,
      errors: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno al procesar la búsqueda",
      data: [],
      errors: [error.message],
    });
  }
};

const createProduct = async (req, res) => {
  try {
    // CORREGIDO: ahora usamos category_id (nombre correcto)
    const { name, category_id, price } = req.body;

    if (!name || !category_id || !price) {
      return res.status(400).json({
        success: false,
        message: "El nombre, precio y el ID de la categoría (category_id) son obligatorios",
        data: [],
        errors: [],
      });
    }

    const newProduct = await ProductModel.create({ name, category_id, price });
    res.status(201).json({
      success: true,
      message: "Producto creado correctamente",
      data: newProduct,
      errors: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno al crear el producto. Verifique que la categoría exista.",
      data: [],
      errors: [error.message],
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await ProductModel.update(Number(id), req.body);

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: `Producto con ID ${id} no encontrado`,
        data: [],
        errors: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Producto actualizado correctamente",
      data: updatedProduct,
      errors: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno al actualizar el producto",
      data: [],
      errors: [error.message],
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const isDeleted = await ProductModel.delete(Number(id));

    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: `No se pudo eliminar: Producto con ID ${id} no encontrado`,
        data: [],
        errors: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Producto eliminado correctamente",
      data: [],
      errors: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno al intentar eliminar el producto",
      data: [],
      errors: [error.message],
    });
  }
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};