# Security Policy

This is an **educational** AES-128 implementation. It is not production
crypto — do not use it for real data.

## Reporting

If you find a bug, open a GitHub issue. Since no secrets are involved and
the cipher is intentionally simple, there is no private disclosure channel.

## Scope

- `python_api/` — FastAPI service and cipher
- `frontend/` — static UI, no server-side secrets

Out of scope: the cipher itself, by design.