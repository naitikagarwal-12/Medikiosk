"""
Bhashini voice routes — endpoints consumed by the MediKiosk React frontend.

All routes are prefixed /bhashini/ by the blueprint registration in app.py.
"""

from flask import Blueprint, jsonify, request

from bhashini.client import (
    BhashiniError,
    asr_translate,
    health_check,
    translate_and_tts,
    translate_text,
)
from bhashini.languages import SUPPORTED_LANGS

bp = Blueprint("bhashini", __name__, url_prefix="/bhashini")


def _error(message: str, status: int = 400) -> tuple:
    return jsonify({"success": False, "error": message}), status



@bp.route("/health", methods=["GET"])
def health():
    """Liveness + readiness probe for the Bhashini service."""
    result = health_check()
    return jsonify({
        "success": True,
        **result,
    })



@bp.route("/translate", methods=["POST"])
def translate():
    """
    Translate text from sourceLang to targetLang.

    Body  {text, sourceLang, targetLang}
    Response {success, translatedText}
    """
    body = request.get_json(silent=True) or {}
    text        = body.get("text", "")
    source_lang = body.get("sourceLang", "auto")
    target_lang = body.get("targetLang", "en")

    if not text:
        return _error("'text' is required")

    if target_lang not in SUPPORTED_LANGS and target_lang != "en":
        return _error(f"Unsupported target language: {target_lang}")

    try:
        translated = translate_text(text, source_lang, target_lang)
        return jsonify({
            "success":      True,
            "translatedText": translated,
        })
    except BhashiniError as exc:
        return _error(str(exc), 502)



@bp.route("/asr-translate", methods=["POST"])
def asr_translate_route():
    """
    Upstream: patient speaks in sourceLang → English text for Groq.

    Body  {audioBase64, sourceLang, targetLang?}
    Response {success, sourceText, englishText}
    """
    body = request.get_json(silent=True) or {}
    audio_base64  = body.get("audioBase64", "")
    source_lang   = body.get("sourceLang", "hi")
    target_lang   = body.get("targetLang", "en")

    if not audio_base64:
        return _error("'audioBase64' is required")

    if len(audio_base64) < 100:
        return _error("'audioBase64' appears to be too short to be valid audio data")

    try:
        result = asr_translate(audio_base64, source_lang)
        return jsonify({
            "success":     True,
            "sourceText":  result["sourceText"],
            "englishText": result["englishText"],
        })
    except BhashiniError as exc:
        return _error(str(exc), 502)



@bp.route("/translate-and-speak", methods=["POST"])
def translate_and_speak():
    """
    Downstream: English text from Groq → translated to targetLang → audio.

    Body  {text, targetLang}
    Response {success, translatedText, audioBase64, mimeType}
    """
    body       = request.get_json(silent=True) or {}
    text       = body.get("text", "")
    target_lang = body.get("targetLang", "hi")

    if not text:
        return _error("'text' is required")

    if target_lang not in SUPPORTED_LANGS:
        return _error(f"Unsupported target language: {target_lang}")

    try:
        result = translate_and_tts(text, target_lang)
        return jsonify({
            "success":       True,
            "translatedText": result["translatedText"],
            "audioBase64":   result["audioBase64"],
            "mimeType":      result["mimeType"],
        })
    except BhashiniError as exc:
        return _error(str(exc), 502)
