# rreho.github.io

Personal site of Riccardo Reho, built with [Quarto](https://quarto.org).
Everything on the site is a plain-text `.qmd` (markdown + optional code) or a
Jupyter notebook.

Live at <https://rreho.github.io>.

## Layout

```
_quarto.yml            site config: navbar, footer, theme  ← edit to change navigation
index.qmd              home page
research.qmd           research overview
publications.qmd       publication list
talks.qmd              talks, seminars, posters
about.qmd              biography, education, skills
draft.py              publish/hide switch for physical-picture/ and implementation/
import-tex.py         convert one LaTeX section file into a page skeleton
physical-picture/     theory: one genuine physics question per page
  index.qmd            curated map, auto-filled from each page's front matter
  _metadata.yml        settings shared by every concept page
  _template/           copy this folder to start a new page (never published)
  _drafts/             gitignored staging: never rendered, never pushed
  <slug>/index.qmd     one folder per question
implementation/       how it is actually computed, per code
  index.qmd            same idea, grouped by Yambo / SIESTA / ground state / numerics
  _metadata.yml        shared settings
  _template/           starting point for a new page
  _drafts/             gitignored staging
  <slug>/index.qmd     one folder per page
theme/light.scss       colours + typography, light mode
theme/dark.scss        same, dark mode
images/                shared images
pdfs/                  thesis and other static PDFs
docs/                  BUILD OUTPUT — served by GitHub Pages, never edit by hand
```

## Daily use

```bash
quarto preview          # live-reloading local server, rebuilds as you save
quarto render           # full build into docs/
```

Publishing is `render` + commit + push:

```bash
quarto render
git add -A && git commit -m "new note on X" && git push
```

GitHub Pages serves the `docs/` folder of `main`, so the site updates about a
minute after the push.

## Publishing switch: draft.py

Every page under `physical-picture/` and `notes/` carries a `draft:` flag. Drafts are
absent from the built site entirely — no content, no listing entry, no search
hit, no sitemap line. One script flips them:

```bash
python draft.py                    # status of every page
python draft.py false              # publish everything
python draft.py true               # hide everything
python draft.py false what-is-a-photon   # publish one page (substring match)
python draft.py true  what-is-a-photon   # hide it again
```

Then `quarto render`. The section index pages (`physical-picture/index.qmd`,
`implementation/index.qmd`) have their own flag — publish one when its first
page is ready, and uncomment the matching navbar entry in `_quarto.yml`.

## House rule for Physical Picture

Every top-level section of a page is **plain language**: no equations, no
symbols, no notation. Someone who never opens a folded block must still come
away with the correct physical picture.

Mathematics lives **only** inside `::: {.callout-note collapse="true"}` blocks.
The template enforces the layout; the discipline is yours.

Check it before publishing:

```bash
grep -n '\$' physical-picture/*/index.qmd | grep -v callout
```

## Two sections, one split

`physical-picture/` answers physics questions in words: what the object is, why
it is defined that way, what it means. No code, and no maths outside the folded
blocks.

`implementation/` answers the separate question of how it is computed: which
approximation a code makes, what it stores, which convention it uses, what goes
wrong. Pages cross-link to their concept page and back.

Keeping them apart is deliberate — the theory pages stay readable by someone
who will never run Yambo, and the code pages stay useful to someone who already
knows the theory.

## Concepts: the three publishing stages

Concept pages have their own visibility switch, independent of everything else.

| Stage | Where the file lives | On GitHub? | On the site? |
|---|---|---|---|
| 1. Private | `physical-picture/_drafts/<slug>/index.qmd` | no (gitignored) | no |
| 2. Written, hidden | `physical-picture/<slug>/index.qmd` + `draft: true` | yes | no |
| 3. Live | `physical-picture/<slug>/index.qmd` + `draft: false` | yes | yes |

Stage 1 exists because this repo is public: anything under `physical-picture/` is
visible on GitHub even when `draft: true` hides it from the website. Material
derived from unpublished manuscripts belongs in `_drafts/` until the paper is
out.

`draft-mode: gone` in `_quarto.yml` means a draft page emits an empty file and
appears in no listing, no search index and no sitemap. Flipping one page's
`draft:` flag publishes exactly that page — no other file changes.

The section index `physical-picture/index.qmd` is itself a draft. Flip it to
`draft: false` when the first page is ready, and uncomment the `Concepts` entry
in the `_quarto.yml` navbar.

### Writing a concept page

1. `cp -r physical-picture/_template physical-picture/my-question`
2. Set `title` (phrased as a question), `description` (the one-line answer that
   shows in the index table), `categories` (one of `fields`, `response`,
   `green-functions`, `excitations`, `measurement`) and `order` (position
   within that section).
3. Write the `.oneline` box, then the short answer, then fold the algebra into
   `::: {.callout-note collapse="true"}` blocks.

The index page picks it up from the category — no list to edit.

### Importing an existing LaTeX note

```bash
pandoc paper.tex -o physical-picture/_drafts/my-question/index.qmd   --wrap=preserve --extract-media=physical-picture/_drafts/my-question
```

Then add the Quarto front matter, split the long derivations into collapsible
callouts, and promote it through the three stages above.

## Adding a note

1. `cp -r notes/_template notes/my-new-note`
2. Edit `notes/my-new-note/index.qmd` — set `title`, `description`, `date`,
   `categories` in the header, then write.
3. `quarto preview` to check it, then render, commit, push.

The Notes index page picks it up automatically. No list to update.

### What a note can contain

| Content | How |
|---|---|
| Maths | `$inline$` and `$$display$$` LaTeX, rendered by KaTeX |
| Numbered equations | `$$...$$ {#eq-label}`, referenced with `@eq-label` |
| Static code | fenced block ` ```python ` |
| Executed code + output | fenced block ` ```{python} ` (needs Jupyter, below) |
| Figures | `![Caption](fig.png){#fig-label}`, referenced with `@fig-label` |
| A whole notebook as a page | drop `analysis.ipynb` in the note folder |
| A compiled LaTeX PDF | drop `derivation.pdf` in the folder and link it |
| A PDF version of the note | add `format: [html, pdf]` to the note header |
| Citations | `bibliography: refs.bib` in the header, cite with `[@key]` |

### Notebooks

Notebooks are rendered **from their stored outputs** — run them locally, save
with the outputs in place, commit. The build never re-executes them, so heavy
DFT post-processing never has to run in a rebuild.

`execute: freeze: auto` in `notes/_metadata.yml` enforces the same rule for
`{python}` blocks inside `.qmd` notes: they re-run only when you change the
source. Delete the `_freeze/` folder to force a re-run.

## Changing the look

- **Navigation, title, footer, social links** → `_quarto.yml`
- **Colours, fonts, spacing** → `theme/light.scss` and `theme/dark.scss`.
  The variables at the top (`$accent`, `$ink`, `$rule`, …) drive everything
  else; change one and the whole site follows.

## Requirements

- [Quarto](https://quarto.org/docs/get-started/) — `brew install --cask quarto`
- Optional, only for executing Python in notes:
  ```bash
  python3 -m venv .venv && source .venv/bin/activate
  pip install -r requirements.txt
  ```
- Optional, only for PDF output of notes: a LaTeX distribution
  (`quarto install tinytex` installs a minimal one).
