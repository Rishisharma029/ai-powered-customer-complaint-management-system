import json
import logging
import os
import re
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("pharma_qms_llm")

def call_groq_llm(prompt: str, system_prompt: str = "") -> Optional[str]:
    """
    Invokes Groq LLM (gemma2-9b-it / llama-3.3-70b-versatile) via official Groq SDK or httpx.
    """
    api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        logger.warning("GROQ_API_KEY is missing. Using domain-specific AI logic fallback.")
        return None

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt or "You are an expert QMS Pharma AI assistant specializing in API & FDF customer complaints, root cause analysis (5-Whys, Ishikawa), and CAPA planning."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error calling Groq API ({settings.GROQ_MODEL}): {e}")
        return None

def extract_json_from_llm_response(text: str) -> Dict[str, Any]:
    """Helper to parse JSON string safely from LLM text."""
    if not text:
        return {}
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try regex extract json block
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
    return {}
