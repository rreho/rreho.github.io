# rreho.github.io

Personal site of Riccardo Reho, built with [Quarto](https://quarto.org).
Everything on the site is a plain-text `.qmd` (markdown + optional code) or a
Jupyter notebook. There is no JavaScript framework and no build tooling beyond
Quarto itself.

Live at <https://rreho.github.io>.

## Layout

```
_quarto.yml            site config: navbar, footer, theme  ← edit to change navigation
index.qmd              home page
research.qmd           research overview
publications.qmd       publication list
talks.qmd              talks, seminars, posters
about.qmd              biography, education, skills
notes/                NOT PUBLISHED YET — see "Turning notes on" below
  index.qmd            auto-generated listing of all notes (no manual updates)
  _metadata.yml        settings shared by every note
  _template/           copy this folder to start a new note (never published)
  <slug>/index.qmd     one folder per note, with its figures/PDFs/data alongside
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

## Turning notes on

The `notes/` section is written but deliberately not deployed. To publish it,
uncomment two lines in `_quarto.yml`:

- the `notes/**/*.qmd` and `notes/**/*.ipynb` entries under `project: render:`
- the `Notes` entry under `website: navbar: left:`

Then `quarto render`. Until then the folder is ignored by the build and nothing
in it reaches the site.

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

## Adding a publication or talk

Open `publications.qmd` / `talks.qmd`, copy an existing `::: {.pub} ... :::`
block, change the four lines. Newest first. Wrap your own name in
`[R. Reho]{.badge-me}` so it is bold in the list.

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
