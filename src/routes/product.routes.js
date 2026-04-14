import { Router } from "express";
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
productRouter.post("/", validateSchema(productSchema), createProduct);
productRouter.put("/:id", validateSchema(productUpdateSchema), updateProduct);

productRouter.delete("/:id", deleteProduct);

export default productRouter;
