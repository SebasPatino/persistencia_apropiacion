/**
 * authorization.middleware.js
 *
 * "El Guardia de Puerta" — Punto C, Reto 2 (Guía SENA: Autorizaciones)
 *
 * RBAC con permisos atómicos. Se ejecuta DESPUÉS de verifyToken.
 * verifyToken  →  checkPermission('products.create')  →  controlador
 *
 * ¿Cómo funciona?
 *   verifyToken ya dejó el payload del JWT en req.user = { id, email, role }.
 *   checkPermission consulta la tabla PERMISSIONS_MAP para ver si ese rol
 *   tiene el permiso atómico requerido.
 *
 * Concepto clave — CLOSURE:
 *   checkPermission('products.create') NO es un middleware directamente.
 *   Es una función que RECIBE el permiso y RETORNA el middleware (req, res, next).
 *   Así el guardia "recuerda" qué permiso debe exigir en cada puerta.
 *
 *   router.post('/', checkPermission('products.create'), createProduct)
 *                    ↑ ejecuta la función externa   ↑ devuelve el middleware interno
 *
 * Relación M:N simplificada:
 *   En lugar de tablas pivote en BD (para no complicar la arquitectura base),
 *   el mapa de permisos vive aquí como configuración. Si mañana se agrega
 *   un rol nuevo, solo se edita PERMISSIONS_MAP.
 */

// ─────────────────────────────────────────────────────────────────────────────
// MAPA DE PERMISOS ATÓMICOS
// Estructura: { rol: [lista de permisos que posee ese rol] }
//
// Convención de nomenclatura:  recurso.accion
//   products.read      → listar y ver productos
//   products.create    → crear un producto
//   products.update    → editar un producto
//   products.delete    → eliminar un producto
//   categories.read    → listar y ver categorías
//   categories.create  → crear una categoría
//   categories.update  → editar una categoría
//   categories.delete  → eliminar una categoría
// ─────────────────────────────────────────────────────────────────────────────
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
    // El usuario normal solo puede consultar
    "products.read",
    "categories.read",
  ],
};

/**
 * checkPermission  — El Guardia de Puerta (Middleware Dinámico)
 *
 * @param {string} requiredPermission  Permiso atómico exigido (ej: 'products.create')
 * @returns {Function}  Middleware de Express  (req, res, next)
 *
 * Flujo interno:
 *  1. Lee req.user.role  (colocado por verifyToken)
 *  2. Busca en PERMISSIONS_MAP los permisos de ese rol
 *  3. Usa .some() para verificar si AL MENOS UNO coincide con el requerido
 *     → Lógica de los "Múltiples Sombreros": basta con que un rol lo tenga
 *  4. Si no tiene permiso → 403 Forbidden
 *  5. Si tiene permiso    → next() (pasa al controlador)
 */
const checkPermission = (requiredPermission) => {
  // ← función EXTERNA: recibe el permiso, se ejecuta al registrar la ruta
  return (req, res, next) => {
    // ← función INTERNA (closure): se ejecuta en cada petición HTTP

    // 1. Leer el rol del usuario desde el token ya validado
    const userRole = req.user?.role;

    // 2. Si por alguna razón no hay rol en el token, denegar acceso
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado: No se pudo determinar el rol del usuario",
        data: [],
        errors: [],
      });
    }

    // 3. Obtener la lista de permisos del rol del usuario
    //    Si el rol no existe en el mapa, userPermissions será un array vacío []
    const userPermissions = PERMISSIONS_MAP[userRole] ?? [];

    // 4. .some() → retorna true si AL MENOS UN elemento cumple la condición
    //    Aquí es donde se resuelve el problema de los "Múltiples Sombreros":
    //    si Carlos tiene rol Periodista (sin acceso VIP) Y Patrocinador (con VIP),
    //    .some() encontrará el permiso en alguno de los dos y lo dejará pasar.
    const hasPermission = userPermissions.some(
      (permission) => permission === requiredPermission
    );

    // 5. Si no tiene el permiso → 403 Forbidden (estandarizado)
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado: No tienes el permiso '${requiredPermission}' para realizar esta acción`,
        data: [],
        errors: [],
      });
    }

    // 6. ✅ Tiene el permiso → continuar hacia el controlador
    next();
  };
};

export { checkPermission, PERMISSIONS_MAP };