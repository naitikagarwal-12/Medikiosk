"""
Bhashini ULCA client for MediKiosk — v2 with Groq translation fallback.

Two-step Bhashini protocol (ULCA v1)
------------------------------------
Step A — config  (getModelsPipeline)
    POST https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline
    Headers  : userID, ulcaApiKey
    Body     : {"pipelineTasks": [...], "pipelineRequestConfig": {"pipelineId": "..."}}
    Returns  : list of {taskType, serviceId, ...} + a callbackUrl for inference

Step B — compute (inference)
    POST <callbackUrl>          (from Step A)
    Header  : Authorization: Bearer <inferenceApiKey>
    Body    : {"pipelineTasks": [...], "inputData": {...}}
    Returns  : transcribed text / translated text / audio bytes

Pipeline caching
---------------
getModelsPipeline is called once per (taskType, sourceLang, targetLang) combo
and the result (serviceIds + callbackUrl) is kept in a TTL dictionary for
BHASHINI_PIPELINE_CACHE_TTL seconds so we don't re-authenticate on every request.

Groq fallback for translation
-----------------------------
If the Bhashini ULCA v1 API is unreachable or the pipelineId is not
configured for this account, the translate_text() function falls back to
Groq's llama-3.1-8b-instant model, which handles Indic→English and
English→Indic translation reliably.  The Groq key is read from the same
.env variables as the existing sign-language avatar in the React frontend.
"""

from __future__ import annotations

import json
import logging
import os
import threading
import time
from typing import Any, Dict, List, Optional, Tuple

import requests

from .languages import bhashini_code

log = logging.getLogger(__name__)


def _api_key_user_id()  -> str: return os.getenv("BHASHINI_API_KEY",         "")
def _udyat_key()         -> str: return os.getenv("BHASHINI_UDYAT_KEY",        "")
def _inference_key()      -> str: return os.getenv("BHASHINI_INFERENCE_KEY",    "")
def _pipeline_cache_ttl() -> int: return int(os.getenv("BHASHINI_PIPELINE_CACHE_TTL", "3600"))

_ULCA_CONFIG_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"

def _inference_base_url() -> str:
    return os.getenv("BHASHINI_INFERENCE_URL",
                      "https://dhruva-api.bhashini.gov.in/services/inference/pipeline")

_PIPELINE_IDS: Dict[str, str] = {
    "asr":         "64392f96daac500b55c543cd",
    "translation":  "643781c5e4c8e81a80c5afac",
    "tts":         "643781c5e4c8e81a80c5afac",
}

def _groq_api_key()  -> str: return os.getenv("GROQ_API_KEY", "")
_GROQ_ENDPOINT  = "https://api.groq.com/openai/v1/chat/completions"
_GROQ_MODEL      = "llama-3.1-8b-instant"



class PipelineCache:
    def __init__(self, ttl_s: int = None):
        self._ttl_s = ttl_s if ttl_s is not None else _pipeline_cache_ttl()
        self._lock  = threading.Lock()
        self._cache: Dict[str, _CacheEntry] = {}

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            entry = self._cache.get(key)
            if entry and entry.expires_at > time.time():
                return entry.data
            return None

    def set(self, key: str, data: Dict[str, Any]) -> None:
        with self._lock:
            self._cache[key] = _CacheEntry(data, time.time() + self._ttl_s)

    def stats(self) -> Dict[str, int]:
        with self._lock:
            now = time.time()
            return {
                "total":   len(self._cache),
                "valid":   sum(1 for e in self._cache.values() if e.expires_at > now),
                "expired": sum(1 for e in self._cache.values() if e.expires_at <= now),
            }


class _CacheEntry:
    __slots__ = ("data", "expires_at")
    def __init__(self, data: Dict[str, Any], expires_at: float):
        self.data       = data
        self.expires_at = expires_at


_pipeline_cache = PipelineCache()



class BhashiniError(Exception):
    """Raised when the Bhasini ULCA API returns an error or times out."""
    pass


