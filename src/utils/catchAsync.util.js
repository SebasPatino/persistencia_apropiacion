/**
 * catchAsync.util.js
 * Función envolvente (Wrapper) que elimina la necesidad de escribir
 * bloques try/catch en cada controlador asíncrono.
 *
 * Lógica: "Si tengo 10 funciones que siempre fallan de la misma manera,
 * creo una única puerta de entrada que vigile a las 10 al mismo tiempo."
 *
 * @param {Function} fn - Función de controlador asíncrona a envolver
 * @returns {Function}  - Nueva función que captura errores automáticamente
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { catchAsync };
