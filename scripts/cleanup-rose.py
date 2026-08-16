#!/usr/bin/env python3
"""
Second-pass cleanup for the rose-* migration.

Fixes artifacts left by the first pass:
  1. `word/N/N` double-opacity class strings (e.g. `bg-primary/30/20`)
  2. `hover:hover:...` chains (leftover prefixes from removed classes)
  3. Stray `hover:` at the end of className strings
  4. Removes any remaining `bg-gradient-to-*` classes (any direction)
  5. Removes any remaining `from-*`/`via-*`/`to-*` helper classes (any color)
  6. Removes decorative orb <div>s whose className contains BOTH
     `pointer-events-none` AND `blur-2xl`/`blur-3xl`
  7. Removes standalone `blur-2xl`/`blur-3xl` classes from any element
  8. Removes empty `className=""` attributes

Run:
    python3 scripts/cleanup-rose.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")
SCAN_DIRS = [ROOT / "src" / "components", ROOT / "src" / "app", ROOT / "src" / "lib", ROOT / "src" / "store"]


def collapse_double_opacity(text: str) -> str:
    # `bg-primary/30/20` -> `bg-primary/20`  (use second/last opacity)
    # Also matches `text-primary/60/70`, `border-primary/20/60`, `ring-primary/20/60`, etc.
    pattern = re.compile(
        r"\b(bg|text|border|ring|fill|shadow|from|via|to|outline|divide|accent|decoration)-"
        r"(?:primary|secondary|tertiary|destructive|muted|accent|popover|card|sidebar|foreground|background)"
        r"/\d+(?:/\d+)+"
    )
    def repl(m: re.Match[str]) -> str:
        full = m.group(0)
        # Split on `/`, keep everything except the second-to-last opacity (the spurious one)
        parts = full.split("/")
        # parts[0] = "bg-primary", parts[1] = "30", parts[2] = "20"
        # Keep parts[0] + last part
        return f"{parts[0]}/{parts[-1]}"
    return pattern.sub(repl, text)


def collapse_hover_chain(text: str) -> str:
    # `hover:hover:hover:foo` -> `hover:foo`
    # Also `group-hover:group-hover:foo` -> `group-hover:foo`
    text = re.sub(r"\b(?:hover:){2,}", "hover:", text)
    text = re.sub(r"\b(?:group-hover:){2,}", "group-hover:", text)
    # Trailing `hover:` with nothing after it (end of className) — drop
    text = re.sub(r"\bhover:(?=[\" ]|$)", "", text)
    return text


def remove_gradient_helpers(text: str) -> str:
    # Remove any bg-gradient-to-* class (any direction)
    text = re.sub(r"\bbg-gradient-to-(?:r|l|br|bl|tr|tl|t|b)\b\s*", "", text)
    # Remove from-*/via-*/to-* (any color, with optional opacity)
    text = re.sub(r"\bfrom-[\w-]+(?:/\d+)?\b\s*", "", text)
    text = re.sub(r"\bvia-[\w-]+(?:/\d+)?\b\s*", "", text)
    text = re.sub(r"\bto-[\w-]+(?:/\d+)?\b\s*", "", text)
    return text


def remove_decorative_orb_divs(text: str) -> str:
    """Remove <div ... /> (self-closing) or <div ...>...</div> blocks that
    contain BOTH `pointer-events-none` AND `blur-2xl`/`blur-3xl` in their
    opening className."""
    # Self-closing form: <div ... className="... pointer-events-none ... blur-2xl/3xl ..." ... />
    pattern_self_close = re.compile(
        r"<div\b[^>]*\bclassName=\"[^\"]*\bpointer-events-none\b[^\"]*\b(?:blur-(?:2|3)xl)\b[^\"]*\"[^>]*/>\s*\n?",
        re.DOTALL,
    )
    text = pattern_self_close.sub("", text)
    pattern_self_close2 = re.compile(
        r"<div\b[^>]*\bclassName=\"[^\"]*\b(?:blur-(?:2|3)xl)\b[^\"]*\bpointer-events-none\b[^\"]*\"[^>]*/>\s*\n?",
        re.DOTALL,
    )
    text = pattern_self_close2.sub("", text)

    # Multi-line self-closing form:
    #   <div
    #     className="... pointer-events-none ... blur-3xl ..."
    #     aria-hidden
    #   />
    pattern_multiline = re.compile(
        r"<div\b[^/>]*\bclassName=\"[^\"]*\bpointer-events-none\b[^\"]*\b(?:blur-(?:2|3)xl)\b[^\"]*\"[^>]*/>\s*\n?",
        re.DOTALL,
    )
    text = pattern_multiline.sub("", text)
    pattern_multiline2 = re.compile(
        r"<div\b[^/>]*\bclassName=\"[^\"]*\b(?:blur-(?:2|3)xl)\b[^\"]*\bpointer-events-none\b[^\"]*\"[^>]*/>\s*\n?",
        re.DOTALL,
    )
    text = pattern_multiline2.sub("", text)
    return text


def strip_blur_classes(text: str) -> str:
    # Remove any remaining blur-2xl / blur-3xl class tokens
    text = re.sub(r"\sblur-(?:2|3)xl\b", "", text)
    text = re.sub(r"\bblur-(?:2|3)xl\b\s*", "", text)
    return text


def tidy_classnames(text: str) -> str:
    # Collapse double spaces inside className strings
    text = re.sub(r'className="([^"]*)"', lambda m: 'className="' + re.sub(r" {2,}", " ", m.group(1)).strip() + '"', text)
    # Empty className="" -> remove the attribute
    text = re.sub(r'\s*className=""', "", text)
    # Trailing whitespace on each line
    text = re.sub(r"[ \t]+$", "", text, flags=re.MULTILINE)
    # Triple+ blank lines -> 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def process(path: Path) -> int:
    original = path.read_text(encoding="utf-8")
    text = original
    text = collapse_double_opacity(text)
    text = collapse_hover_chain(text)
    text = remove_gradient_helpers(text)
    text = remove_decorative_orb_divs(text)
    text = strip_blur_classes(text)
    text = tidy_classnames(text)
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
