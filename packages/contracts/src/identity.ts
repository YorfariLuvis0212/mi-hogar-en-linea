import { z } from "zod";

import { ROLES } from "./roles";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre es demasiado corto").max(80),
  email: z.email("Correo electrónico inválido"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{7,20}$/, "Teléfono inválido")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72),
});

export const loginSchema = z.object({
  email: z.email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{7,20}$/)
    .optional()
    .or(z.literal("")),
});

export const setRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLES),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SetRoleInput = z.infer<typeof setRoleSchema>;
