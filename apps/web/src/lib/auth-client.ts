"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Cliente de autenticación para componentes de React.
 * Reutiliza la URL pública de la aplicación para hablar con `/api/auth`.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
