"""Branded HTML email templates — aligned with frontend/src/index.css and luxe primitives."""

from __future__ import annotations

import html
import re
from typing import Literal, Optional
from urllib.parse import urljoin

from core.config import settings

# Brand tokens — mirror frontend/src/index.css and tailwind.config.js.
BRAND = {
    "gold": "#C6862B",
    "blue": "#064F73",
    "green": "#0D572D",
    "ink": "#322D28",           # hsl(28 24% 16%)
    "cream": "#FDFBF8",         # hsl(40 33% 98%)
    "warm": "#FCFAF8",
    "ivory": "#F2EFE9",
    "beige": "#EAE5DB",
    "muted": "#F6F4F1",        # hsl(40 20% 96%)
    "muted_fg": "#5C6670",      # hsl(215 14% 42%)
    "ink_soft": "#8A8278",      # ~brand-ink/50 for labels
    "gold_soft": "rgba(198,134,43,0.5)",
    "white": "#FFFFFF",
    "radius": "2px",            # --radius: 0.125rem
}

# Font stacks — Google Fonts with email-safe fallbacks (see _font_block()).
FONT_BODY = "'Signika', Arial, Helvetica, sans-serif"
FONT_DISPLAY = "'Source Sans 3', 'Helvetica Neue', Arial, sans-serif"
FONT_LUX = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"

# Type scale — mirrors site rem sizes at 16px root.
TYPE = {
    "body": "19px",             # body 1.2rem
    "body_lh": "1.65",
    "small": "15px",            # ~0.95rem CTA / secondary copy
    "footer": "13px",           # ~0.85rem overline
    "eyebrow": "11.5px",        # lux-eyebrow 0.72rem
    "overline": "13.6px",       # overline 0.85rem
    "title_lux": "38px",        # lux-title ~text-4xl on content pages
    "title_display": "28px",    # Source Sans display / internal headings
}

SITE_NAME = "Grosvenor Vistas"
SITE_TAGLINE = "Elevated living in Grosvenor Heights"
SITE_ADDRESS = "3A Grosvenor Heights, Manor Park, Kingston 8, Jamaica"
SITE_PHONE = "+1 (876) 484-4244"
SITE_EMAIL = "info@grosvenorvistas.com"
PRIVACY_URL = "https://evo-home.ch/en/privacy"
LEGAL_URL = "https://evo-home.ch/en/legal"

EmailVariant = Literal["external", "internal"]

_GOOGLE_FONTS = (
    "https://fonts.googleapis.com/css2?"
    "family=Cormorant+Garamond:wght@300;400"
    "&family=Signika:wght@400;500;600"
    "&family=Source+Sans+3:wght@300;400;600"
    "&display=swap"
)


def _asset_url(filename: str) -> str:
    base = getattr(settings, "EMAIL_ASSET_BASE_URL", None) or settings.EMAIL_SITE_URL
    return urljoin(base.rstrip("/") + "/", f"email/{filename}")


def _esc(value) -> str:
    return html.escape("" if value is None else str(value))


def _font_block() -> str:
    return f"""
  <link href="{_GOOGLE_FONTS}" rel="stylesheet" />
  <style>
    body, table, td, p, a, li {{
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }}
  </style>"""


def render_body_paragraphs(*paragraphs: str) -> str:
    """Body copy — Signika 1.2rem / line-height 1.65 like the site."""
    return "".join(
        f"<p style='margin:0 0 18px;font-family:{FONT_BODY};font-size:{TYPE['body']};"
        f"line-height:{TYPE['body_lh']};color:{BRAND['ink']};font-weight:400;'>{_esc(p)}</p>"
        for p in paragraphs
    )


