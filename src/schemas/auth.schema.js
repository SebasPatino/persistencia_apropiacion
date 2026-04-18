import { z } from "zod";

// Schema para POST /auth/register
export const registerSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es obligatorio",
      invalid_type_error: "El nombre debe ser texto",
    })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),

  email: z
    .string({
      required_error: "El email es obligatorio",
    })
    .email("El email no tiene un formato válido"),

  password: z
    .string({
      required_error: "La contraseña es obligatoria",
    })
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),
});

// Schema para POST /auth/login
export const loginSchema = z.object({
  email: z
    .string({
      required_error: "El email es obligatorio",
    })
    .email("El email no tiene un formato válido"),

  password: z
    .string({
      required_error: "La contraseña es obligatoria",
    })
    .min(1, "La contraseña es obligatoria"),
});