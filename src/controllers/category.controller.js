/**
 * category.controller.js — REFACTORIZADO
 *
 * Cambios aplicados (Punto C - Apropiación del conocimiento):
 * ✅ Se eliminaron TODOS los bloques try/catch (los maneja catchAsync + errorMiddleware)
 * ✅ Se reemplazaron todos los res.status().json() por successResponse / errorResponse
 * ✅ El controlador ahora solo contiene lógica de negocio (código limpio, principio DRY)
 */

import { CategoryModel } from "../models/category.model.js";
import { ProductModel } from "../models/product.model.js";
import { catchAsync } from "../utils/catchAsync.util.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

const getAllCategories = catchAsync(async (req, res) => {
  const categories = await CategoryModel.findAll();
  successResponse(res, "Lista de categorías", categories);
});

const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const category = await CategoryModel.findById(Number(id));

  if (!category) {
    return errorResponse(res, `Categoría con ID ${id} no encontrada`, 404);
  }

  successResponse(res, "Categoría encontrada correctamente", category);
});

const createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;

  const newCategory = await CategoryModel.create({ name });
  successResponse(res, "Categoría creada correctamente", newCategory, 201);
});

const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedCategory = await CategoryModel.update(Number(id), req.body);

  if (!updatedCategory) {
    return errorResponse(res, `Categoría con ID ${id} no encontrada`, 404);
  }

  successResponse(res, "Categoría actualizada correctamente", updatedCategory);
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  const categoryExists = await CategoryModel.findById(Number(id));
  if (!categoryExists) {
    return errorResponse(
      res,
      `No se pudo eliminar: Categoría con ID ${id} no encontrada`,
      404
    );
  }

  const linkedProducts = await ProductModel.findByCategoryId(Number(id));
  if (linkedProducts && linkedProducts.length > 0) {
    return errorResponse(
      res,
      "No se puede eliminar la categoría porque tiene al menos un recurso vinculado",
      409
    );
  }

  await CategoryModel.delete(Number(id));
  successResponse(res, "Categoría eliminada correctamente");
});

const getProductsByCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  const categoryExists = await CategoryModel.findById(Number(id));
  if (!categoryExists) {
    return errorResponse(res, `La categoría con ID ${id} no existe`, 404);
  }

  const products = await ProductModel.findByCategoryId(Number(id));
  successResponse(
    res,
    `Productos de la categoría: ${categoryExists.name}`,
    products
  );
});

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
};
