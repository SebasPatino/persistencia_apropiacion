import { Router } from "express";
import { register, login, refresh, me } from "../controllers/auth.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const authRouter = Router();

// POST /auth/register → crea usuario
authRouter.post("/register", validateSchema(registerSchema), register);

// POST /auth/login → token + folleto de permisos
authRouter.post("/login", validateSchema(loginSchema), login);

// POST /auth/refresh → nuevo accessToken
authRouter.post("/refresh", refresh);

// GET /auth/me → perfil con permisos actualizados desde la BD
authRouter.get("/me", verifyToken, me);

export default authRouter;