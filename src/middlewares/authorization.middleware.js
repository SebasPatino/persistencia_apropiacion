/**
 * authorization.middleware.js
 *
 * "El Guardia de Puerta" — Punto C, Reto 2
 *
 * Ofrece DOS versiones del guardia:
 *   - checkPermission:       mapa estático (rápido)
 *   - checkPermissionFromDB: consulta BD en tiempo real (seguro)
 */

import { UserModel } from "../models/user.model.js";

// ─────────────────────────────────────────────────────────────
// MAPA DE PERMISOS ATÓMICOS (configuración estática)
// ─────────────────────────────────────────────────────────────
const PERMISSIONS_MAP = {
  admin: [
    "products.read",
    "products.create",
    "products.update",
    "products.delete",
    "categories.read",
    "categories.create",
    "categories.update",
    "categories.delete",
  ],
  user: [
    "products.read",
    "categories.read",
  ],
};

// ─────────────────────────────────────────────────────────────
// checkPermission — Versión A: Mapa Estático
//
// CLOSURE: recibe el permiso requerido y retorna el middleware.
// El guardia "recuerda" qué permiso exigir en cada puerta.
//
// .some() resuelve la "Situación 2 — Múltiples Sombreros":
//   basta con que AL MENOS UN rol tenga el permiso para pasar.
// ─────────────────────────────────────────────────────────────
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado: No se pudo determinar el rol del usuario",
        data: [],
        errors: [],
      });
    }

    const userPermissions = PERMISSIONS_MAP[userRole] ?? [];

    const hasPermission = userPermissions.some(
      (permission) => permission === requiredPermission
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado: No tienes el permiso '${requiredPermission}' para realizar esta acción`,
        data: [],
        errors: [],
      });
    }

    next();
  };
};

// ─────────────────────────────────────────────────────────────
// checkPermissionFromDB — Versión B: Consulta en Tiempo Real
//
// "El Radio de Seguridad" (Situación 1 de la guía):
//   El guardia consulta la central de datos en cada petición.
//   Si un admin revoca permisos, el efecto es INMEDIATO.
//
// Más costosa (1 query por petición), úsala en rutas críticas.
// ─────────────────────────────────────────────────────────────
const checkPermissionFromDB = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(403).json({
          success: false,
          message: "Acceso denegado: No se pudo identificar al usuario",
          data: [],
          errors: [],
        });
      }

      // Consulta real a la BD: trae los permisos actuales del usuario
      const userProfile = await UserModel.findByIdWithPermissions(userId);

      if (!userProfile) {
        return res.status(403).json({
          success: false,
          message: "Acceso denegado: Usuario no encontrado",
          data: [],
          errors: [],
        });
      }

      const permissionCodes = userProfile.permissions.map((p) => p.code);

      // .some() — Múltiples Sombreros: basta un permiso que coincida
      const hasPermission = permissionCodes.some(
        (code) => code === requiredPermission
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado: No tienes el permiso '${requiredPermission}' para realizar esta acción`,
          data: [],
          errors: [],
        });
      }

      // Enriquecer req.user con los permisos actualizados
      req.user.permissions = permissionCodes;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export { checkPermission, checkPermissionFromDB, PERMISSIONS_MAP };