def _ulca_headers() -> Dict[str, str]:
    user_id = _api_key_user_id()
    udyat   = _udyat_key()
    if not user_id or not udyat:
        raise BhashiniError(
            "BHASHINI_API_KEY (user-id) and BHASHINI_UDYAT_KEY must be set. "
            "Check your .env file."
        )
    return {
        "userID":     user_id,
        "ulcaApiKey": udyat,
        "Content-Type": "application/json",
    }


def _inference_headers() -> Dict[str, str]:
    inf_key = _inference_key()
    if not inf_key:
        raise BhashiniError(
            "BHASHINI_INFERENCE_KEY must be set. Check your .env file."
        )
    return {
        "Authorization": f"Bearer {inf_key}",
        "Content-Type":  "application/json",
    }


def _cache_key(task_type: str, source_lang: str, target_lang: Optional[str]) -> str:
    return f"{task_type}:{source_lang}:{target_lang or ''}"


def _get_pipeline_config(
    task_type: str,
    source_lang: str,
    target_lang: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Step A — call getModelsPipeline.
    Results are cached for BHASHINI_PIPELINE_CACHE_TTL seconds.
    Returns the full JSON body of the getModelsPipeline response.
    """
    cache_key = _cache_key(task_type, source_lang, target_lang)
    if cached := _pipeline_cache.get(cache_key):
        log.debug("Pipeline config cache HIT: %s", cache_key)
        return cached

    log.debug("Pipeline config cache MISS: %s", cache_key)

    sl = bhashini_code(source_lang)
    task_config: Dict[str, Any] = {"taskType": task_type}
    if target_lang:
        task_config["config"] = {
            "language": {
                "sourceLanguage": sl,
                "targetLanguage": bhashini_code(target_lang),
            }
        }
    else:
        task_config["config"] = {"language": {"sourceLanguage": sl}}

    pipeline_id = _PIPELINE_IDS.get(task_type, "")

    payload = {
        "pipelineTasks": [task_config],
        "pipelineRequestConfig": {"pipelineId": pipeline_id},
    }

    try:
        resp = requests.post(
            _ULCA_CONFIG_URL,
            headers=_ulca_headers(),
            json=payload,
            timeout=15,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise BhashiniError(f"getModelsPipeline request failed: {exc}") from exc

    data = resp.json()
    if isinstance(data, dict) and data.get("status") == "error":
        raise BhashiniError(f"getModelsPipeline error: {data.get('message', data)}")

    _pipeline_cache.set(cache_key, data)
    return data


def _resolve_service_id(
    config_data: Dict[str, Any],
    task_type: str,
) -> Tuple[str, str]:
    """Pull serviceId and callbackUrl from a getModelsPipeline response."""
    configs = (
        config_data.get("pipelineResponseConfig", [])
        or config_data.get("data", [])
    )
    for entry in configs:
        if entry.get("taskType") == task_type:
            service_id   = entry.get("config", {}).get("serviceId") or ""
            callback_url = (
                config_data.get("callbackUrl") or _inference_base_url()
            )
            return service_id, callback_url

    for entry in configs:
        if task_type in entry.get("taskType", ""):
            service_id   = entry.get("config", {}).get("serviceId") or ""
            callback_url = config_data.get("callbackUrl") or _inference_base_url()
            return service_id, callback_url

    return "", config_data.get("callbackUrl") or _inference_base_url()


def _compute(
    task_type: str,
    source_lang: str,
    target_lang: Optional[str],
    input_data: Dict[str, Any],
    use_cache: bool = True,
) -> Dict[str, Any]:
    """
    Step B — call the Bhasini inference endpoint.
    If use_cache=True, fetches the pipeline config first and injects the resolved serviceId.
    """
    if use_cache:
        cfg = _get_pipeline_config(task_type, source_lang, target_lang)
        service_id, callback_url = _resolve_service_id(cfg, task_type)

        sl = bhashini_code(source_lang)
        task: Dict[str, Any] = {
            "taskType": task_type,
            "config": {
                "language": {"sourceLanguage": sl},
                "serviceId": service_id,
            },
        }
        if target_lang:
            task["config"]["language"]["targetLanguage"] = bhashini_code(target_lang)
        if task_type == "asr":
            task["config"].setdefault("audioFormat", "wav")
            task["config"].setdefault("samplingRate", 16000)
        if task_type == "tts":
            task["config"].setdefault("gender", "female")

        payload = {"pipelineTasks": [task], "inputData": input_data}
    else:
        callback_url = _inference_base_url()
        payload = input_data

    try:
        resp = requests.post(
            callback_url,
            headers=_inference_headers(),
            json=payload,
            timeout=30,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise BhashiniError(f"Bhasini inference request failed: {exc}") from exc

    return resp.json()



def _translate_via_groq(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text using Groq's llama-3.1-8b-instant model.
    Used when the Bhashini ULCA v1 API is unreachable or the pipelineId is
    not configured for this account.
    """
    lang_map = {
        "en": "English", "hi": "Hindi",  "bn": "Bengali",
        "mr": "Marathi", "ta": "Tamil",   "te": "Telugu",
        "kn": "Kannada", "ml": "Malayalam", "gu": "Gujarati", "pa": "Punjabi",
    }
    src = lang_map.get(source_lang, source_lang.title())
    tgt = lang_map.get(target_lang, target_lang.title())

    system_prompt = (
        f"You are a medical translation assistant. Translate the following text from {src} to {tgt} accurately and literally. "
        "Return only the translated text — no explanation, no quotes, no markdown."
    )

    try:
        resp = requests.post(
            _GROQ_ENDPOINT,
            headers={
                "Authorization": f"Bearer {_groq_api_key()}",
                "Content-Type": "application/json",
            },
            json={
                "model": _GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": text},
                ],
                "temperature": 0.1,
                "max_tokens": 400,
            },
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()
    except requests.RequestException as exc:
        raise BhashiniError(f"Groq translation request failed: {exc}") from exc



def asr_translate(
    audio_base64: str,
    source_lang: str = "hi",
) -> Dict[str, str]:
    """
    Upstream pipeline: Indic audio → Indic text → English text.
    Uses Bhashini ASR then NMT in two chained compute calls.
    Returns  {"sourceText": "...", "englishText": "..."}
    """
    sl = bhashini_code(source_lang)

    asr_result = _compute(
        task_type   = "asr",
        source_lang = sl,
        target_lang = None,
        input_data  = {"audio": [{"audioContent": audio_base64}]},
    )
    source_text = _extract_text_from_response(asr_result, "asr")

    nmt_result = _compute(
        task_type   = "translation",
        source_lang = sl,
        target_lang = "en",
        input_data  = {"input": [{"source": source_text}]},
    )
    english_text = _extract_text_from_response(nmt_result, "translation")

    return {"sourceText": source_text, "englishText": english_text}


def translate_text(
    text: str,
    source_lang: str = "auto",
    target_lang: str = "en",
) -> str:
    """
    Translate text from source_lang to target_lang.

    First tries the Bhashini ULCA v1 NMT pipeline.  If that fails (wrong
    pipelineId, account not configured for v1, or network error), falls back
    to Groq llama-3.1-8b-instant which handles Indic↔English reliably.
    """
    if source_lang == "auto":
        source_lang = "en"

    sl = bhashini_code(source_lang)
    tl = bhashini_code(target_lang)

    try:
        result = _compute(
            task_type   = "translation",
            source_lang = sl,
            target_lang = tl,
            input_data  = {"input": [{"source": text}]},
        )
        translated = _extract_text_from_response(result, "translation")
        if translated:
            return translated
    except BhashiniError as exc:
        log.warning("Bhasini translation failed (%s), falling back to Groq", exc)

    log.info("Using Groq fallback for translation: %s → %s", sl, tl)
    return _translate_via_groq(text, source_lang, target_lang)


def translate_and_tts(
    english_text: str,
    target_lang: str = "hi",
) -> Dict[str, Any]:
    """
    Downstream pipeline: English text → target language → synthesized audio.
    Uses Bhashini NMT then TTS.  If Bhashini is unreachable, falls back to
    Groq translation only (audio will be empty).
    """
    tl = bhashini_code(target_lang)

    try:
        nmt_result = _compute(
            task_type   = "translation",
            source_lang = "en",
            target_lang = tl,
            input_data  = {"input": [{"source": english_text}]},
        )
        translated = _extract_text_from_response(nmt_result, "translation")
    except BhashiniError as exc:
        log.warning("Bhasini NMT failed (%s), using Groq fallback", exc)
        translated = _translate_via_groq(english_text, "en", target_lang)

    try:
        tts_result = _compute(
            task_type   = "tts",
            source_lang = tl,
            target_lang = None,
            input_data  = {"input": [{"source": translated}]},
        )
        audio_base64 = _extract_audio_from_response(tts_result)
    except BhashiniError as exc:
        log.warning("Bhasini TTS failed (%s), returning text only", exc)
        audio_base64 = ""

    return {
        "translatedText": translated,
        "audioBase64":   audio_base64,
        "mimeType":      "audio/wav" if audio_base64 else "",
    }


def health_check() -> Dict[str, Any]:
    """Returns cache stats and whether Bhasini is reachable."""
    cache_stats = _pipeline_cache.stats()
    try:
        requests.post(
            _ULCA_CONFIG_URL,
            headers=_ulca_headers(),
            json={"pipelineTasks": [], "pipelineRequestConfig": {"pipelineId": ""}},
            timeout=5,
        )
        reachable = True
    except Exception as exc:
        log.warning("Bhasini health check failed: %s", exc)
        reachable = False

    return {
        "ok":               True,
        "pipelineCache":     cache_stats,
        "bhasiniReachable": reachable,
    }



def _extract_text_from_response(data: Dict[str, Any], task_type: str) -> str:
    """Navigate Bhasini's variable response shapes and return the text string."""
    if "output" in data and isinstance(data["output"], str):
        return data["output"]

    for pr_item in data.get("pipelineResponse", []):
        if not isinstance(pr_item, dict):
            continue
        for key in ("output", "inputToken", "outputToken", "source", "target"):
            val = pr_item.get(key)
            if isinstance(val, str):
                return val
            if isinstance(val, list) and val:
                first = val[0]
                if isinstance(first, str):
                    return first
                if isinstance(first, dict):
                    return str(first.get("target", first.get("source", "")))

    for item in data.get("data", []):
        for key in ("target", "source", "output"):
            if key in item and isinstance(item[key], str):
                return item[key]

    for item in data.get("results", []):
        if isinstance(item, dict):
            for key in ("transcript", "text", "output"):
                if key in item:
                    return str(item[key])

    for key in ("text", "transcript", "output", "source", "target"):
        if key in data and isinstance(data[key], str):
            return data[key]

    log.warning("Could not extract text from Bhasini %s response: %s", task_type, json.dumps(data)[:300])
    return ""


def _extract_audio_from_response(data: Dict[str, Any]) -> str:
    """Navigate Bhasini's response shapes and return base64 audio string."""
    for pr_item in data.get("pipelineResponse", []):
        for audio_item in pr_item.get("audio", []):
            if "audioContent" in audio_item:
                return audio_item["audioContent"]
    for item in data.get("audio", []):
        if "audioContent" in item:
            return item["audioContent"]
    if "audioContent" in data:
        return data["audioContent"]
    out = data.get("output", "")
    if isinstance(out, str) and len(out) > 100:
        return out
    log.warning("Could not extract audio from response: %s", json.dumps(data)[:300])
    return ""
