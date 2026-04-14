/**
 * error.middleware.js
 * Middleware GLOBAL de manejo de errores para Express.
 *
 * Se registra al FINAL de todas las rutas en app.js.
 * Captura cualquier error que se propague vía next(error) desde
 * los controladores (gracias a catchAsync) o desde validateSchema (Zod).
 *
 * Express reconoce un middleware de error porque tiene 4 parámetros: (err, req, res, next)
 */
const errorMiddleware = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  // Si el error viene de validateSchema (Zod), expone los errores por campo.
  // Si no, muestra el mensaje genérico del error.
  const errors =
    err.errors && err.errors.length > 0 ? err.errors : [err.message];

  return res.status(statusCode).json({
    success: false,
    message,
    data: [],
    errors,
  });
};

export { errorMiddleware };
