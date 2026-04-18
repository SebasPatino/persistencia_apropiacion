import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const authRouter = Router();

// POST /auth/register → crea usuario (contraseña encriptada con bcrypt)
authRouter.post("/register", register);

// POST /auth/login → devuelve JWT si las credenciales son correctas
authRouter.post("/login", login);

export default authRouter;