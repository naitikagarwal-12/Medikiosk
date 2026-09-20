"""
MediKiosk Bhashini Bridge — Flask entry point.

Runs on BHASHINI_PORT (default 5001).
Kept intentionally minimal so it can be started/stopped independently
of the main Node/Express backend.
"""

import logging
import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

load_dotenv()

from routes.voice import bp as bhashini_bp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
log = logging.getLogger("medikiosk.bhashini")


def _allowed_origins():
    raw = os.getenv("CORS_ORIGIN", "")
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    return [
        "http://localhost:8443",
        "https://localhost:8443",
        "http://localhost:3001",
        "http://127.0.0.1:8443",
    ]


def create_app() -> Flask:
    app = Flask(__name__)

    CORS(app, resources={r"/*": {
        "origins": _allowed_origins(),
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }})

    app.register_blueprint(bhashini_bp)

    log.info("MediKiosk Bhashini Bridge ready on port %s", port())
    return app


def port() -> int:
    return int(os.getenv("BHASHINI_PORT", "5001"))


if __name__ == "__main__":
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=port(),
        debug=os.getenv("FLASK_DEBUG", "0") == "1",
    )
