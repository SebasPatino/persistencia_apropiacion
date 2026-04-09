/**
 * product.controller.js — REFACTORIZADO
 *
 * Cambios aplicados (Punto C - Apropiación del conocimiento):
 * ✅ Se eliminaron TODOS los bloques try/catch (los maneja catchAsync + errorMiddleware)
 * ✅ Se reemplazaron todos los res.status().json() por successResponse / errorResponse
 * ✅ El controlador ahora solo contiene lógica de negocio (código limpio, principio DRY)
 */

import { ProductModel } from "../models/product.model.js";
import { catchAsync } from "../utils/catchAsync.util.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

const getAllProducts = catchAsync(async (req, res) => {
  const products = await ProductModel.findAll();
  successResponse(res, "Lista de productos", products);
});

const getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await ProductModel.findById(Number(id));

  if (!product) {
    return errorResponse(res, `Producto con ID ${id} no encontrado`, 404);
  }

  successResponse(res, "Producto encontrado correctamente", product);
});

const createProduct = catchAsync(async (req, res) => {
  const { name, category_id, price } = req.body;

  if (!name || !category_id || !price) {
    return errorResponse(
      res,
      "El nombre, precio y el ID de la categoría (category_id) son obligatorios",
      400
    );
  }

  const newProduct = await ProductModel.create({ name, category_id, price });
  successResponse(res, "Producto creado correctamente", newProduct, 201);
});

const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedProduct = await ProductModel.update(Number(id), req.body);

  if (!updatedProduct) {
    return errorResponse(res, `Producto con ID ${id} no encontrado`, 404);
  }

  successResponse(res, "Producto actualizado correctamente", updatedProduct);
});

const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const isDeleted = await ProductModel.delete(Number(id));

  if (!isDeleted) {
    return errorResponse(
      res,
      `No se pudo eliminar: Producto con ID ${id} no encontrado`,
      404
    );
  }

  successResponse(res, "Producto eliminado correctamente");
});

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
