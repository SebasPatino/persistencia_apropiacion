import jwt from "jsonwebtoken";

// ──────────────────────────────────────────────────────────
// Middleware: verifyToken
//
// Protege las rutas exigiendo un JWT válido en el header:
//   Authorization: Bearer <token>
//
// Mensajes de error en español según la guía SENA:
//   - Sin token   → 401 { "error": "Acceso denegado: Token requerido" }
//   - Expirado    → 401 { "error": "Acceso denegado: El token ha expirado, inicie sesión nuevamente" }
//   - Inválido    → 401 { "error": "Acceso denegado: Token inválido" }
// ──────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  // 1. Leer el header de autorización
  const authHeader = req.headers["authorization"];

  // 2. Si no hay header o no empieza con "Bearer " → token requerido
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Acceso denegado: Token requerido" });
  }

  // 3. Extraer el token (quitar "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // 4. Verificar y decodificar el token con la clave secreta del .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Adjuntar el payload del usuario al request para usarlo en controladores
    req.user = decoded;

    next(); // ✅ Token válido → continuar a la ruta protegida
  } catch (error) {
    // 6. Distinguir entre token expirado y token falsificado/inválido
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
};

// ──────────────────────────────────────────────────────────
// Middleware: authorizeRole
//
// Uso: authorizeRole("admin")  o  authorizeRole("admin", "user")
// Se coloca DESPUÉS de verifyToken en la ruta.
// Verifica que el rol del usuario esté entre los permitidos.
// ──────────────────────────────────────────────────────────
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Acceso denegado: No tienes permisos para realizar esta acción",
      });
    }
    next();
  };
};

export { verifyToken, authorizeRole };