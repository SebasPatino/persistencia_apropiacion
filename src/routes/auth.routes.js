import { Router } from "express";
import { register, login, refresh, me, getUsers } from "../controllers/auth.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkPermissionFromDB } from "../middlewares/authorization.middleware.js";

const authRouter = Router();

// POST /auth/register → crea usuario
authRouter.post("/register", validateSchema(registerSchema), register);

// POST /auth/login → token + folleto de permisos
authRouter.post("/login", validateSchema(loginSchema), login);

// POST /auth/refresh → nuevo accessToken
authRouter.post("/refresh", refresh);

// GET /auth/me → perfil con permisos actualizados desde la BD
authRouter.get("/me", verifyToken, me);

// ─────────────────────────────────────────────────────────────
// GET /auth/users — ruta crítica: solo admin puede listar usuarios
//
// Usa checkPermissionFromDB ("El Radio de Seguridad"):
//   Consulta la BD en cada petición para verificar el permiso.
//   Si un admin revoca acceso a otro, el efecto es INMEDIATO.
//   Sin cache ni depender del token (que podría estar desactualizado).
// ─────────────────────────────────────────────────────────────
authRouter.get(
  "/users",
  verifyToken,
  checkPermissionFromDB("users.read"),
  getUsers
);

export default authRouter;