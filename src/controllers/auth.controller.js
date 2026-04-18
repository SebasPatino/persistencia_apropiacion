import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.util.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

// ──────────────────────────────────────────────────────────
// POST /auth/register
// Crea un usuario con la contraseña encriptada
// ──────────────────────────────────────────────────────────
const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  // Verificar si el email ya existe
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    return errorResponse(res, "El email ya está registrado", 409);
  }

  // El modelo se encarga de encriptar la contraseña con bcrypt
  const user = await UserModel.create({ name, email, password });

  successResponse(res, "Usuario registrado correctamente", user, 201);
});

// ──────────────────────────────────────────────────────────
// POST /auth/login
// Valida credenciales y devuelve un JWT con expiración 1h
// ──────────────────────────────────────────────────────────
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // 1. Buscar usuario por email
  const user = await UserModel.findByEmail(email);
  if (!user) {
    return errorResponse(res, "Credenciales incorrectas", 401);
  }

  // 2. Comparar contraseña con el hash almacenado
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, "Credenciales incorrectas", 401);
  }

  // 3. Generar token JWT con expiración de 1 hora
  const token = jwt.sign(
    { id: user.id, email: user.email },   // payload
    process.env.JWT_SECRET,               // clave secreta (en .env)
    { expiresIn: "1h" }                  // expiración
  );

  successResponse(res, "Login exitoso", { token });
});

export { register, login };