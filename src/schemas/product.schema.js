/**
 * product.schema.js
 * Esquema (molde) de validación Zod para el recurso Producto.
 *
 * Actividad 4 (Complemento) de la guía:
 * "Apliquen la mejora al recurso de productos: definan el schema y su implementación"
 */

import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string({
      required_error: "El nombre del producto es obligatorio",
      invalid_type_error: "El nombre debe ser una cadena de texto",
    })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres"),

  price: z
    .number({
      required_error: "El precio es obligatorio",
      invalid_type_error: "El precio debe ser un número",
    })
    .positive("El precio debe ser un número positivo mayor a 0"),

  category_id: z
    .number({
      required_error: "El ID de la categoría (category_id) es obligatorio",
      invalid_type_error: "El category_id debe ser un número entero",
    })
    .int("El category_id debe ser un número entero")
    .positive("El category_id debe ser un número positivo"),
});

export const productUpdateSchema = z.object({
  name: z
    .string({
      invalid_type_error: "El nombre debe ser una cadena de texto",
    })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres")
    .optional(),

  price: z
    .number({
      invalid_type_error: "El precio debe ser un número",
    })
    .positive("El precio debe ser un número positivo mayor a 0")
    .optional(),

  category_id: z
    .number({
      invalid_type_error: "El category_id debe ser un número entero",
    })
    .int("El category_id debe ser un número entero")
    .positive("El category_id debe ser un número positivo")
    .optional(),
});