def _render_eyebrow(text: str, *, light: bool = False) -> str:
    """Matches components/shared/luxe.jsx Eyebrow — gold rule + lux-eyebrow label."""
    line_color = "rgba(255,255,255,0.5)" if light else BRAND["gold_soft"]
    text_color = "rgba(255,255,255,0.8)" if light else BRAND["gold"]
    return (
        f"<table role='presentation' cellpadding='0' cellspacing='0' style='margin:0 0 14px'>"
        f"<tr>"
        f"<td style='width:32px;vertical-align:middle;padding:0 12px 0 0'>"
        f"<div style='height:1px;line-height:1px;font-size:1px;background:{line_color}'>&nbsp;</div>"
        f"</td>"
        f"<td style='vertical-align:middle;padding:0;font-family:{FONT_BODY};"
        f"font-size:{TYPE['eyebrow']};font-weight:500;letter-spacing:0.28em;"
        f"text-transform:uppercase;color:{text_color};'>{_esc(text)}</td>"
        f"</tr></table>"
    )


def _render_title(text: str, *, variant: EmailVariant) -> str:
    if variant == "external":
        # lux-title on content pages — Cormorant, light, brand-blue
        return (
            f"<h1 style='margin:0 0 20px;font-family:{FONT_LUX};font-size:{TYPE['title_lux']};"
            f"font-weight:300;line-height:1.05;letter-spacing:0.005em;"
            f"color:{BRAND['blue']};'>{_esc(text)}</h1>"
        )
    # Internal — Source Sans 3 display weight
    return (
        f"<h1 style='margin:0 0 18px;font-family:{FONT_DISPLAY};font-size:{TYPE['title_display']};"
        f"font-weight:300;line-height:1.1;letter-spacing:-0.015em;"
        f"color:{BRAND['blue']};'>{_esc(text)}</h1>"
    )


def render_data_table(rows: list[tuple[str, str]]) -> str:
    """Key/value table — ivory/white rows, lux-eyebrow-style labels."""
    body_rows = []
    for idx, (label, value) in enumerate(rows):
        bg = BRAND["ivory"] if idx % 2 == 0 else BRAND["white"]
        body_rows.append(
            f"<tr style='background:{bg}'>"
            f"<td style='padding:14px 18px;width:38%;vertical-align:top;"
            f"border-bottom:1px solid {BRAND['beige']};font-family:{FONT_BODY};"
            f"font-size:{TYPE['eyebrow']};font-weight:500;letter-spacing:0.2em;"
            f"text-transform:uppercase;color:{BRAND['ink_soft']};'>{_esc(label)}</td>"
            f"<td style='padding:14px 18px;vertical-align:top;"
            f"border-bottom:1px solid {BRAND['beige']};font-family:{FONT_BODY};"
            f"font-size:{TYPE['small']};line-height:{TYPE['body_lh']};color:{BRAND['ink']};"
            f"white-space:pre-wrap;'>{_esc(value)}</td>"
            f"</tr>"
        )
    return (
        f"<table role='presentation' width='100%' cellpadding='0' cellspacing='0' "
        f"style='border-collapse:collapse;margin:24px 0 0;border:1px solid {BRAND['beige']};"
        f"border-radius:{BRAND['radius']};overflow:hidden'>"
        f"{''.join(body_rows)}</table>"
    )


def _render_cta(label: str, href: str, *, gold: bool = True) -> str:
    """Matches CtaButton — rounded-full pill, primary gold or secondary blue."""
    bg = BRAND["gold"] if gold else BRAND["blue"]
    return (
        f"<table role='presentation' cellpadding='0' cellspacing='0' style='margin:32px 0 8px'>"
        f"<tr><td align='left'>"
        f"<a href='{_esc(href)}' target='_blank' "
        f"style='display:inline-block;padding:14px 36px;font-family:{FONT_BODY};"
        f"font-size:{TYPE['small']};font-weight:500;letter-spacing:0.04em;"
        f"color:{BRAND['white']};text-decoration:none;background:{bg};"
        f"border-radius:9999px;mso-padding-alt:14px 36px;'>{_esc(label)}</a>"
        f"</td></tr></table>"
    )


