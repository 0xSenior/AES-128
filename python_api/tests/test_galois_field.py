from app.core.galois_field import multiply


def test_known_galois_field_product() -> None:
    assert multiply(0x57, 0x83) == 0xC1
