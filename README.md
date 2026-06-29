# rutvik-patel

Personal portfolio site - a single-page, static portfolio styled as a terminal /
telemetry readout. Built to be light, dependency-thin, and host-anywhere.

## Stack

- Vanilla JS + native [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
  for each section (`<hero-section>`, `<research-section>`, `<project-section>`, …)
- Tailwind CSS (CDN) with a custom design-token layer in `static/css/stylesheet.css`
- Lodash for templating (`_.template`)
- JetBrains Mono + Inter via Google Fonts
- Formspree for the contact form endpoint
- No backend, no build step — open `index.html` and it runs

## Layout

```
index.html                       # entry point, mounts the custom elements
static/
  assets/
    data.json                    # all section content (research, projects, …)
    *.gif / *.png / *.jpg        # media referenced from data.json
    clubbed to death.mp3         # opt-in ambient audio
  css/
    stylesheet.css               # all design tokens, layout, components
  html/
    *.html                       # per-section templates (loaded by web components)
  js/
    *-section.js                 # one custom element per section
    script.js                    # global wiring (smooth scroll, audio, nav, etc.)
    template-loader.js           # fetch + cache for the html templates
.github/
  CODEOWNERS
```

## Sections

| §  | Section    | Source                                |
| -- | ---------- | ------------------------------------- |
| 01 | Hero       | `static/html/hero-section.html`       |
| 02 | About      | `static/html/about-section.html`      |
| 03 | Research   | `static/html/research-section.html`   |
| 04 | Projects   | `static/html/project-section.html`    |
| 05 | Industry   | `static/html/industry-section.html`   |
| 06 | Personal   | `static/html/personal-section.html`   |
| 07 | Contact    | `static/html/contact-section.html`    |

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Any static-file server works (`npx serve`, `caddy file-server`, etc.) — the page
fetches `static/assets/data.json` and the per-section templates over HTTP, so
opening `index.html` directly via `file://` will fail in browsers that block
cross-origin fetches from local files.

## Editing content

Most copy and structured data lives in `static/assets/data.json`:

- `hero-section` — title and subtitle shown on the landing screen
- `about-section` — about copy, skill chips, education / experience / research blurbs
- `research-section[]` — publications (rendered as the Telemetry table)
- `project-section[]` — personal projects
- `industry-section[]` — industry engagements
- `personal-life[]` — Beyond Robotics cards
- `contact-section` — channels list + form labels

Section-specific tweaks (headings, the §-numbering, table columns) live in the
corresponding `*.html` template under `static/html/`.

## Notes

- The page uses a custom dynamic-loading tracker (`window.dynamicComponentTracker`)
  to run global init only once every section component is mounted.
- The contact form posts to a Formspree endpoint (see `static/js/contact-section.js`);
  replace the URL if forking.
- Ambient audio is strictly opt-in — browsers block audio without a user gesture
  on both desktop and mobile.
