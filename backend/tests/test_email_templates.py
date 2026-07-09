"""Tests for branded email HTML templates."""
from services import email_templates


def test_external_email_includes_brand_assets_and_cta():
    html = email_templates.render_email(
        variant="external",
        preheader="Preview line",
        eyebrow="Thank you",
        title="Thank you, Jane",
        body_html="<p>Body copy</p>",
        cta_label="Explore residences",
        cta_href="https://grosvenorvistas.com/residences",
    )
    assert "brand-hero-external.png" in html
    assert "#064F73" in html
    assert "#C6862B" in html
    assert "Cormorant+Garamond" in html or "Cormorant Garamond" in html
    assert "Signika" in html
    assert "letter-spacing:0.28em" in html
    assert "border-radius:9999px" in html
    assert "Explore residences" in html
    assert "Thank you, Jane" in html


def test_internal_email_uses_compact_header_and_admin_cta():
    html = email_templates.render_email(
        variant="internal",
        preheader="New lead",
        eyebrow="New lead",
        title="Contact Form",
        body_html="<p>Lead captured</p>",
        table_rows=[("Email", "jane@example.com")],
        cta_label="View in admin",
        cta_href="https://grosvenorvistas.com/admin/leads",
        cta_gold=False,
    )
    assert "brand-header.png" in html
    assert "Source+Sans+3" in html or "Source Sans 3" in html
    assert "border-radius:9999px" in html
    assert "/admin/leads" in html
    assert "Internal notification" in html
    assert "jane@example.com" in html


def test_plain_text_includes_title_and_table():
    text = email_templates.render_plain_text(
        title="Thank you",
        paragraphs=["We received your enquiry."],
        table_rows=[("Email", "jane@example.com")],
    )
    assert "Thank you" in text
    assert "jane@example.com" in text
    assert "Grosvenor Vistas" in text
