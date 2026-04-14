import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.util.js";

// ──────────────────────────────────────────────────────────
// Middleware: verifyToken
//
// Protege las rutas exigiendo un JWT válido en el header:
//   Authorization: Bearer <token>
// ──────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  // 1. Leer el header de autorización
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Token no proporcionado", 401);
  }

  // 2. Extraer el token (quitar "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Adjuntar el usuario al request para usarlo en controladores
    req.user = decoded;

    next(); // Continuar a la ruta protegida
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "El token ha expirado", 401);
    }
    return errorResponse(res, "Token inválido", 401);
  }
};

export { verifyToken };