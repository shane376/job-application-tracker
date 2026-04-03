import json
from unittest.mock import patch

from django.test import SimpleTestCase

from apps.ai_matching.services.matching_service import AiMatchingError, analyze_resume_match


class _MockHttpResponse:
    def __init__(self, payload):
        self._payload = payload

    def read(self):
        return json.dumps(self._payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return False


class AnalyzeResumeMatchTests(SimpleTestCase):
    @patch.dict("os.environ", {"OPENAI_API_KEY": "test-key", "OPENAI_MODEL": "gpt-4o-mini"}, clear=True)
    @patch("apps.ai_matching.services.matching_service.request.urlopen")
    def test_coerces_string_float_score_and_list_values(self, urlopen_mock):
        urlopen_mock.return_value = _MockHttpResponse(
            {
                "choices": [
                    {
                        "message": {
                            "content": json.dumps(
                                {
                                    "match_score": "85.9",
                                    "missing_skills": "Kubernetes",
                                    "improvement_suggestions": None,
                                }
                            )
                        }
                    }
                ]
            }
        )

        result = analyze_resume_match("Python Django", "Python Kubernetes")

        self.assertEqual(result["match_score"], 85)
        self.assertEqual(result["missing_skills"], ["Kubernetes"])
        self.assertEqual(result["improvement_suggestions"], [])

    @patch.dict("os.environ", {"OPENAI_API_KEY": "test-key", "OPENAI_MODEL": "gpt-4o-mini"}, clear=True)
    @patch("apps.ai_matching.services.matching_service.request.urlopen")
    def test_raises_ai_matching_error_for_non_json_content(self, urlopen_mock):
        urlopen_mock.return_value = _MockHttpResponse(
            {
                "choices": [
                    {
                        "message": {
                            "content": "not-json",
                        }
                    }
                ]
            }
        )

        with self.assertRaisesMessage(AiMatchingError, "AI response was not valid JSON."):
            analyze_resume_match("Python Django", "Python Kubernetes")
