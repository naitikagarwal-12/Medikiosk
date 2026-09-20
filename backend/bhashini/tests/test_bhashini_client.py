"""
Tests for the Bhasini ULCA client.
Run with:  cd backend/bhashini && pytest tests/
"""

import base64
import json
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("BHASHINI_UDYAT_KEY",       "test-udyat")
os.environ.setdefault("BHASHINI_API_KEY",         "test-api")
os.environ.setdefault("BHASHINI_INFERENCE_KEY",   "test-inference")

import bhashini.client as cli



@pytest.fixture
def fake_config_response():
    return {
        "pipelineResponseConfig": [
            {
                "taskType": "asr",
                "config": {
                    "language": {"sourceLanguage": "hi"},
                    "serviceId": "ai4bharat/conformer-hi-gpu--t4",
                    "audioFormat": "wav",
                    "samplingRate": 16000,
                },
            }
        ],
        "callbackUrl": "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
    }


@pytest.fixture
def fake_translation_config():
    return {
        "pipelineResponseConfig": [
            {
                "taskType": "translation",
                "config": {
                    "language": {"sourceLanguage": "hi", "targetLanguage": "en"},
                    "serviceId": "ai4bharat/indictrans-v2--d-WIN-1B",
                },
            }
        ],
        "callbackUrl": "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
    }


@pytest.fixture
def fake_asr_response():
    return {
        "pipelineResponse": [
            {"taskType": "asr", "output": ["मुझे सिर दर्द है"]}
        ]
    }


@pytest.fixture
def fake_translation_response():
    return {
        "pipelineResponse": [
            {"taskType": "translation", "output": ["I have a headache"]}
        ]
    }



def test_pipeline_config_is_cached(monkeypatch, fake_config_response):
    calls = {"count": 0}

    def fake_post(url, *args, **kwargs):
        calls["count"] += 1
        class Resp:
            status_code = 200
            def raise_for_status(self): pass
            def json(self): return fake_config_response
        return Resp()

    monkeypatch.setattr("bhashini.client.requests.post", fake_post)
    cli._pipeline_cache = cli.PipelineCache(ttl_s=60)

    cfg1 = cli._get_pipeline_config("asr", "hi", None)
    cfg2 = cli._get_pipeline_config("asr", "hi", None)

    assert cfg1 == cfg2
    assert calls["count"] == 1, f"Expected 1 HTTP call, got {calls['count']}"


def test_different_langs_dont_share_cache(monkeypatch, fake_config_response):
    calls = {"count": 0}

    def fake_post(url, *args, **kwargs):
        calls["count"] += 1
        class Resp:
            status_code = 200
            def raise_for_status(self): pass
            def json(self): return fake_config_response
        return Resp()

    monkeypatch.setattr("bhashini.client.requests.post", fake_post)
    cli._pipeline_cache = cli.PipelineCache(ttl_s=60)

    cli._get_pipeline_config("asr", "hi", None)
    cli._get_pipeline_config("asr", "ta", None)

    assert calls["count"] == 2



def test_asr_translate_returns_source_and_english(
    monkeypatch, fake_config_response, fake_asr_response, fake_translation_response
):
    responses = iter([
        fake_config_response,
        fake_asr_response,
        fake_translation_response,
    ])

    def fake_post(url, *args, **kwargs):
        body = kwargs.get("json") or (args[0] if args else {})
        class Resp:
            status_code = 200
            def raise_for_status(self): pass
            def json(self): return next(responses)
        return Resp()

    monkeypatch.setattr("bhashini.client.requests.post", fake_post)
    cli._pipeline_cache = cli.PipelineCache(ttl_s=60)

    audio_b64 = base64.b64encode(b"\x00" * 1000).decode()
    result = cli.asr_translate(audio_b64, "hi")

    assert result["sourceText"]  == "मुझे सिर दर्द है"
    assert result["englishText"] == "I have a headache"



def test_translate_text_returns_translated(monkeypatch, fake_translation_config, fake_translation_response):
    responses = iter([fake_translation_config, fake_translation_response])

    def fake_post(url, *args, **kwargs):
        class Resp:
            status_code = 200
            def raise_for_status(self): pass
            def json(self): return next(responses)
        return Resp()

    monkeypatch.setattr("bhashini.client.requests.post", fake_post)
    cli._pipeline_cache = cli.PipelineCache(ttl_s=60)

    out = cli.translate_text("नमस्ते", "hi", "en")
    assert out == "I have a headache"



def test_extract_text_from_flat_output():
    assert cli._extract_text_from_response({"output": "hello"}, "asr") == "hello"


def test_extract_text_from_pipeline_response():
    data = {"pipelineResponse": [{"output": ["world"]}]}
    assert cli._extract_text_from_response(data, "translation") == "world"


def test_extract_text_from_pipeline_response_with_target_key():
    data = {"pipelineResponse": [{"output": [{"target": "world"}]}]}
    assert cli._extract_text_from_response(data, "translation") == "world"


def test_extract_text_returns_empty_when_unknown_shape():
    data = {"someUnrelatedKey": 42}
    assert cli._extract_text_from_response(data, "asr") == ""


def test_extract_audio_from_pipeline_response():
    data = {"pipelineResponse": [{"audio": [{"audioContent": "BASE64DATA"}]}]}
    assert cli._extract_audio_from_response(data) == "BASE64DATA"


def test_extract_audio_from_flat_audio_content():
    assert cli._extract_audio_from_response({"audioContent": "B64"}) == "B64"
