"""Correct attack: c[i] = p[i] ^ K[i mod L] ^ ((a*i) mod 256)
Because the mask is XORed (not added), for i = j (mod L) the key cancels as a plain
XOR:  c[i]^p[i]^((a*i)&255) must be the same byte for every i congruent to j mod L.
So brute force (L, a) and demand consistency on the known prefix.
"""
import sys
from ciphers import Q1, Q2, PREFIX, PREFIX_ASCII_COMMA


def try_key(e, L, a, n):
    """Return key list if e[i] = K[i%L] ^ ((a*i)&255) is consistent on the whole prefix."""
    key = [None] * L
    for i in range(n):
        v = e[i] ^ ((a * i) & 0xFF)
        j = i % L
        if key[j] is None:
            key[j] = v
        elif key[j] != v:
            return None
    return key


def decrypt(c, key, a):
    L = len(key)
    return bytes(c[i] ^ key[i % L] ^ ((a * i) & 0xFF) for i in range(len(c)))


def text_score(pt):
    try:
        s = pt.decode("utf-8")
    except UnicodeDecodeError:
        return -1.0, None
    good = sum(1 for ch in s if ch.isalnum() or ch in " .,!?;:'\"-()/"
               or 0x4E00 <= ord(ch) <= 0x9FFF or 0x3000 <= ord(ch) <= 0x303F
               or 0xFF00 <= ord(ch) <= 0xFFEF)
    return good / len(s), s


def attack(hx, prefix_bytes, maxL=40, show=6):
    c0 = bytes.fromhex(hx)
    p = prefix_bytes
    n = len(p)
    out = []
    for rev in (False, True):
        c = c0[::-1] if rev else c0
        e = [c[i] ^ p[i] for i in range(n)]
        for L in range(1, min(maxL, n) + 1):
            for a in range(256):
                key = try_key(e, L, a, n)
                if key is None:
                    continue
                pt = decrypt(c, key, a)
                s, txt = text_score(pt)
                out.append((s, rev, L, a, key, txt, pt))
    out.sort(key=lambda t: -t[0])
    return out


if __name__ == "__main__":
    for name, hx in (("Q1", Q1), ("Q2", Q2)):
        for pname, pref in (("fullwidth", PREFIX), ("ascii", PREFIX_ASCII_COMMA)):
            res = attack(hx, pref.encode())
            print(f"\n=== {name} prefix={pname}: {len(res)} consistent (rev,L,a) ===")
            for s, rev, L, a, key, txt, pt in res[:6]:
                print(f"  rev={rev!s:5} L={L:2} a=0x{a:02x} score={s:.2f} key={bytes(key).hex()}")
                if txt:
                    print(f"        {txt!r}")
