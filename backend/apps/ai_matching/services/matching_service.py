import json
import os
from urllib import request

from apps.ai_matching.services.prompt_templates import MATCHING_PROMPT_TEMPLATE


class AiMatchingError(Exception):
    pass


def _coerce_match_score(value) -> int:
    if value is None:
        return 0

    if isinstance(value, bool):
        return 0

    if isinstance(value, (int, float)):
        return int(value)

    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return 0
        try:
            return int(float(stripped))
        except ValueError:
            return 0

    return 0


def _coerce_list(value) -> list:
    if isinstance(value, list):
        return value
    if value is None:
        return []
    return [str(value)]


def _fallback_match(resume_text: str, job_description: str) -> dict:
    resume_tokens = {token.lower() for token in resume_text.split()}
    jd_tokens = {token.lower() for token in job_description.split()}
    overlap = len(resume_tokens.intersection(jd_tokens))
    score = min(95, max(5, overlap // 3))

    return {
        "match_score": score,
        "missing_skills": ["AI analysis unavailable - fallback estimate used"],
        "improvement_suggestions": [
            "Add quantified achievements related to this role",
            "Align keyword coverage with the job description",
        ],
    }


def analyze_resume_match(resume_text: str, job_description: str) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if not api_key:
        return _fallback_match(resume_text, job_description)

    prompt = MATCHING_PROMPT_TEMPLATE.format(
        resume_text=resume_text[:12000],
        job_description=job_description[:12000],
    )

    payload = {
        "model": model,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": "Return only strict JSON."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }

    req = request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=45) as response:
            body = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise AiMatchingError("Failed to call AI provider.") from exc

    try:
        content = body["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        return {
            "match_score": _coerce_match_score(parsed.get("match_score", 0)),
            "missing_skills": _coerce_list(parsed.get("missing_skills", [])),
            "improvement_suggestions": _coerce_list(parsed.get("improvement_suggestions", [])),
            "raw_response": parsed,
        }
    except Exception as exc:
        raise AiMatchingError("AI response was not valid JSON.") from exc
