/**
 * category.routes.js
 *
 * Punto C — Reto 2 aplicado:
 * Igual que product.routes.js pero con permisos atómicos de categorías.
 *
 * Cadena de middlewares:
 *   verifyToken (app.js) → checkPermission('X') → validateSchema → controlador
 */

import { Router } from "express";
import { checkPermission } from "../middlewares/authorization.middleware.js";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
} from "../controllers/category.controller.js";

import { validateSchema } from "../middlewares/validator.middleware.js";
import {
  categorySchema,
  categoryUpdateSchema,
} from "../schemas/category.schema.js";

const categoryRouter = Router();

// ── Rutas de LECTURA (cualquier usuario autenticado) ─────────────────────────
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.get("/:id/products", getProductsByCategory);  // relacional

// ── Rutas de ESCRITURA (solo quien tenga el permiso atómico exacto) ──────────
categoryRouter.post(
  "/",
  checkPermission("categories.create"),   // 🛡️ solo admin
  validateSchema(categorySchema),
  createCategory
);

categoryRouter.put(
  "/:id",
  checkPermission("categories.update"),   // 🛡️ solo admin
  validateSchema(categoryUpdateSchema),
  updateCategory
);

categoryRouter.delete(
  "/:id",
  checkPermission("categories.delete"),   // 🛡️ solo admin
  deleteCategory
);

export default categoryRouter;