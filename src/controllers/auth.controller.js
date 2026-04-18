import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.util.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

// ──────────────────────────────────────────────────────────
// POST /auth/register
// Crea un usuario con la contraseña encriptada con bcrypt
// El modelo se encarga del hashing (Principio SRP)
// ──────────────────────────────────────────────────────────
const register = catchAsync(async (req, res) => {
  // Mensaje de bienvenida personalizado según el rol
  const mensaje =
    user.role === "admin"
      ? `¡Bienvenido administrador ${user.name}! Tienes acceso total al sistema.`
      : `¡Bienvenido ${user.name}! Puedes consultar productos y categorías.`;

  successResponse(res, mensaje, { accessToken, refreshToken, role: user.role });

  // Verificar si el email ya existe en la BD
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    return errorResponse(res, "El email ya está registrado", 409);
  }

  // El modelo encripta la contraseña antes de guardarla (nunca texto plano)
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
    // Mensaje genérico para no revelar si el email existe o no
    return errorResponse(res, "Credenciales incorrectas", 401);
  }

  // 2. Comparar la contraseña plana con el hash almacenado en BD
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, "Credenciales incorrectas", 401);
  }

  // 3. Generar token JWT (Access Token) con expiración corta: 1 hora
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },  // payload con rol (datos que viajan en el token)
    process.env.JWT_SECRET,              // clave secreta definida en .env
    { expiresIn: "1h" }                 // ⏰ Expiración: 1 hora
  );

  // 4. Generar Refresh Token de larga duración: 7 días
  const refreshToken = jwt.sign(
    { id: user.id },                     // payload mínimo para refresh
    process.env.JWT_REFRESH_SECRET,      // clave DIFERENTE para refresh (en .env)
    { expiresIn: "7d" }                 // ⏰ Expiración: 7 días
  );

  successResponse(res, "Login exitoso", { accessToken, refreshToken });
});

// ──────────────────────────────────────────────────────────
// POST /auth/refresh
// Emite un nuevo accessToken usando el refreshToken válido
// Sin obligar al usuario a iniciar sesión de nuevo
// ──────────────────────────────────────────────────────────
const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  // 1. Verificar que se envió el refreshToken
  if (!refreshToken) {
    return errorResponse(res, "Acceso denegado: Token requerido", 401);
  }

  try {
    // 2. Verificar el refreshToken con su clave secreta propia
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 3. Buscar el usuario para asegurarse que aún existe
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    // 4. Emitir un nuevo accessToken fresco
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    successResponse(res, "Token renovado correctamente", {
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error:
          "Acceso denegado: El token ha expirado, inicie sesión nuevamente",
      });
    }
    return res
      .status(401)
      .json({ error: "Acceso denegado: Token inválido" });
  }
});

export { register, login, refresh };