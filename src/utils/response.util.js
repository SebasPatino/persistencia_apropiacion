/**
 * response.util.js
 * Utilidades para estandarizar las respuestas de la API.
 * Principio DRY: en lugar de repetir res.status().json() en cada controlador,
 * centralizamos el "contrato de respuesta" en estas dos funciones.
 */

/**
 * Envía una respuesta de ÉXITO estandarizada.
 * @param {object} res   - Objeto de respuesta de Express
 * @param {string} message - Mensaje descriptivo para el cliente
 * @param {any}    data    - Datos a devolver (objeto, array, etc.)
 * @param {number} statusCode - Código HTTP (por defecto 200)
 */
const successResponse = (res, message, data = [], statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: [],
  });
};

/**
 * Envía una respuesta de ERROR estandarizada.
 * @param {object} res   - Objeto de respuesta de Express
 * @param {string} message - Mensaje descriptivo del error
 * @param {number} statusCode - Código HTTP (por defecto 500)
 * @param {Array}  errors  - Lista de detalles del error (opcional)
 */
const errorResponse = (res, message, statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: [],
    errors,
  });
};

export { successResponse, errorResponse };
