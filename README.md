# AES-128 Educational Library

This project implements AES-128 in pure Python without external cryptographic
libraries. It exposes the AES primitives, key schedule, ECB and CBC modes, a
FastAPI service serving a browser UI on the same origin, and interactive
OpenAPI docs.

## Architecture

```

frontend/        # Vanilla JS UI, served statically by FastAPI at /
python_api/
  app/
    core/          # AES primitives: S-box, GF(2^8), state matrix, key schedule
    main.py        # FastAPI app: /api/encrypt, /api/decrypt, /api/health + static UI
    schemas.py     # Pydantic request/response models
    utils.py       # Hex decoding helpers
  tests/           # pytest suite (incl. NIST FIPS-197 vectors)
```

The browser never performs cryptography: every operation calls `/api/encrypt`
or `/api/decrypt`, so the Python engine is the single source of truth.

## Run locally (Docker)

```bash
docker compose up --build api
```

The app is available at `http://localhost:8000` and OpenAPI docs at
`http://localhost:8000/docs`.

Run Python tests with:

```bash
docker compose run --rm test
```

## Run locally (no Docker)

```bash
cd python_api
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## API

Both endpoints accept hexadecimal fields:

```json
{
  "key": "31323334353637383930616263646566",
  "data": "48656c6c6f20576f726c64",
  "mode": "ecb"
}
```

Use `mode: "cbc"` with a 16-byte hexadecimal `iv`. The implementation is for
education; production applications should use authenticated encryption such as
AES-GCM.