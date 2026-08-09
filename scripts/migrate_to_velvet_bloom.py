#!/usr/bin/env python3
"""
Migrate all .tsx files in src/components/ and src/app/page.tsx + src/lib/constants.ts
from the rose-/gradient-based palette to the Velvet Bloom design system (DESIGN.md).

Mapping rules:
- bg-rose-{50,100} -> bg-blush (custom utility, soft pink #fdf0f6)
- bg-rose-200      -> bg-blush-strong
- bg-rose-{300,400,500,600} -> bg-primary (#a42c82)
- bg-rose-{700,800,900} -> bg-secondary (#943e7e)
- text-rose-{400,500,600} -> text-primary
- text-rose-{700,800,900} -> text-secondary
- text-rose-{50,100} -> text-on-primary
- text-rose-{200,300} -> text-primary-container
- border-rose-{100,200} -> border-outline-variant
- border-rose-{300,400} -> border-outline
- border-rose-{500,600,700} -> border-primary
- ring-rose-{100,200} -> ring-primary/20
- shadow-rose-{500,600}/X -> shadow-primary/X
- bg-gradient-to-X from-rose-Y via-rose-Z to-rose-W -> bg-primary (solid)
- bg-gradient-to-X from-rose-Y to-rose-Z -> bg-primary
- bg-gradient-to-X from-rose-{50,100,200} via-rose-{50,100} to-amber-50/X -> bg-blush
- bg-gradient-to-br from-rose-{300,400}/X via-rose-Y to-amber-Z -> bg-primary/15 (decorative orb)
- from-amber-X / via-amber-X / to-amber-X -> removed (replaced with solid)
- text-gradient-rose -> text-primary (solid)
- bg-gradient-to-t from-black/X to-transparent -> KEEP (overlay, not a rose gradient)
- from-white/X / via-white/X / to-white/X -> KEEP (white is okay)
- bg-gradient-to-r from-white to-blush -> bg-blush (solid)

Operates in-place. Writes a backup to .bak only if --backup flag is passed.
"""

import re
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")
TARGETS = [
    *sorted((ROOT / "src/components").rglob("*.tsx")),
    ROOT / "src/app/page.tsx",
    ROOT / "src/lib/constants.ts",
]

# ------------------------------------------------------------
# 1. SOLID COLOR SUBSTITUTIONS (in order, most specific first)
# ------------------------------------------------------------
SOLID_SUBS = [
    # Order matters! Process higher numbers first so we don't double-replace.
    # bg-rose
    (r"\bbg-rose-900\b", "bg-secondary"),
    (r"\bbg-rose-800\b", "bg-secondary"),
    (r"\bbg-rose-700\b", "bg-secondary"),
    (r"\bbg-rose-600\b", "bg-primary"),
    (r"\bbg-rose-500\b", "bg-primary"),
    (r"\bbg-rose-400\b", "bg-primary"),
    (r"\bbg-rose-300\b", "bg-primary-container"),
    (r"\bbg-rose-200\b", "bg-blush-strong"),
    (r"\bbg-rose-100\b", "bg-blush"),
    (r"\bbg-rose-50\b",  "bg-blush"),
    # text-rose
    (r"\btext-rose-900\b", "text-secondary"),
    (r"\btext-rose-800\b", "text-secondary"),
    (r"\btext-rose-700\b", "text-secondary"),
    (r"\btext-rose-600\b", "text-primary"),
    (r"\btext-rose-500\b", "text-primary"),
    (r"\btext-rose-400\b", "text-primary"),
    (r"\btext-rose-300\b", "text-primary-container"),
    (r"\btext-rose-200\b", "text-primary-container"),
    (r"\btext-rose-100\b", "text-on-primary"),
    (r"\btext-rose-50\b",  "text-on-primary"),
    # border-rose
    (r"\bborder-rose-700\b", "border-primary"),
    (r"\bborder-rose-600\b", "border-primary"),
    (r"\bborder-rose-500\b", "border-primary"),
    (r"\bborder-rose-400\b", "border-outline"),
    (r"\bborder-rose-300\b", "border-outline"),
    (r"\bborder-rose-200\b", "border-outline-variant"),
    (r"\bborder-rose-100\b", "border-outline-variant"),
    # ring-rose
    (r"\bring-rose-300\b", "ring-primary/40"),
    (r"\bring-rose-200\b", "ring-primary/30"),
    (r"\bring-rose-100\b", "ring-primary/15"),
    # shadow-rose
    (r"\bshadow-rose-600/", "shadow-primary/"),
    (r"\bshadow-rose-500/", "shadow-primary/"),
    # Custom utility: text-gradient-rose -> text-primary (solid)
    (r"\btext-gradient-rose\b", "text-primary"),
]

