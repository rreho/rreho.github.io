#!/usr/bin/env python3
r"""Convert one LaTeX section file into a Quarto page skeleton.

Written for modular papers: a `paper.tex` that is little more than a list of
`\input{...}`, where each included file is roughly one idea. Convert those
files one at a time — never the whole paper — so each page stays a single
answerable question.

Output always lands in a `_drafts/` folder, which is gitignored and never
rendered. Move it up one level and set `draft: false` when you want it public.

Usage
-----
    python import-tex.py <file.tex> <section>/<slug> [--macros <file.tex> ...]

    P=~/Documents/PostDoc_LUX/Papers/NEGF-papers
    python import-tex.py \
        $P/Transverse-EM/QED_dyson_equation.tex \
        physical-picture/dyson-equation-for-photons \
        --macros $P/conf/characters.tex $P/conf/math.tex $P/conf/alias.tex

How macros are handled
----------------------
The --macros files are *prepended to the source* before pandoc runs, so pandoc
expands them itself: `\qq` becomes `\mathbf q`, and a wrapper such as
`\eql{label}{body}` expands to a real `align` environment. Without this, pandoc
silently deletes every equation hidden behind a custom command.

Anything coming from a LaTeX *package* rather than your own preamble (the
`physics` package's `\bra`, `\ket`, `\dv`, …) cannot be expanded that way, so a
small MathJax shim is written into the page. Extend MATHJAX_SHIM below if a
command still renders red.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

# Commands from the `physics` / braket packages that MathJax does not know.
# Add to this list whenever an imported page shows a red unresolved command.
MATHJAX_SHIM = r"""
\newcommand{\bm}[1]{\boldsymbol{#1}}
\newcommand{\vb}[1]{\mathbf{#1}}
\newcommand{\va}[1]{\vec{#1}}
\newcommand{\bra}[1]{\left\langle #1\right|}
\newcommand{\ket}[1]{\left|#1\right\rangle}
\newcommand{\braket}[2]{\left\langle #1\middle|#2\right\rangle}
\newcommand{\expval}[1]{\left\langle #1\right\rangle}
\newcommand{\comm}[2]{\left[#1,#2\right]}
\newcommand{\acomm}[2]{\left\{#1,#2\right\}}
\newcommand{\abs}[1]{\left|#1\right|}
\newcommand{\norm}[1]{\left\lVert #1\right\rVert}
\newcommand{\qty}[1]{\left(#1\right)}
\newcommand{\dv}[2]{\frac{d #1}{d #2}}
\newcommand{\pdv}[2]{\frac{\partial #1}{\partial #2}}
\newcommand{\Tr}{\operatorname{Tr}}
"""

# Pandoc renders \ref / \eqref as a link carrying the original LaTeX label.
LATEX_REF = re.compile(
    r"\[\\\[(?P<label>[^\]]+?)\\\]\]\(#[^)]*\)\{reference-type=\"[^\"]*\"\s*reference=\"[^\"]*\"\}"
)
DISPLAY_MATH = re.compile(r"\$\$(?P<body>.*?)\$\$", re.DOTALL)
LABEL = re.compile(r"\\label\{(?P<label>[^}]+)\}")

# Outer amsmath environments number themselves, which fights Quarto's own
# equation numbering. The inner forms render identically and stay unnumbered.
INNER_ENV = {"align": "aligned", "gather": "gathered", "multline": "split"}
CITATION = re.compile(r"@(?P<key>[A-Za-z][\w.:/-]*)")


def eq_id(label: str) -> str:
    """PP.4 -> eq-pp-4 (Quarto equation ids must start with eq- )."""
    slug = re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")
    return f"eq-{slug}"

FRONT_MATTER = """---
title: "TODO: phrase this as a question"
description: "TODO: the one-line answer shown in the index table."
categories: [{category}]
order: 10
date: {date}
draft: true
{bibliography}format:
  html:
    html-math-method: mathjax
---

```{{=html}}
<div style="display:none">
$$
{shim}
$$
</div>
```

::: {{.oneline}}
TODO: the answer in one sentence.
:::

## Short answer

TODO: three to six sentences. Then fold what follows into collapsible blocks.

::: {{.callout-note collapse="true"}}
## Derivation

<!-- converted from {source} — check every equation before publishing -->

"""

FOOTER = """
:::

## See also

- [Physical Picture index](../index.qmd)
{references}"""


def run_pandoc(tex: Path, macro_files: list[Path], media_dir: Path) -> str:
    """Prepend the macro definitions, then convert. Returns markdown."""
    parts: list[str] = []
    for path in macro_files:
        if not path.exists():
            print(f"warning: macro file not found: {path}", file=sys.stderr)
            continue
        parts.append(path.read_text(errors="replace"))
    parts.append(tex.read_text(errors="replace"))

    with tempfile.NamedTemporaryFile("w", suffix=".tex", delete=False) as handle:
        handle.write("\n".join(parts))
        merged = Path(handle.name)

    try:
        result = subprocess.run(
            [
                "quarto", "pandoc",
                str(merged),
                "--from", "latex",
                "--to", "markdown+tex_math_dollars",
                "--wrap", "preserve",
                f"--extract-media={media_dir}",
            ],
            capture_output=True,
            text=True,
        )
    finally:
        merged.unlink(missing_ok=True)

    if result.returncode != 0:
        sys.exit(f"pandoc failed:\n{result.stderr}")
    return result.stdout


def extract_entries(bib_text: str, keys: set[str]) -> tuple[str, list[str]]:
    """Pull just the requested BibTeX records out of a large .bib file."""
    wanted = {k.lower(): k for k in keys}
    out: list[str] = []
    found: set[str] = set()

    index = 0
    while (start := bib_text.find("@", index)) != -1:
        brace = bib_text.find("{", start)
        comma = bib_text.find(",", brace)
        if brace == -1 or comma == -1:
            break
        key = bib_text[brace + 1 : comma].strip()
        depth, pos = 0, brace
        while pos < len(bib_text):
            if bib_text[pos] == "{":
                depth += 1
            elif bib_text[pos] == "}":
                depth -= 1
                if depth == 0:
                    break
            pos += 1
        if key.lower() in wanted:
            out.append(bib_text[start : pos + 1])
            found.add(key.lower())
        index = pos + 1

    missing = sorted(wanted[k] for k in wanted.keys() - found)
    return "\n\n".join(out) + "\n", missing


def tidy(markdown: str) -> tuple[str, int, int]:
    """Turn LaTeX labels into Quarto equation ids and rewire references.

    A `\label{PP.4}` inside a display equation becomes `$$...$$ {#eq-pp-4}`,
    and every `\eqref{PP.4}` in this file becomes `@eq-pp-4`, so Quarto
    numbers the equations and links them. References to labels defined in
    *other* files of the paper cannot resolve, so they degrade to plain text.
    """
    known: dict[str, str] = {}

    def move_label(match: re.Match[str]) -> str:
        body = match.group("body")
        found = LABEL.search(body)
        if not found:
            return match.group(0)
        label = found.group("label")
        known[label] = eq_id(label)
        body = LABEL.sub("", body)
        # a blank line inside $$...$$ ends the markdown block, which silently
        # detaches the {#eq-...} id and breaks every reference to it
        body = re.sub(r"\n\s*\n+", "\n", body).strip("\n")
        for outer, inner in INNER_ENV.items():
            body = body.replace(f"\\begin{{{outer}}}", f"\\begin{{{inner}}}")
            body = body.replace(f"\\end{{{outer}}}", f"\\end{{{inner}}}")
        # blank lines on both sides: Quarto only attaches {#eq-...} to display
        # math that stands as its own block
        return f"\n\n$$\n{body.strip()}\n$$ {{#{known[label]}}}\n\n"

    out = DISPLAY_MATH.sub(move_label, markdown)

    resolved = 0
    dangling = 0

    def rewire(match: re.Match[str]) -> str:
        nonlocal resolved, dangling
        label = match.group("label")
        if label in known:
            resolved += 1
            return f"@{known[label]}"
        dangling += 1
        return f"({label})"

    out = LATEX_REF.sub(rewire, out)
    return out, resolved, dangling


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("tex", type=Path, help="the .tex section file to convert")
    ap.add_argument("target", help="<section>/<slug>, e.g. physical-picture/dyson-equation")
    ap.add_argument(
        "--bib",
        type=Path,
        help="BibTeX file to copy next to the page, so [@key] citations resolve",
    )
    ap.add_argument(
        "--macros",
        type=Path,
        nargs="*",
        default=[],
        help="preamble files holding your \\def and \\newcommand definitions",
    )
    args = ap.parse_args()

    if not args.tex.exists():
        sys.exit(f"no such file: {args.tex}")

    section, _, slug = args.target.partition("/")
    if not slug:
        sys.exit("target must look like physical-picture/my-slug")

    dest = Path(__file__).resolve().parent / section / "_drafts" / slug
    if dest.exists():
        sys.exit(f"{dest} already exists — delete it or pick another slug")
    dest.mkdir(parents=True)

    body = run_pandoc(args.tex, args.macros, dest)
    body, resolved, dangling = tidy(body)

    bibliography = ""
    references = ""
    if args.bib:
        if not args.bib.exists():
            sys.exit(f"no such bib file: {args.bib}")
        cited = {m.group("key") for m in CITATION.finditer(body) if not m.group("key").startswith("eq-")}
        entries, missing = extract_entries(args.bib.read_text(errors="replace"), cited)
        (dest / "refs.bib").write_text(entries)
        bibliography = "bibliography: refs.bib\n"
        references = "\n## References\n\n::: {#refs}\n:::\n"
        print(f"  {len(cited) - len(missing)} of {len(cited)} citation(s) found in the bib")
        for key in missing:
            print(f"    missing from bib: {key}")

    page = (
        FRONT_MATTER.format(
            category="response" if section == "physical-picture" else "yambo",
            date=date.today().isoformat(),
            shim=MATHJAX_SHIM.strip(),
            source=args.tex.name,
            bibliography=bibliography,
        )
        + body
        + FOOTER.format(references=references)
    )
    (dest / "index.qmd").write_text(page)

    equations = body.count("$$") // 2
    print(f"wrote {dest / 'index.qmd'}")
    print(f"  {len(body.splitlines())} lines, {equations} display equations")
    print(f"  {resolved} cross-reference(s) wired up, {dangling} left as plain text")
    if args.bib:
        print(f"  bibliography copied to {dest / 'refs.bib'}")
    print("\nCheck every equation by eye, then:")
    print(f"  mv {section}/_drafts/{slug} {section}/{slug}   # when it may leave your laptop")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
