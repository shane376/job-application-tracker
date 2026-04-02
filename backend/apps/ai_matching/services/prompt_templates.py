MATCHING_PROMPT_TEMPLATE = """
You are a strict resume-job matching assistant.
Compare the following resume text with the job description.
Return ONLY valid JSON with this schema:
{
  "match_score": <integer 0-100>,
  "missing_skills": ["..."],
  "improvement_suggestions": ["..."]
}

Resume:
{resume_text}

Job Description:
{job_description}
""".strip()
