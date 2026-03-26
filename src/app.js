import express from "express";
import "dotenv/config";
import productRouter from "./routes/product.routes.js";
import categoryRouter from "./routes/category.routes.js";

const app = express();

// Middleware para leer JSON en el body
app.use(express.json());

// Rutas
app.use("/products", productRouter);
app.use("/categories", categoryRouter);

export default app;