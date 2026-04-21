/**
 * product.routes.js
 *
 * Punto C — Reto 2 aplicado:
 * Cada ruta mutante usa checkPermission con un permiso atómico específico.
 *
 * Cadena de middlewares:
 *   verifyToken (app.js) → checkPermission('X') → validateSchema → controlador
 */

import { Router } from "express";
import { checkPermission } from "../middlewares/authorization.middleware.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { validateSchema } from "../middlewares/validator.middleware.js";
import {
  productSchema,
  productUpdateSchema,
} from "../schemas/product.schema.js";

const productRouter = Router();

// ── Rutas de LECTURA (cualquier usuario autenticado) ─────────────────────────
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);

// ── Rutas de ESCRITURA (solo quien tenga el permiso atómico exacto) ──────────
// checkPermission es un closure: recibe el permiso requerido y retorna el middleware
productRouter.post(
  "/",
  checkPermission("products.create"),   // 🛡️ solo admin tiene este permiso
  validateSchema(productSchema),
  createProduct
);

productRouter.put(
  "/:id",
  checkPermission("products.update"),   // 🛡️ solo admin tiene este permiso
  validateSchema(productUpdateSchema),
  updateProduct
);

productRouter.delete(
  "/:id",
  checkPermission("products.delete"),   // 🛡️ solo admin tiene este permiso
  deleteProduct
);

export default productRouter;