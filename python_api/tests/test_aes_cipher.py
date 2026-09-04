from app.core.aes_cipher import AESCipher


def test_fips_197_vector() -> None:
    cipher = AESCipher(bytes.fromhex('000102030405060708090a0b0c0d0e0f'))
    plaintext = bytes.fromhex('00112233445566778899aabbccddeeff')
    assert cipher.encrypt_block(plaintext).hex() == '69c4e0d86a7b0430d8cdb78070b4c55a'


def test_ecb_round_trip() -> None:
    cipher = AESCipher(b'1234567890abcdef')
    assert cipher.decrypt(cipher.encrypt(b'Hello World')) == b'Hello World'


def test_cbc_round_trip() -> None:
    cipher = AESCipher(b'1234567890abcdef', 'cbc', bytes(16))
    assert cipher.decrypt(cipher.encrypt(b'Hello World')) == b'Hello World'
