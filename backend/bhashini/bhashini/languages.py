"""
Language definitions for Bhashini ULCA.

Mirrors the languages declared in
src/screens/kiosk/LanguageSelection.tsx so the kiosk's language
selection screen and the Bhashini service agree on every code.
"""

from typing import Dict, List

LANG_CODE_MAP: Dict[str, str] = {
    "en": "en",
    "hi": "hi",
    "bn": "bn",
    "mr": "mr",
    "ta": "ta",
    "te": "te",
    "kn": "kn",
    "ml": "ml",
    "gu": "gu",
    "pa": "pa",
    "or": "or",
    "as": "as",
    "ur": "ur",
}

LANG_DISPLAY: Dict[str, str] = {
    "en": "English",
    "hi": "Hindi",
    "bn": "Bengali",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "or": "Odia",
    "as": "Assamese",
    "ur": "Urdu",
}

SUPPORTED_LANGS: List[str] = list(LANG_CODE_MAP.keys())


def bhashini_code(code: str) -> str:
    """Normalise any KioskContext code to the Bhashini ULCA form."""
    return LANG_CODE_MAP.get(code, code)
