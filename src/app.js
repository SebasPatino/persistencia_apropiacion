import express from "express";
import "dotenv/config";
import productRouter from "./routes/product.routes.js";
import categoryRouter from "./routes/category.routes.js";
import authRouter from "./routes/auth.routes.js";           // 🆕 Rutas de auth
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { verifyToken } from "./middlewares/auth.middleware.js"; // 🆕 Middleware JWT

const app = express();

// Middleware para leer JSON en el body
app.use(express.json());

// ── Rutas públicas (no requieren token) ──────────────────
app.use("/auth", authRouter);

// ── Rutas protegidas (requieren JWT válido) ───────────────
// Usamos verifyToken como middleware antes del router
app.use("/products", verifyToken, productRouter);

// /categories sigue siendo público (puedes protegerlo también con verifyToken)
app.use("/categories", verifyToken, categoryRouter);

// ⚠️ El middleware de errores SIEMPRE va al final
app.use(errorMiddleware);

export default app;