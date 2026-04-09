/**
 * error.middleware.js
 * Middleware GLOBAL de manejo de errores para Express.
 *
 * Este archivo se registra al FINAL de todas las rutas en app.js.
 * Captura cualquier error que se propague vía next(error) desde
 * los controladores (gracias a catchAsync), evitando que el servidor
 * quede sin respuesta ante un fallo inesperado.
 *
 * Express reconoce un middleware de error porque tiene 4 parámetros: (err, req, res, next)
 */
const errorMiddleware = (err, req, res, next) => {
  // Mostramos el error en consola para depuración del desarrollador
  console.error(`[ERROR] ${err.message}`);

  // Determinamos el statusCode: si el error lo trae, lo usamos; si no, 500
  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  return res.status(statusCode).json({
    success: false,
    message,
    data: [],
    errors: [err.message],
  });
};

export { errorMiddleware };
