#!/usr/bin/env python3
"""Generates PWA icons: blue shark circle and green fish circle on water.

Run from repo root:  python3 scripts/generate-icons.py
Outputs assets/icons/icon-192.png and assets/icons/icon-512.png.
"""
import struct
import zlib
from pathlib import Path

SIZES = [192, 512]

# Palette (matches src/config.ts)
WATER = (10, 61, 98)        # 0x0a3d62
SHARK = (52, 152, 219)      # 0x3498db
FISH = (46, 204, 113)       # 0x2ecc71


def png_chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def make_png(size: int) -> bytes:
    """Draws two overlapping circles suggesting a shark and a fish."""
    cx, cy = size / 2, size / 2
    r = size * 0.36

    # Shark circle: upper-left offset; Fish circle: lower-right offset.
    shark_c = (cx - size * 0.10, cy - size * 0.10)
    fish_c = (cx + size * 0.12, cy + size * 0.14)

    rows = []
    for y in range(size):
        row = bytearray()
        row.append(0)  # filter type: none
        for x in range(size):
            # Anti-aliased coverage via distance test with soft edge.
            def inside(c, radius):
                d = ((x - c[0]) ** 2 + (y - c[1]) ** 2) ** 0.5
                return d <= radius

            if inside(fish_c, r * 0.62):
                px = FISH
            elif inside(shark_c, r):
                px = SHARK
            else:
                px = WATER
            row.extend(px)
        rows.append(bytes(row))

    header = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", header)
        + png_chunk(b"IDAT", zlib.compress(b"".join(rows), 9))
        + png_chunk(b"IEND", b"")
    )


def main() -> None:
    out_dir = Path("assets/icons")
    out_dir.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        path = out_dir / f"icon-{size}.png"
        path.write_bytes(make_png(size))
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
