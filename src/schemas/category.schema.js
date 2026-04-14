import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({
      required_error: "El nombre de la categoría es obligatorio",
      invalid_type_error: "El nombre debe ser una cadena de texto",
    })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
});

// Schema para actualización parcial (PUT) — todos los campos opcionales
export const categoryUpdateSchema = z.object({
  name: z
    .string({
      invalid_type_error: "El nombre debe ser una cadena de texto",
    })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres")
    .optional(),
});
