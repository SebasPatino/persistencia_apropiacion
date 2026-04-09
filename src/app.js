import express from "express";
import "dotenv/config";
import productRouter from "./routes/product.routes.js";
import categoryRouter from "./routes/category.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Middleware para leer JSON en el body
app.use(express.json());

// Rutas
app.use("/products", productRouter);
app.use("/categories", categoryRouter);

// ⚠️ El middleware de errores SIEMPRE va al final, después de todas las rutas
// Express lo reconoce por sus 4 parámetros (err, req, res, next)
app.use(errorMiddleware);

export default app;
