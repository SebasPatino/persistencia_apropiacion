import { Router } from "express";
import { authorizeRole } from "../middlewares/auth.middleware.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { validateSchema } from "../middlewares/validator.middleware.js";
import { productSchema, productUpdateSchema } from "../schemas/product.schema.js";

const productRouter = Router();

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);

// POST y PUT protegidos con validación Zod
productRouter.post("/", authorizeRole("admin"), validateSchema(productSchema), createProduct);
productRouter.put("/:id", authorizeRole("admin"), validateSchema(productUpdateSchema), updateProduct);

productRouter.delete("/:id", authorizeRole("admin"), deleteProduct);

export default productRouter;
