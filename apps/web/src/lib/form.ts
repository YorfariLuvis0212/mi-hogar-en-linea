/** Estado compartido para formularios gestionados con `useActionState`. */
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialFormState: FormState = { status: "idle" };

/** Convierte los issues de Zod en un mapa de errores por campo. */
export function toFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    const bucket = result[key] ?? (result[key] = []);
    bucket.push(issue.message);
  }
  return result;
}
