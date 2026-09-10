#!/usr/bin/env python3
"""Toggle the `draft:` flag on concept and implementation pages.

A page with `draft: true` is absent from the built site entirely: no content,
no listing entry, no search hit, no sitemap line (`draft-mode: gone` in
_quarto.yml). Flipping the flag is the only step needed to publish or hide it.

Usage
-----
    python draft.py                       show the status of every page
    python draft.py false                 publish everything
    python draft.py true                  hide everything
    python draft.py false what-is-a-photon [more-slugs ...]
    python draft.py true  what-is-a-photon

`index` is the slug of a section index page (e.g. physical-picture/index.qmd).
Slug matching is by substring, so partial names work when unambiguous.

Nothing is rendered — run `quarto render` afterwards.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SECTIONS = ("physical-picture", "implementation")
QUARTO_YML = ROOT / "_quarto.yml"

FRONT_MATTER = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
DRAFT_LINE = re.compile(r"^(\s*)draft:\s*(true|false)\s*(#.*)?$", re.MULTILINE)


def pages() -> list[Path]:
    """Every .qmd that belongs to a togglable section, templates excluded."""
    found: list[Path] = []
    for section in SECTIONS:
        for path in sorted((ROOT / section).rglob("*.qmd")):
            if any(part.startswith("_") for part in path.relative_to(ROOT).parts[:-1]):
                continue  # _template/, _drafts/ and friends
            found.append(path)
    return found


def slug_of(path: Path) -> str:
    """physical-picture/what-is-a-photon/index.qmd -> what-is-a-photon; .../index.qmd -> index."""
    rel = path.relative_to(ROOT)
    return rel.parent.name if rel.name == "index.qmd" and rel.parent.name not in SECTIONS else rel.stem


def read_draft(text: str) -> bool | None:
    """Current draft value, or None if the page has no draft field."""
    fm = FRONT_MATTER.match(text)
    if not fm:
        return None
    match = DRAFT_LINE.search(fm.group(1))
    return match.group(2) == "true" if match else None


def set_draft(text: str, value: bool) -> str | None:
    """Rewrite (or insert) the draft field. None if the file has no front matter."""
    fm = FRONT_MATTER.match(text)
    if not fm:
        return None

    body = fm.group(1)
    new_value = "true" if value else "false"

    if DRAFT_LINE.search(body):
        updated = DRAFT_LINE.sub(
            lambda m: f"{m.group(1)}draft: {new_value}" + (f" {m.group(3)}" if m.group(3) else ""),
            body,
            count=1,
        )
    else:
        updated = body.rstrip("\n") + f"\ndraft: {new_value}"

    return text[: fm.start(1)] + updated + text[fm.end(1) :]


NAV_ENTRY = {
    "physical-picture": ("- href: physical-picture/index.qmd", "  text: Physical Picture"),
    "implementation": ("- href: implementation/index.qmd", "  text: Implementation"),
}


def sync_navbar(paths: list[Path]) -> list[str]:
    """Show a section in the navbar exactly when it has at least one live page.

    Keeps the user from having to remember a second, unrelated edit in
    _quarto.yml every time a section is switched on or off.
    """
    live_sections = {
        path.relative_to(ROOT).parts[0]
        for path in paths
        if read_draft(path.read_text()) is False
    }

    text = QUARTO_YML.read_text()
    changed: list[str] = []

    for section, (href, label) in NAV_ENTRY.items():
        want_visible = section in live_sections
        for line in (href, label):
            commented = f"      # {line}"
            visible = f"      {line}"
            if want_visible and commented in text:
                text = text.replace(commented, visible)
            elif not want_visible and visible in text and commented not in text:
                text = text.replace(visible, commented)
        state = "shown" if want_visible else "hidden"
        if f"      # {href}" in text and want_visible:
            continue
        changed.append(f"navbar: {section} {state}")

    QUARTO_YML.write_text(text)
    return changed


def show_status(paths: list[Path]) -> None:
    width = max((len(slug_of(p)) for p in paths), default=0)
    section = None
    for path in paths:
        current = path.relative_to(ROOT).parts[0]
        if current != section:
            section = current
            print(f"\n{section}/")
        state = read_draft(path.read_text())
        label = {True: "hidden", False: "LIVE", None: "no draft field"}[state]
        print(f"  {slug_of(path):<{width}}  {label}")
    live = sum(read_draft(p.read_text()) is False for p in paths)
    print(f"\n{live} of {len(paths)} pages live. Run `quarto render` to apply.")


def main(argv: list[str]) -> int:
    paths = pages()
    if not paths:
        print("No pages found under", ", ".join(f"{s}/" for s in SECTIONS))
        return 1

    if not argv:
        show_status(paths)
        return 0

    flag = argv[0].lower()
    if flag not in {"true", "false"}:
        print(__doc__)
        return 2
    value = flag == "true"

    slugs = argv[1:]
    if slugs:
        targets = [p for p in paths if any(s in slug_of(p) for s in slugs)]
        unmatched = [s for s in slugs if not any(s in slug_of(p) for p in paths)]
        for slug in unmatched:
            print(f"no page matches {slug!r}")
        if not targets:
            return 1
    else:
        targets = paths

    changed = 0
    for path in targets:
        text = path.read_text()
        updated = set_draft(text, value)
        if updated is None:
            print(f"skipped {slug_of(path)} (no YAML front matter)")
            continue
        if updated != text:
            path.write_text(updated)
            changed += 1
            print(f"{'hidden ' if value else 'LIVE   '} {slug_of(path)}")

    for note in sync_navbar(pages()):
        print(note)

    print(f"\n{changed} file(s) changed. Run `quarto render` to apply.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
