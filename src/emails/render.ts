import { siteConfig } from "@/config/site";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderParagraphs(paragraphs: string[]) {
  return paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.7;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");
}

export function renderEmailLayout(input: {
  preheader: string;
  title: string;
  intro: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryNote?: string;
}) {
  const ctaHtml =
    input.ctaLabel && input.ctaUrl
      ? `<div style="margin:28px 0 8px;"><a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;background:#0f3528;color:#ffffff;padding:14px 20px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">${escapeHtml(input.ctaLabel)}</a></div>`
      : "";
  const secondaryNoteHtml = input.secondaryNote
    ? `<p style="margin:20px 0 0;color:#6b7280;font-size:13px;line-height:1.7;">${escapeHtml(input.secondaryNote)}</p>`
    : "";

  return `
    <html lang="es">
      <body style="margin:0;padding:0;background:#f3f5f4;font-family:Arial,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f3f5f4;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:28px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px;background:#0f3528;color:#ffffff;">
                    <p style="margin:0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.72;">${escapeHtml(siteConfig.shortName)}</p>
                    <h1 style="margin:14px 0 0;font-size:34px;line-height:1.05;text-transform:uppercase;">${escapeHtml(input.title)}</h1>
                    <p style="margin:16px 0 0;color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;">${escapeHtml(input.intro)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    ${input.body}
                    ${ctaHtml}
                    ${secondaryNoteHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.7;">
                    ${escapeHtml(siteConfig.name)} · ${escapeHtml(siteConfig.supportEmail)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function renderOrderItems(orderItems: Array<{ name: string; quantity: number; lineTotal: number }>) {
  return `
    <div style="margin:20px 0 0;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">
      ${orderItems
        .map(
          (item) => `
            <div style="display:flex;justify-content:space-between;gap:16px;padding:14px 16px;border-bottom:1px solid #e5e7eb;">
              <div>
                <p style="margin:0;color:#111827;font-size:14px;font-weight:700;">${escapeHtml(item.name)}</p>
                <p style="margin:6px 0 0;color:#6b7280;font-size:13px;">Cantidad ${item.quantity}</p>
              </div>
              <p style="margin:0;color:#111827;font-size:14px;font-weight:700;">ARS ${item.lineTotal.toLocaleString("es-AR")}</p>
            </div>`,
        )
        .join("")}
    </div>
  `;
}
