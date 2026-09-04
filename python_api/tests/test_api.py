from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_encrypt_and_decrypt_api() -> None:
    payload = {'key': b'1234567890abcdef'.hex(), 'data': 'Hello World'.encode().hex()}
    encrypted = client.post('/api/encrypt', json=payload)
    assert encrypted.status_code == 200
    ciphertext = encrypted.json()['data']

    decrypted = client.post('/api/decrypt', json={**payload, 'data': ciphertext})
    assert decrypted.status_code == 200
    assert bytes.fromhex(decrypted.json()['data']) == b'Hello World'


def test_api_rejects_bad_key() -> None:
    response = client.post('/api/encrypt', json={'key': '00', 'data': '00'})
    assert response.status_code == 422
