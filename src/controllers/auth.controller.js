import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.util.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

// POST /auth/register
const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await UserModel.findByEmail(email);
  if (existing) {
    return errorResponse(res, "El email ya está registrado", 409);
  }

  // role es opcional: si no se envía, user.model asigna 'user' por defecto
  const user = await UserModel.create({ name, email, password, role });
  successResponse(res, "Usuario registrado correctamente", user, 201);
});

// ─────────────────────────────────────────────────────────────
// POST /auth/login
//
// Punto C — "La Taquilla" (Reto 1):
//   La taquilla entrega la manilla (token) + un folleto con la
//   lista completa de permisos del usuario, para que sepa a qué
//   zonas puede ir SIN decodificar el JWT ni adivinar.
//
//   Los permisos NO se meten dentro del token (lo mantiene ligero).
//   Se consultan desde la BD y se devuelven como objeto anexo.
// ─────────────────────────────────────────────────────────────
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

  // 3. Generar Access Token (payload ligero, sin permisos adentro)
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 4. Generar Refresh Token
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // 5. Consultar permisos actualizados desde la BD ("El Radio de Seguridad")
  const userWithPermissions = await UserModel.findByIdWithPermissions(user.id);

  // 6. Construir el "folleto" de permisos para el cliente
  const rolesInfo = userWithPermissions
    ? {
        role:        userWithPermissions.roleInfo?.name || user.role,
        description: userWithPermissions.roleInfo?.description || "",
        permissions: userWithPermissions.permissions.map((p) => p.code),
      }
    : {
        role:        user.role,
        description: "",
        permissions: [],
      };

  // 7. Respuesta: manilla (token) + folleto (permisos)
  successResponse(res, "Login exitoso", {
    accessToken,
    refreshToken,
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      ...rolesInfo,
    },
  });
});

// POST /auth/refresh
const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, "Acceso denegado: Token requerido", 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    successResponse(res, "Token renovado correctamente", {
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Acceso denegado: El token ha expirado, inicie sesión nuevamente",
      });
    }
    return res.status(401).json({ error: "Acceso denegado: Token inválido" });
  }
});

// GET /auth/me — perfil completo con permisos actualizados desde la BD
const me = catchAsync(async (req, res) => {
  const userWithPermissions = await UserModel.findByIdWithPermissions(req.user.id);

  if (!userWithPermissions) {
    return errorResponse(res, "Usuario no encontrado", 404);
  }

  successResponse(res, "Perfil del usuario", {
    id:          userWithPermissions.id,
    name:        userWithPermissions.name,
    email:       userWithPermissions.email,
    role:        userWithPermissions.roleInfo?.name || userWithPermissions.role,
    description: userWithPermissions.roleInfo?.description || "",
    permissions: userWithPermissions.permissions.map((p) => p.code),
  });
});

// ─────────────────────────────────────────────────────────────
// GET /auth/users — solo ADMIN puede listar todos los usuarios
//
// Punto C — Transferencia del conocimiento:
//   Demuestra que el checkPermissionFromDB funciona en producción.
//   Usa la versión "Radio de Seguridad" (consulta BD en tiempo real)
//   porque es una ruta crítica de administración.
// ─────────────────────────────────────────────────────────────
const getUsers = catchAsync(async (req, res) => {
  const users = await UserModel.getAll();
  successResponse(res, "Lista de usuarios del sistema", users);
});

export { register, login, refresh, me, getUsers };