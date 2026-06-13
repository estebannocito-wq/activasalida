// Notificaciones por mail vía Resend (REST, sin SDK extra).
// Todo es fire-and-forget y a prueba de fallos: si falta RESEND_API_KEY o el
// envío falla, NUNCA lanza — la server action que la llama sigue normal.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FROM = "activasalida <hola@activasalida.com>";

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function send(to: string, subject: string, html: string) {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key || !to) return; // sin API key o sin destinatario: no-op
    await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
  } catch {
    // fire-and-forget: jamás rompe la acción
  }
}

function layout({
  titulo,
  cuerpo,
  ctaText,
  ctaHref,
}: {
  titulo: string;
  cuerpo: string;
  ctaText: string;
  ctaHref: string;
}) {
  // Estilos inline (los clientes de mail no soportan clases). Paleta de marca.
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#FFF7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7F4;padding:24px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(17,24,39,0.06);">
            <tr>
              <td style="background:#F4552E;padding:18px 24px;">
                <span style="color:#FFFFFF;font-size:18px;font-weight:700;letter-spacing:-0.02em;">activasalida</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 8px;">
                <h1 style="margin:0 0 12px;color:#1E2A78;font-size:22px;line-height:1.25;font-weight:700;">${titulo}</h1>
                <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">${cuerpo}</p>
                <a href="${ctaHref}" style="display:inline-block;background:#F4552E;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:13px 24px;border-radius:14px;">${ctaText}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.5;">Planes presenciales con gente que ya sabes quien es.<br/>Recibis este mail porque tenes una cuenta en activasalida.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function emailNuevaSolicitud(p: {
  to: string;
  solicitante: string;
  titulo: string;
  salidaId: string;
}) {
  await send(
    p.to,
    `Alguien quiere sumarse a "${p.titulo}"`,
    layout({
      titulo: "Nueva solicitud para tu actividad",
      cuerpo: `<strong>${esc(p.solicitante)}</strong> quiere sumarse a tu actividad <strong>"${esc(p.titulo)}"</strong>. Mira su presentacion y decidi si lo sumas al grupo.`,
      ctaText: "Ver solicitud",
      ctaHref: `${appUrl()}/salida/${p.salidaId}`,
    }),
  );
}

export async function emailSolicitudAceptada(p: {
  to: string;
  titulo: string;
  salidaId: string;
}) {
  await send(
    p.to,
    `¡Te aceptaron en "${p.titulo}"!`,
    layout({
      titulo: "¡Estas adentro! 🎉",
      cuerpo: `Te aceptaron en <strong>"${esc(p.titulo)}"</strong>. Coordina con el grupo por el chat y preparate para el plan.`,
      ctaText: "Ver la actividad",
      ctaHref: `${appUrl()}/salida/${p.salidaId}`,
    }),
  );
}

export async function emailSolicitudRechazada(p: {
  to: string;
  titulo: string;
}) {
  await send(
    p.to,
    `Sobre tu solicitud a "${p.titulo}"`,
    layout({
      titulo: "Esta vez no quedo lugar",
      cuerpo: `No quedo lugar en <strong>"${esc(p.titulo)}"</strong> esta vez. ¡No te desanimes! Hay un monton de actividades esperandote.`,
      ctaText: "Explorar actividades",
      ctaHref: `${appUrl()}/feed`,
    }),
  );
}

export async function emailSalidaFinalizada(p: {
  to: string;
  titulo: string;
  salidaId: string;
}) {
  await send(
    p.to,
    `Califica tu actividad "${p.titulo}"`,
    layout({
      titulo: "¿Como estuvo la actividad?",
      cuerpo: `Termino <strong>"${esc(p.titulo)}"</strong>. Deja tu calificacion y una referencia al grupo, asi todos salen mas tranquilos la proxima.`,
      ctaText: "Calificar la actividad",
      ctaHref: `${appUrl()}/salida/${p.salidaId}/calificar`,
    }),
  );
}

export async function emailSalidaCancelada(p: { to: string; titulo: string }) {
  await send(
    p.to,
    `Se cancelo "${p.titulo}"`,
    layout({
      titulo: "Se cancelo la actividad",
      cuerpo: `El organizador cancelo <strong>"${esc(p.titulo)}"</strong>. Disculpa las molestias. Busca otra actividad para sumarte.`,
      ctaText: "Ver otras actividades",
      ctaHref: `${appUrl()}/feed`,
    }),
  );
}

// Recordatorio automático 24hs antes de la salida (Vercel Cron).
// misAportes: lo que ESTE usuario reclamó llevar. cadaUno: aportes "cada uno
// trae lo suyo" (fallback si no reclamó nada). quorumNota: solo para el host.
export async function emailRecordatorio(p: {
  to: string;
  titulo: string;
  fechaTexto: string;
  punto: string | null;
  salidaId: string;
  misAportes: string[];
  cadaUno: string[];
  notaHost?: string | null;
}) {
  const lineas: string[] = [`📅 <strong>${esc(p.fechaTexto)}</strong>`];
  if (p.punto) lineas.push(`📍 ${esc(p.punto)}`);
  // notaHost ya viene formateada (emojis + <br/>) y con contenido controlado.
  if (p.notaHost) lineas.push(p.notaHost);
  if (p.misAportes.length) {
    lineas.push(`🎒 Llevás vos: <strong>${p.misAportes.map(esc).join(", ")}</strong>`);
  } else if (p.cadaUno.length) {
    lineas.push(
      `🎒 Acordate de llevar lo tuyo: ${p.cadaUno.map(esc).join(", ")}`,
    );
  }
  await send(
    p.to,
    `¡Mañana es la actividad! 🎉 ${p.titulo}`,
    layout({
      titulo: "¡Mañana es tu plan!",
      cuerpo: lineas.join("<br/><br/>"),
      ctaText: "Ver la actividad",
      ctaHref: `${appUrl()}/salida/${p.salidaId}`,
    }),
  );
}

// Avisa al host que un invitado aceptado se bajó de la salida.
export async function emailInvitadoSeBajo(p: {
  to: string;
  invitado: string;
  titulo: string;
  salidaId: string;
}) {
  await send(
    p.to,
    `${p.invitado} se bajo de "${p.titulo}"`,
    layout({
      titulo: "Alguien del grupo se bajo",
      cuerpo: `<strong>${esc(p.invitado)}</strong> ya no va a <strong>"${esc(p.titulo)}"</strong>. Se libero un lugar, asi que podes aceptar a alguien de la lista de espera.`,
      ctaText: "Ver la actividad",
      ctaHref: `${appUrl()}/salida/${p.salidaId}`,
    }),
  );
}
