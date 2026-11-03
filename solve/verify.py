"""Verify the recovered parameters by full round-trip re-encryption."""
from ciphers import Q1, Q2

# recovered: (key, a, reversed?)
SOL = {
    "Q1": (b"uwpgbamybps", 0x1B, True),
    "Q2": (b"fhrrovfqwwy", 0x59, False),
}


def encrypt(pt: bytes, key: bytes, a: int, rev: bool) -> bytes:
    c = bytes(pt[i] ^ key[i % len(key)] ^ ((a * i) & 0xFF) for i in range(len(pt)))
    return c[::-1] if rev else c


def decrypt(ct: bytes, key: bytes, a: int, rev: bool) -> bytes:
    if rev:
        ct = ct[::-1]
    return bytes(ct[i] ^ key[i % len(key)] ^ ((a * i) & 0xFF) for i in range(len(ct)))


for name, hx in (("Q1", Q1), ("Q2", Q2)):
    ct = bytes.fromhex(hx)
    key, a, rev = SOL[name]
    pt = decrypt(ct, key, a, rev)
    txt = pt.decode("utf-8")
    print(f"--- {name} ---")
    print("ciphertext bytes :", len(ct))
    print("key              :", key, "len", len(key))
    print("a                :", a, f"(0x{a:02x})")
    print("reversed         :", rev)
    print("plaintext bytes  :", len(pt))
    print("plaintext        :", txt)
    print("roundtrip ok     :", encrypt(pt, key, a, rev) == ct)
    print("re-hex == given  :", encrypt(pt, key, a, rev).hex() == hx)
    print("utf-8 strict ok  :", pt.decode("utf-8") is not None)
    print("chars            :", len(txt))
    print()
