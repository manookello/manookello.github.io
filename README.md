# manookello.github.io

Personal portfolio for **Amos Odhiambo** — data scientist and ML engineer, Nairobi.

Live at **https://manookello.github.io**

Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework — every
push to `main` publishes directly.

```
├── index.html      # the whole page
├── styles.css      # design tokens, then components
├── script.js       # theme toggle, contact form, footer year
├── assets/         # profile images
└── .nojekyll       # serve files as-is, skip Jekyll processing
```

## The contact form

The form posts to [Web3Forms](https://web3forms.com), which forwards messages to
`amomano41@gmail.com`. GitHub Pages serves static files only, so there is no server to
send mail from — a third-party endpoint is the standard way round it.

**To activate it:**

1. Go to [web3forms.com](https://web3forms.com) and enter `amomano41@gmail.com`.
2. An access key arrives by email.
3. Replace `REPLACE_WITH_WEB3FORMS_ACCESS_KEY` in `index.html` with that key.

Until then the form still works: it validates input and hands off to the visitor's email
client with the message pre-filled, so the section is never a dead end. The email address
and phone number are also shown in plain text beside it.

The form includes a honeypot field that bots fill in and people never see.

## Editing

**Text** lives in `index.html` — projects are `<article class="case">` blocks in the
`#work` section.

**Colour and type** are CSS custom properties at the top of `styles.css`. Both themes are
defined token-level, so changing `--accent` in the two blocks updates the whole page.

**Images**: `assets/amos-640.jpg` and `amos-320.jpg` are square crops served responsively;
`amos-portrait.jpg` is the uncropped figure if a layout ever wants it.

## Local preview

```bash
python -m http.server 8000
```

Then open http://localhost:8000.
