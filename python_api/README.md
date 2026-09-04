# AES-128 Python API

FastAPI service and pure Python AES-128 implementation for the same educational
project. No external cryptography library is used.

## Run locally

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/` for the web UI and `/docs` for the interactive
OpenAPI UI. Both are served by the same process on the same origin.

## Request shape

Both endpoints accept hexadecimal fields:

```json
{
  "key": "31323334353637383930616263646566",
  "data": "48656c6c6f20576f726c64",
  "mode": "ecb"
}
```

Use `mode: "cbc"` with a 16-byte hexadecimal `iv`. This implementation is for
education; production applications should use authenticated encryption such as
AES-GCM.
