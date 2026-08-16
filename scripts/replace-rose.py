#!/usr/bin/env python3
"""
Replace deprecated `rose-*` Tailwind classes with Velvet Bloom palette tokens.

Run:
    python3 scripts/replace-rose.py

Operates on every `.tsx` and `.ts` file under `src/components/` and `src/app/`.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")
SCAN_DIRS = [ROOT / "src" / "components", ROOT / "src" / "app"]

# Order matters: longest / most-specific patterns first so we don't accidentally
# clobber multi-class substrings. Each rule is (regex, replacement).
RULES: list[tuple[str, str]] = [
    # --- gradients / decorative orbs / hover-scale to remove entirely ---
    # Remove decorative orb divs (single-line) — those with blur-2xl or blur-3xl
    # and pointer-events-none. Capture leading whitespace + the whole <div ... />.
    (
        r"^[ \t]*<div\b[^/>]*\bpointer-events-none\b[^/>]*\b(?:blur-(?:2|3)xl)\b[^/>]*/>\s*\n",
        "",
    ),
    # Remove bg-gradient-to-* and from-/via-/to- helper classes used by old rose gradients.
    (r"\bbg-gradient-to-(?:r|l|br|bl|tr|tl|t|b)\b\s*", ""),
    (r"\bbg-gradient-to-(?:r|l|br|bl|tr|tl|t|b)\b", ""),
    (r"\bfrom-(?:rose|amber|white|black|transparent)(?:-\d+)?(?:/\d+)?\b\s*", ""),
    (r"\bvia-(?:rose|amber|white|black|transparent)(?:-\d+)?(?:/\d+)?\b\s*", ""),
    (r"\bto-(?:rose|amber|white|black|transparent)(?:-\d+)?(?:/\d+)?\b\s*", ""),
    # hover:scale-110 — remove
    (r"\bhover:scale-110\b\s*", ""),

    # --- text-rose / bg-rose / border-rose / ring-rose / shadow-rose ---
    (r"\btext-rose-700\b", "text-primary"),
    (r"\btext-rose-600\b", "text-primary"),
    (r"\btext-rose-500\b", "text-primary"),
    (r"\btext-rose-400\b", "text-primary"),
    (r"\btext-rose-300\b", "text-primary/60"),
    (r"\btext-rose-200\b", "text-white/60"),
    (r"\btext-rose-100\b", "text-white/80"),
    (r"\btext-rose-50\b", "text-white/90"),
    (r"\btext-rose-800\b", "text-primary"),
    (r"\btext-rose-900\b", "text-primary"),

    (r"\bbg-rose-700\b", "bg-primary"),
    (r"\bbg-rose-600\b", "bg-primary"),
    (r"\bbg-rose-500\b", "bg-primary"),
    (r"\bbg-rose-400\b", "bg-primary"),
    (r"\bbg-rose-300\b", "bg-primary/30"),
    (r"\bbg-rose-200\b", "bg-primary/20"),
    (r"\bbg-rose-100\b", "bg-accent"),
    (r"\bbg-rose-50\b", "bg-accent"),

    (r"\bborder-rose-300\b", "border-primary/20"),
    (r"\bborder-rose-200\b", "border-primary/20"),
    (r"\bborder-rose-100\b", "border-primary/10"),

    (r"\bring-rose-200\b", "ring-primary/20"),
    (r"\bring-rose-100\b", "ring-primary/20"),

    (r"\bshadow-rose-500/30\b", "shadow-primary/20"),
    (r"\bshadow-rose-500/25\b", "shadow-primary/20"),
    (r"\bshadow-rose-500/20\b", "shadow-primary/20"),
    (r"\bshadow-rose-500/10\b", "shadow-primary/10"),

    (r"\bfill-rose-500\b", "fill-primary"),
    (r"\bfill-rose-400\b", "fill-primary"),

    # Generic fallback for any rose-N still left (e.g. rose-800).
    (r"\b(?:bg|text|border|ring|fill|shadow)-rose-\d+(?:/\d+)?\b", "bg-primary"),

    # Also nuke any leftover gradient helpers tied to non-rose color tokens that
    # were paired with rose gradients (amber-200/300 used in orbs).
    # We leave amber status colors (used for warnings) intact elsewhere.
]


def collapse_repeats(s: str) -> str:
    # Tidy double-spaces produced by class removal
    s = re.sub(r" {2,}", " ", s)
    s = re.sub(r"\s+$", "", s, flags=re.MULTILINE)
    return s


def process(path: Path) -> int:
    original = path.read_text(encoding="utf-8")
    text = original
    for pattern, repl in RULES:
        text = re.sub(pattern, repl, text, flags=re.MULTILINE)
    text = collapse_repeats(text)
    # Strip empty leftover className attributes ("className="  "")
    text = re.sub(r'className="\s*"', 'className=""', text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return 1
    return 0


def main() -> int:
    changed = 0
    files_scanned = 0
    for scan_dir in SCAN_DIRS:
        if not scan_dir.exists():
            continue
        for path in scan_dir.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix not in {".tsx", ".ts"}:
                continue
            files_scanned += 1
            changed += process(path)
    print(f"Scanned {files_scanned} files; modified {changed}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
