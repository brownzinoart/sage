import logging
import os


def setup_logging() -> None:
    """Configure structured logging for the API service."""
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=level,
        format=(
            "%(asctime)s | %(levelname)s | %(name)s | "
            "%(message)s"
        ),
    )

    # Quiet noisy loggers in dev
    for noisy in ("urllib3", "httpx", "google"):  # type: ignore
        logging.getLogger(noisy).setLevel(os.getenv("NOISY_LOG_LEVEL", "WARNING").upper())

