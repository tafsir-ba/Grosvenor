"""Branded HTML email templates — mirrors the Grosvenor Vistas site palette."""

from __future__ import annotations

import html
import re
from typing import Literal, Optional
from urllib.parse import urljoin

from core.config import settings

# Single source of truth for email brand tokens (aligned with frontend/src/index.css).
BRAND = {
    "blue": "#064F73",
    "gold": "#C6862B",
    "ink": "#2F2924",
    "warm": "#FCFAF8",
    "ivory": "#F2EFE9",
    "beige": "#EAE5DB",
    "muted": "#6B7280",
    "white": "#FFFFFF",
}

SITE_NAME = "Grosvenor Vistas"
SITE_TAGLINE = "Elevated living in Grosvenor Heights"
SITE_ADDRESS = "3A Grosvenor Heights, Manor Park, Kingston 8, Jamaica"
SITE_PHONE = "+1 (876) 484-4244"
SITE_EMAIL = "info@grosvenorvistas.com"
PRIVACY_URL = "https://evo-home.ch/en/privacy"
LEGAL_URL = "https://evo-home.ch/en/legal"

EmailVariant = Literal["external", "internal"]


def _asset_url(filename: str) -> str:
    base = getattr(settings, "EMAIL_ASSET_BASE_URL", None) or settings.EMAIL_SITE_URL
    return urljoin(base.rstrip("/") + "/", f"email/{filename}")


def _esc(value) -> str:
    return html.escape("" if value is None else str(value))


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def render_data_table(rows: list[tuple[str, str]]) -> str:
    """Render a branded key/value table for lead or residence details."""
    body_rows = []
    for idx, (label, value) in enumerate(rows):
        bg = BRAND["ivory"] if idx % 2 == 0 else BRAND["white"]
        body_rows.append(
            f"<tr style='background:{bg}'>"
            f"<td style='padding:12px 16px;width:38%;font-family:Arial,Helvetica,sans-serif;"
            f"font-size:14px;line-height:1.5;color:{BRAND['muted']};vertical-align:top;"
            f"border-bottom:1px solid {BRAND['beige']}'>{_esc(label)}</td>"
            f"<td style='padding:12px 16px;font-family:Arial,Helvetica,sans-serif;"
            f"font-size:14px;line-height:1.5;color:{BRAND['ink']};vertical-align:top;"
            f"border-bottom:1px solid {BRAND['beige']};white-space:pre-wrap'>{_esc(value)}</td>"
            f"</tr>"
        )
    return (
        f"<table role='presentation' width='100%' cellpadding='0' cellspacing='0' "
        f"style='border-collapse:collapse;margin:20px 0 0;border:1px solid {BRAND['beige']};"
        f"border-radius:2px;overflow:hidden'>"
        f"{''.join(body_rows)}</table>"
    )


def _render_cta(label: str, href: str, *, gold: bool = True) -> str:
    bg = BRAND["gold"] if gold else BRAND["blue"]
    return (
        f"<table role='presentation' cellpadding='0' cellspacing='0' style='margin:28px 0 4px'>"
        f"<tr><td align='center' style='border-radius:2px;background:{bg}'>"
        f"<a href='{_esc(href)}' target='_blank' style='display:inline-block;padding:14px 28px;"
        f"font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;"
        f"color:{BRAND['white']};text-decoration:none;border-radius:2px'>{_esc(label)}</a>"
        f"</td></tr></table>"
    )


