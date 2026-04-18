import { Router } from "express";
import { authorizeRole } from "../middlewares/auth.middleware.js";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory, // Controlador especial para la relación
} from "../controllers/category.controller.js";

import { validateSchema } from "../middlewares/validator.middleware.js";
import { categorySchema, categoryUpdateSchema } from "../schemas/category.schema.js";

const categoryRouter = Router();

categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.post("/", authorizeRole("admin"), validateSchema(categorySchema), createCategory);
categoryRouter.put("/:id", authorizeRole("admin"), validateSchema(categoryUpdateSchema), updateCategory);
categoryRouter.delete("/:id", authorizeRole("admin"), deleteCategory);

// Ruta Relacional: Obtener productos por categoría
// Sigue el estándar REST: /recurso-padre/:id/recurso-hijo
categoryRouter.get("/:id/products", getProductsByCategory);

export default categoryRouter;
