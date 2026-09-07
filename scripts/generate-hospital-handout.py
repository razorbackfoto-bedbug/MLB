#!/usr/bin/env python3
from pathlib import Path

from PIL import Image as PILImage, ImageDraw
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "hospital-handout.pdf"
URL = "https://mightylittlebookshelf.com/"

TEAL = HexColor("#17675F")
DEEP_TEAL = HexColor("#164E49")
CORAL = HexColor("#E96F46")
CREAM = HexColor("#FFF8ED")
INK = HexColor("#263B38")
MUTED = HexColor("#566966")
LINE = HexColor("#CFE3DE")

pdfmetrics.registerFont(TTFont("DejaVu", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))


def qr_image(url: str, size: float) -> Image:
    qr_path = ROOT / "tmp" / "pdfs" / "hospital-handout-qr.png"
    qr_path.parent.mkdir(parents=True, exist_ok=True)
    qr = QrCodeWidget(url).qr
    qr.make()
    border = 4
    scale = 12
    modules = qr.modules
    pixels = (len(modules) + border * 2) * scale
    bitmap = PILImage.new("RGB", (pixels, pixels), "white")
    draw = ImageDraw.Draw(bitmap)
    for row, values in enumerate(modules):
        for column, filled in enumerate(values):
            if filled:
                x = (column + border) * scale
                y = (row + border) * scale
                draw.rectangle((x, y, x + scale - 1, y + scale - 1), fill="black")
    bitmap.save(qr_path)
    return Image(str(qr_path), width=size, height=size)


styles = getSampleStyleSheet()
title = ParagraphStyle(
    "Title",
    parent=styles["Title"],
    fontName="DejaVu-Bold",
    fontSize=25,
    leading=29,
    textColor=DEEP_TEAL,
    alignment=TA_CENTER,
    spaceAfter=8,
)
subtitle = ParagraphStyle(
    "Subtitle",
    parent=styles["BodyText"],
    fontName="DejaVu",
    fontSize=11.5,
    leading=16,
    textColor=MUTED,
    alignment=TA_CENTER,
)
section = ParagraphStyle(
    "Section",
    parent=styles["Heading2"],
    fontName="DejaVu-Bold",
    fontSize=14,
    leading=17,
    textColor=DEEP_TEAL,
    spaceAfter=5,
)
body = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName="DejaVu",
    fontSize=10,
    leading=14,
    textColor=INK,
)
small = ParagraphStyle(
    "Small",
    parent=body,
    fontSize=8.5,
    leading=11,
    textColor=MUTED,
)
callout = ParagraphStyle(
    "Callout",
    parent=body,
    fontName="DejaVu-Bold",
    fontSize=11,
    leading=15,
    textColor=DEEP_TEAL,
)


def bullet(text: str) -> Paragraph:
    return Paragraph(f"<font color='#E96F46'>&#8226;</font>&nbsp;&nbsp;{text}", body)


doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=letter,
    rightMargin=0.55 * inch,
    leftMargin=0.55 * inch,
    topMargin=0.45 * inch,
    bottomMargin=0.4 * inch,
    title="Mighty Little Bookshelf Hospital Handout",
    author="Mighty Little Bookshelf",
)

story = [
    Paragraph("Mighty Little Bookshelf", title),
    Paragraph("Helping families find children's books for big medical experiences", subtitle),
    Spacer(1, 0.18 * inch),
]

intro = Table(
    [[
        Paragraph(
            "<b>A free, searchable book-finding resource</b><br/><br/>"
            "Mighty Little Bookshelf helps families and healthcare teams discover children's books about NICU stays, hospitalization, surgery, heart conditions, cancer, feeding tubes, respiratory support, grief, sibling experiences, and more.",
            body,
        ),
        qr_image(URL, 1.35 * inch),
    ]],
    colWidths=[5.55 * inch, 1.45 * inch],
)
intro.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), CREAM),
    ("BOX", (0, 0), (-1, -1), 1, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (0, 0), 16),
    ("RIGHTPADDING", (0, 0), (0, 0), 12),
    ("TOPPADDING", (0, 0), (-1, -1), 13),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 13),
    ("ALIGN", (1, 0), (1, 0), "CENTER"),
]))
story.extend([intro, Spacer(1, 0.2 * inch)])

left = [
    Paragraph("How healthcare teams can use it", section),
    bullet("At the bedside before a procedure, surgery, or unfamiliar hospital experience"),
    Spacer(1, 5),
    bullet("For sibling support during NICU stays and hospital admissions"),
    Spacer(1, 5),
    bullet("In discharge materials, patient portals, and family resource lists"),
    Spacer(1, 5),
    bullet("To build or refresh child life and hospital library collections"),
]
right = [
    Paragraph("Families can search by", section),
    bullet("Medical topic or diagnosis"),
    Spacer(1, 5),
    bullet("Age range and intended audience"),
    Spacer(1, 5),
    bullet("Book type and practical situation"),
    Spacer(1, 5),
    bullet("Title, author, or keyword"),
]

columns = Table([[left, right]], colWidths=[3.55 * inch, 3.45 * inch])
columns.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (0, 0), 0),
    ("RIGHTPADDING", (0, 0), (0, 0), 18),
    ("LEFTPADDING", (1, 0), (1, 0), 18),
    ("RIGHTPADDING", (1, 0), (1, 0), 0),
    ("LINEBEFORE", (1, 0), (1, 0), 1, LINE),
]))
story.extend([columns, Spacer(1, 0.22 * inch)])

share = KeepTogether([
    Paragraph("Share this resource with families", section),
    Paragraph(
        "Mighty Little Bookshelf is free to use and share. Add the website or QR code to family education materials, child life resources, hospital library guides, support-group materials, or discharge information.",
        body,
    ),
    Spacer(1, 8),
    Table(
        [[Paragraph("mightylittlebookshelf.com", callout)]],
        colWidths=[7 * inch],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), HexColor("#E8F4F1")),
            ("BOX", (0, 0), (-1, -1), 1, LINE),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ]),
    ),
])
story.extend([share, Spacer(1, 0.2 * inch)])

story.extend([
    Paragraph("About the project", section),
    Paragraph(
        "Mighty Little Bookshelf is curated by a registered nurse with NICU experience. Book guides are designed to make useful titles easier to discover, while recognizing that no single book is right for every child, family, or moment.",
        body,
    ),
    Spacer(1, 0.15 * inch),
    Paragraph(
        "Educational resource only. Mighty Little Bookshelf does not provide medical advice. Families should rely on their child's healthcare team for guidance specific to their child's care.",
        small,
    ),
    Spacer(1, 0.08 * inch),
    Paragraph("Contact: hello@mightylittlebookshelf.com", small),
])


def draw_page(canvas, _doc):
    canvas.saveState()
    canvas.setFillColor(TEAL)
    canvas.rect(0, 0, letter[0], 0.16 * inch, stroke=0, fill=1)
    canvas.setFillColor(CORAL)
    canvas.circle(letter[0] / 2, letter[1] - 0.27 * inch, 3.5, stroke=0, fill=1)
    canvas.restoreState()


OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.build(story, onFirstPage=draw_page)
print(OUTPUT)