def _render_footer(*, internal: bool) -> str:
    site_url = settings.EMAIL_SITE_URL.rstrip("/")
    if internal:
        footer_note = "Internal notification — Grosvenor Vistas admin"
        links = (
            f"<a href='{_esc(site_url)}/admin/leads' style='color:{BRAND['blue']};text-decoration:none'>"
            f"Open admin</a>"
        )
    else:
        footer_note = SITE_TAGLINE
        links = (
            f"<a href='{_esc(site_url)}' style='color:{BRAND['blue']};text-decoration:none'>"
            f"grosvenorvistas.com</a>"
            f" &nbsp;·&nbsp; "
            f"<a href='{_esc(PRIVACY_URL)}' style='color:{BRAND['blue']};text-decoration:none'>"
            f"Privacy</a>"
            f" &nbsp;·&nbsp; "
            f"<a href='{_esc(LEGAL_URL)}' style='color:{BRAND['blue']};text-decoration:none'>"
            f"Legal</a>"
        )

    return (
        f"<tr><td style='padding:24px 32px 32px;background:{BRAND['warm']};"
        f"border-top:1px solid {BRAND['beige']}'>"
        f"<p style='margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;"
        f"line-height:1.6;color:{BRAND['ink']};font-weight:600'>{SITE_NAME}</p>"
        f"<p style='margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;"
        f"line-height:1.6;color:{BRAND['muted']}'>{_esc(footer_note)}</p>"
        f"<p style='margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;"
        f"line-height:1.6;color:{BRAND['muted']}'>{_esc(SITE_ADDRESS)}</p>"
        f"<p style='margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;"
        f"line-height:1.6;color:{BRAND['muted']}'>{_esc(SITE_PHONE)} · "
        f"<a href='mailto:{_esc(SITE_EMAIL)}' style='color:{BRAND['blue']};text-decoration:none'>"
        f"{_esc(SITE_EMAIL)}</a></p>"
        f"<p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;"
        f"line-height:1.6;color:{BRAND['muted']}'>{links}</p>"
        f"</td></tr>"
    )


def render_email(
    *,
    variant: EmailVariant,
    preheader: str,
    eyebrow: str,
    title: str,
    body_html: str,
    table_rows: Optional[list[tuple[str, str]]] = None,
    cta_label: Optional[str] = None,
    cta_href: Optional[str] = None,
    cta_gold: bool = True,
    note_html: Optional[str] = None,
) -> str:
    """Render a complete branded HTML email."""
    internal = variant == "internal"
    header_image = _asset_url("brand-header.png") if internal else _asset_url("brand-hero-external.png")
    header_height = "120" if internal else "140"

    table_block = render_data_table(table_rows) if table_rows else ""
    cta_block = _render_cta(cta_label, cta_href, gold=cta_gold) if cta_label and cta_href else ""
    note_block = note_html or ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>{_esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:{BRAND['warm']};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    {_esc(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{BRAND['warm']};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="width:100%;max-width:600px;background:{BRAND['white']};
                      border:1px solid {BRAND['beige']};border-radius:2px;overflow:hidden;">
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="{_esc(header_image)}" width="600" height="{header_height}" alt="{_esc(SITE_NAME)}"
                   style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;background:{BRAND['white']};">
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;
                        letter-spacing:0.22em;text-transform:uppercase;color:{BRAND['gold']};
                        font-weight:600;">{_esc(eyebrow)}</p>
              <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:30px;
                         line-height:1.15;font-weight:400;color:{BRAND['blue']};">{_esc(title)}</h1>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;
                          color:{BRAND['ink']};">{body_html}</div>
              {table_block}
              {note_block}
              {cta_block}
            </td>
          </tr>
          {_render_footer(internal=internal)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def render_note_box(note: str) -> str:
    return (
        f"<p style='margin:24px 0 0;padding:16px;background:{BRAND['ivory']};"
        f"border-left:4px solid {BRAND['gold']};"
        f"font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;"
        f"color:{BRAND['ink']};'>"
        f"<strong>Note from your advisor</strong><br>"
        f"{_esc(note)}</p>"
    )


def render_plain_text(
    *,
    title: str,
    paragraphs: list[str],
    table_rows: Optional[list[tuple[str, str]]] = None,
    cta_label: Optional[str] = None,
    cta_href: Optional[str] = None,
    footer_note: Optional[str] = None,
) -> str:
    lines = [SITE_NAME, "", title, ""]
    lines.extend(paragraphs)
    if table_rows:
        lines.append("")
        for label, value in table_rows:
            lines.append(f"{label}: {value}")
    if cta_label and cta_href:
        lines.extend(["", f"{cta_label}: {cta_href}"])
    lines.extend([
        "",
        footer_note or SITE_TAGLINE,
        SITE_ADDRESS,
        f"{SITE_PHONE} · {SITE_EMAIL}",
    ])
    return "\n".join(lines)