# ------------------------------------------------------------
# 2. GRADIENT NEUTRALIZATION
# ------------------------------------------------------------
# Match any `bg-gradient-to-X ...` chain that contains rose or amber.
# Replace with the appropriate solid color.
#
# Strategy: match `bg-gradient-to-(r|l|br|b|t|tr|tl) ... ` and capture the rest
# of the className up to the next quote. Then:
#   - If it contains from-rose-500..700 or to-rose-500..700 (i.e. brand CTAs) -> bg-primary
#   - If it contains only rose-50..200 + amber-50..200 (i.e. soft blush bg) -> bg-blush
#   - If it contains rose-300/400 with /opacity (i.e. decorative orb) -> bg-primary/15
#   - If it contains from-black/ or to-transparent only -> KEEP AS IS (overlay)
#   - If it contains only white (e.g. from-white/70 to-white/0) -> KEEP AS IS
#   - Otherwise -> bg-primary (safe default for CTA buttons)

GRADIENT_PATTERN = re.compile(
    r"bg-gradient-to-(?:r|l|br|b|t|tr|tl)\s+(?:[^\s\"]+\s+)*[^\s\"]*"
)

def neutralize_gradient(match: re.Match) -> str:
    """Return a solid replacement for a matched bg-gradient-to-X ... string."""
    text = match.group(0)
    # If this gradient has NO rose and NO amber, leave it alone (e.g. from-black/40)
    if "rose" not in text and "amber" not in text:
        return text
    # Special case: from-black overlay (keep, but drop the rose/amber pieces)
    if "from-black" in text or "to-black" in text:
        return "bg-black/40"
    # Decorative orb: rose-300/400 with /opacity, plus amber -> primary/15
    if re.search(r"rose-[34]00/", text) or re.search(r"amber-200/", text):
        return "bg-primary/15"
    # Soft blush background: rose-50..200 + amber-50..200 only
    soft_only = not re.search(r"rose-[3-9]00", text)
    if soft_only:
        return "bg-blush"
    # Brand CTA: rose-500..700 (with optional hover variants)
    return "bg-primary"


def migrate_file(path: Path) -> tuple[int, int, int]:
    """Returns (rose_remaining, gradient_remaining, lines_changed)."""
    src = path.read_text(encoding="utf-8")
    original = src

    # 2a. Neutralize hover variants for gradients FIRST so they don't get
    #     double-processed. Pattern: `hover:from-rose-X` / `hover:to-rose-X`
    #     Drop them entirely (they'll be replaced by hover:bg-primary/90 etc.)
    src = re.sub(r"\s*hover:from-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*hover:to-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*hover:via-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*from-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*via-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*to-rose-[0-9]+(?:/[0-9]+)?", "", src)
    # Also drop amber-* from/via/to (they were only used in rose gradients)
    src = re.sub(r"\s*hover:from-amber-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*hover:to-amber-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*hover:via-amber-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*from-amber-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*via-amber-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*to-amber-[0-9]+(?:/[0-9]+)?", "", src)

    # 2b. Now neutralize any remaining `bg-gradient-to-X ...` (now stripped of
    #     from/via/to) - if the bg-gradient-to-X has no other direction pieces
    #     left, we need to replace it with a solid. The original from/via/to
    #     was the signal for which solid to use, but we just stripped it.
    #     So do this BEFORE stripping from/via/to. Restart.
    src = original
    # Step 1: replace full gradient chains with solids
    src = GRADIENT_PATTERN.sub(neutralize_gradient, src)
    # Step 2: drop any leftover hover:from/to/via-rose or amber (now orphans)
    src = re.sub(r"\s*hover:from-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*hover:to-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*hover:via-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*hover:from-amber-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*hover:to-amber-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*hover:via-amber-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*from-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*via-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*to-rose-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*from-amber-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*via-amber-[0-9]+(?:/[0-9]+)?", "", src)
    src = re.sub(r"\s*to-amber-[0-9]+(?:/[0-9]+)?", "", src)

    # 3. Apply solid color substitutions
    for pat, rep in SOLID_SUBS:
        src = re.sub(pat, rep, src)

    # 4. Clean up: replace `bg-primary hover:bg-primary` (redundant) with `bg-primary hover:bg-primary/90`
    src = re.sub(
        r"\bbg-primary hover:bg-primary\b(?!\s*/)",
        "bg-primary hover:bg-primary/90",
        src,
    )
    # 5. Clean up double spaces from removed classes
    src = re.sub(r"  +", " ", src)
    # 6. Clean up trailing spaces before quotes
    src = re.sub(r"\s+\"", '"', src)
    # 7. Clean up `className=""` empty (shouldn't happen but just in case)
    src = re.sub(r'className="\s*"', 'className=""', src)

    if src != original:
        path.write_text(src, encoding="utf-8")

    rose_remaining = len(re.findall(r"\brose-[0-9]+\b", src))
    gradient_remaining = len(re.findall(r"bg-gradient-to-", src))
    return rose_remaining, gradient_remaining, 0


def main():
    total_rose = 0
    total_grad = 0
    for path in TARGETS:
        if not path.exists():
            print(f"SKIP (missing): {path}")
            continue
        rose, grad, _ = migrate_file(path)
        total_rose += rose
        total_grad += grad
        status = "OK" if rose == 0 else f"ROSE_LEFT={rose}"
        if grad:
            status += f" GRAD_LEFT={grad}"
        print(f"  {status:25s}  {path.relative_to(ROOT)}")
    print(f"\nTOTAL: rose_remaining={total_rose}  gradient_remaining={total_grad}")


if __name__ == "__main__":
    main()
