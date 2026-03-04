/* eslint-disable */
/**
 * baseTemplate.js — Layout HTML base para todos los emails de onboarding WALA
 *
 * Mobile-first, con logo oficial, estética coherente con la app (ResumenDay, cards).
 * Sin imágenes pesadas — solo logo + texto + emojis + CTA.
 */

const COLORS = {
  primary: '#EF4444',   // red-500
  primaryDark: '#DC2626',   // red-600
  primaryLight: '#FEF2F2',   // red-50
  accent: '#F97316',   // orange-500 (fire warmth)
  text: '#111827',   // gray-900
  textMid: '#374151',   // gray-700
  textLight: '#6B7280',   // gray-500
  textXLight: '#9CA3AF',   // gray-400
  bg: '#FFFFFF',
  bgLight: '#F9FAFB',   // gray-50
  bgMid: '#F3F4F6',   // gray-100
  border: '#E5E7EB',   // gray-200
  borderLight: '#F3F4F6',   // gray-100
  green: '#22C55E',   // green-500
  greenLight: '#F0FDF4',   // green-50
};

const LOGO_URL = 'https://wala.lat/assets/logoWala2-ChD7YyoF.png';
const APP_URL = 'https://wala.lat';

/**
 * Bloque de tarjeta de métrica (streak, dato clave)
 * Equivalente visual al card de ResumenDay.vue
 */
function metricCard({ emoji, label, value, bg = COLORS.primaryLight, color = COLORS.primary }) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
           style="margin: 0 0 20px 0; background-color: ${bg}; border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          <div style="font-size: 44px; line-height: 1; margin-bottom: 10px;">${emoji}</div>
          <div style="font-size: 13px; color: ${COLORS.textLight}; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px;">${label}</div>
          <div style="font-size: 22px; font-weight: 700; color: ${color};">${value}</div>
        </td>
      </tr>
    </table>`;
}

/**
 * Bloque callout (destacado con borde lateral)
 * Equivalente a los callouts de accent en la app
 */
function callout({ text, color = COLORS.primary, bg = COLORS.primaryLight }) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
           style="margin: 0 0 20px 0;">
      <tr>
        <td style="padding: 14px 16px; background-color: ${bg}; border-radius: 8px;
                   border-left: 4px solid ${color}; font-size: 14px; color: ${COLORS.textMid}; line-height: 1.6;">
          ${text}
        </td>
      </tr>
    </table>`;
}

/**
 * Genera el HTML base con el contenido del email
 *
 * @param {Object} params
 * @param {string} params.preheader - Texto de preview (no visible en el email)
 * @param {string} params.body     - HTML del contenido principal
 * @param {string} params.ctaText  - Texto del botón CTA
 * @param {string} params.ctaUrl   - URL del botón CTA
 * @param {string} params.footer   - Texto adicional en el footer (opcional)
 * @returns {string} HTML completo del email
 */
function baseTemplate({ preheader = '', body, ctaText, ctaUrl, footer = '' }) {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>WALA</title>
  <!--[if mso]>
  <style>
    table { border-collapse: collapse; }
    td, p, a, span { font-family: Arial, sans-serif; }
  </style>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${COLORS.bgLight}; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    .cta-button:hover { background-color: ${COLORS.primaryDark} !important; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .content-cell    { padding: 28px 20px 12px 20px !important; }
      .cta-cell        { padding: 8px 20px 28px 20px !important; }
      .footer-cell     { padding: 20px 20px !important; }
      .cta-button      { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${COLORS.bgLight};
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${COLORS.bgLight};mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

  <!-- Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
         style="background-color:${COLORS.bgLight};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Card container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="520"
               class="email-container"
               style="max-width:520px; width:100%; background-color:${COLORS.bg};
                      border-radius:16px; overflow:hidden;
                      box-shadow:0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04);
                      border:1px solid ${COLORS.borderLight};">

          <!-- ─── Barra accent superior ─────────────────────── -->
          <tr>
            <td style="background-color:${COLORS.primary}; height:4px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- ─── Header con logo ───────────────────────────── -->
          <tr>
            <td style="padding:22px 32px 20px 32px; border-bottom:1px solid ${COLORS.borderLight};">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="middle">
                    <img src="${LOGO_URL}" alt="WALA"
                         width="90" height="auto"
                         style="max-width:90px; height:auto;">
                  </td>
                  <td align="right" valign="middle"
                      style="font-size:11px; color:${COLORS.textXLight}; letter-spacing:0.5px; white-space:nowrap;">
                    Tu copiloto de negocio
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── Contenido ─────────────────────────────────── -->
          <tr>
            <td class="content-cell"
                style="padding:32px 32px 16px 32px; color:${COLORS.textMid}; font-size:15px; line-height:1.75;">
              ${body}
            </td>
          </tr>

          <!-- ─── CTA ──────────────────────────────────────── -->
          ${ctaText && ctaUrl ? `
          <tr>
            <td class="cta-cell" style="padding:8px 32px 32px 32px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; max-width:340px;">
                <tr>
                  <td align="center" style="border-radius:10px; background-color:${COLORS.primary};
                                            box-shadow:0 2px 8px rgba(239,68,68,0.30);">
                    <a href="${ctaUrl}" target="_blank" class="cta-button"
                       style="display:block; padding:15px 32px; color:#FFFFFF;
                              font-size:15px; font-weight:700; text-decoration:none;
                              border-radius:10px; background-color:${COLORS.primary};
                              letter-spacing:0.3px;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- ─── Divisor ───────────────────────────────────── -->
          <tr>
            <td style="padding:0 32px;">
              <div style="border-top:1px solid ${COLORS.border};"></div>
            </td>
          </tr>

          <!-- ─── Footer ────────────────────────────────────── -->
          <tr>
            <td class="footer-cell"
                style="padding:20px 32px 24px 32px; color:${COLORS.textLight}; font-size:12px; line-height:1.7;">
              ${footer ? `<p style="margin:0 0 10px 0; color:${COLORS.textXLight};">${footer}</p>` : ''}
              <p style="margin:0;">
                Enviado por <strong style="color:${COLORS.textMid};">WALA</strong>
                &mdash;
                <a href="${APP_URL}" style="color:${COLORS.primary}; text-decoration:none; font-weight:600;">wala.lat</a>
              </p>
              <p style="margin:8px 0 0 0;">
                <a href="${APP_URL}/unsubscribe"
                   style="color:${COLORS.textXLight}; font-size:11px; text-decoration:underline;">
                  Dejar de recibir estos correos
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

module.exports = { baseTemplate, metricCard, callout, COLORS, LOGO_URL, APP_URL };
