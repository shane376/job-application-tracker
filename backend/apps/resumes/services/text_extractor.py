from pypdf import PdfReader


def extract_text_from_pdf(file_obj) -> str:
    """Extract text from a PDF file object with a safe fallback."""
    try:
        reader = PdfReader(file_obj)
        chunks = []
        for page in reader.pages:
            chunks.append(page.extract_text() or "")
        return "\n".join(chunks).strip()
    except Exception:
        return ""
