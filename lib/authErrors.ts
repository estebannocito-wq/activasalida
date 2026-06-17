// Traduce los mensajes crudos (en inglés) de Supabase Auth a español.
// Mapea los casos comunes; para el resto devuelve un genérico en español.
// Usar SOLO sobre el error que viene de Supabase, no sobre mensajes que ya
// armamos nosotros en español.

const REGLAS: Array<{ test: RegExp; mensaje: string }> = [
  {
    test: /invalid login credentials/i,
    mensaje: "Email o contraseña incorrectos.",
  },
  {
    test: /email not confirmed/i,
    mensaje: "Tenés que confirmar tu email antes de entrar. Revisá tu casilla.",
  },
  {
    test: /user already registered|already been registered|already exists/i,
    mensaje: "Ese email ya tiene una cuenta. Probá iniciar sesión.",
  },
  {
    test: /for security purposes, you can only request this after/i,
    mensaje: "Esperá unos segundos antes de volver a intentar.",
  },
  {
    test: /rate limit|too many requests/i,
    mensaje: "Demasiados intentos. Probá de nuevo en un rato.",
  },
  {
    test: /new password should be different/i,
    mensaje: "La nueva contraseña tiene que ser distinta a la anterior.",
  },
  {
    test: /password should be at least|password.*at least.*characters|weak password|password is too weak/i,
    mensaje: "La contraseña tiene que tener al menos 6 caracteres.",
  },
  {
    test: /unable to validate email address|invalid format|invalid email/i,
    mensaje: "El email no tiene un formato válido.",
  },
  {
    test: /signups? not allowed|signup is disabled/i,
    mensaje: "Los registros están deshabilitados por ahora.",
  },
  {
    test: /(email link is invalid|token has expired|expired|invalid token|otp)/i,
    mensaje: "El link venció o ya se usó. Pedí uno nuevo.",
  },
  {
    test: /user not found/i,
    mensaje: "No encontramos una cuenta con ese email.",
  },
];

export function mapAuthError(message?: string | null): string {
  const m = (message ?? "").trim();
  if (!m) return "Algo salió mal. Probá de nuevo en un momento.";
  for (const regla of REGLAS) {
    if (regla.test.test(m)) return regla.mensaje;
  }
  return "Algo salió mal. Probá de nuevo en un momento.";
}
