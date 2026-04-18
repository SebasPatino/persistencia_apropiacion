import { Router } from "express";
import { register, login, refresh } from "../controllers/auth.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";

const authRouter = Router();

// POST /auth/register → crea usuario (contraseña encriptada con bcrypt)
authRouter.post("/register", validateSchema(registerSchema), register);

// POST /auth/login → devuelve accessToken (1h) + refreshToken (7d)
authRouter.post("/login", validateSchema(loginSchema), login);

// POST /auth/refresh → emite nuevo accessToken usando el refreshToken
authRouter.post("/refresh", refresh);

export default authRouter;