def _render_footer(*, internal: bool) -> str:
    site_url = settings.EMAIL_SITE_URL.rstrip("/")
    link_style = (
        f"color:{BRAND['gold']};text-decoration:underline;text-underline-offset:2px;"
    )
    if internal:
        footer_note = "Internal notification — Grosvenor Vistas admin"
        links = (
            f"<a href='{_esc(site_url)}/admin/leads' style='{link_style}'>Open admin</a>"
        )
    else:
        footer_note = SITE_TAGLINE
        links = (
            f"<a href='{_esc(site_url)}' style='{link_style}'>grosvenorvistas.com</a>"
            f" <span style='color:{BRAND['beige']}'>·</span> "
            f"<a href='{_esc(PRIVACY_URL)}' style='{link_style}'>Privacy</a>"
            f" <span style='color:{BRAND['beige']}'>·</span> "
            f"<a href='{_esc(LEGAL_URL)}' style='{link_style}'>Legal</a>"
        )

    return (
        f"<tr><td style='padding:28px 36px 36px;background:{BRAND['warm']};"
        f"border-top:1px solid {BRAND['beige']}'>"
        f"<p style='margin:0 0 8px;font-family:{FONT_DISPLAY};font-size:{TYPE['footer']};"
        f"line-height:1.6;color:{BRAND['ink']};font-weight:600;letter-spacing:-0.01em;'>"
        f"{SITE_NAME}</p>"
        f"<p style='margin:0 0 14px;font-family:{FONT_BODY};font-size:{TYPE['footer']};"
        f"line-height:1.6;color:{BRAND['muted_fg']};'>{_esc(footer_note)}</p>"
        f"<p style='margin:0 0 8px;font-family:{FONT_BODY};font-size:{TYPE['footer']};"
        f"line-height:1.6;color:{BRAND['muted_fg']};'>{_esc(SITE_ADDRESS)}</p>"
        f"<p style='margin:0 0 14px;font-family:{FONT_BODY};font-size:{TYPE['footer']};"
        f"line-height:1.6;color:{BRAND['muted_fg']};'>{_esc(SITE_PHONE)} · "
        f"<a href='mailto:{_esc(SITE_EMAIL)}' style='{link_style}'>{_esc(SITE_EMAIL)}</a></p>"
        f"<p style='margin:0;font-family:{FONT_BODY};font-size:{TYPE['footer']};"
        f"line-height:1.6;color:{BRAND['muted_fg']};'>{links}</p>"
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
  <title>{_esc(title)}</title>{_font_block()}
</head>
<body style="margin:0;padding:0;background:{BRAND['warm']};font-family:{FONT_BODY};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    {_esc(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{BRAND['warm']};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="width:100%;max-width:600px;background:{BRAND['white']};
                      border:1px solid {BRAND['beige']};border-radius:{BRAND['radius']};overflow:hidden;">
          <tr>
            <td style="padding:0;line-height:0;background:{BRAND['blue']};">
              <img src="{_esc(header_image)}" width="600" height="{header_height}" alt="{_esc(SITE_NAME)}"
                   style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:36px 36px 12px;background:{BRAND['white']};">
              {_render_eyebrow(eyebrow)}
              {_render_title(title, variant=variant)}
              <div>{body_html}</div>
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
        f"<div style='margin:28px 0 0;padding:18px 20px;background:{BRAND['ivory']};"
        f"border-left:3px solid {BRAND['gold']};border-radius:{BRAND['radius']};'>"
        f"<p style='margin:0 0 8px;font-family:{FONT_BODY};font-size:{TYPE['eyebrow']};"
        f"font-weight:600;letter-spacing:0.14em;text-transform:uppercase;"
        f"color:{BRAND['gold']};'>Note from your advisor</p>"
        f"<p style='margin:0;font-family:{FONT_BODY};font-size:{TYPE['small']};"
        f"line-height:{TYPE['body_lh']};color:{BRAND['ink']};'>{_esc(note)}</p>"
        f"</div>"
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
