# Allan Hancock College Library — Primo NDE customization

Customization package for the Allan Hancock College Library's **Primo NDE** test view, **01CACCL_AHC:TEST**.

This repository uses Ex Libris's **customization package** approach: plain CSS, JavaScript and HTML in an `assets` folder that is zipped and uploaded to Alma. (It does not use the Angular-based [customModule](https://github.com/ExLibrisGroup/customModule) development environment.)

**View:** [01CACCL_AHC:TEST](https://caccl-ahc.primo.exlibrisgroup.com/nde/home?vid=01CACCL_AHC:TEST)

The live NDE view may not be fully in sync with this repository while customizations are being developed and tested.

## Repository layout

```
01CACCL_AHC-TEST/          The view. Its name must match the view code, because it becomes
│                          the top-level folder in the upload zip.
├── assets/                Everything Primo loads (this is the only part that gets uploaded)
│   ├── css/custom.css         Site-wide styling
│   ├── js/custom.js           Site-wide behavior (book slider, Requests section, etc.)
│   ├── homepage/              Homepage HTML (homepage_en.html), styles and background
│   ├── header-footer/         Footer HTML
│   ├── html/                  Custom HTML snippets
│   ├── icons/                 favicon.ico and custom_icons.svg (icon overrides)
│   └── images/                Library logo, footer logo, loading animation
└── config.json            Add-on configuration (chat queue/snippet, icon colors)

backups/                   Earlier snapshots of the view's package
docs/                      Notes and reference material (never uploaded)
├── customization-package-guide.md   Ex Libris's guide to the assets folder structure
├── requests-section-customizations.md
└── showDirectives.txt
design/                    Source logos and SVGs; drafts/ holds older homepage background versions
```

## Updating the view

1. Edit files in `01CACCL_AHC-TEST/assets/`.
2. Build the upload zip from this folder so the zip's top level is `01CACCL_AHC-TEST/assets/`, without system files:

   ```bash
   zip -r ../01CACCL_AHC-TEST.zip 01CACCL_AHC-TEST/assets -x "*.DS_Store" "*__MACOSX*"
   ```

   (In Claude Code, the `/zip` skill does this and checks the result.)
3. In Alma: **Configuration → Discovery → Display Configuration → Configure Views** → edit **01CACCL_AHC:TEST** → **Manage Customization Package** → upload the zip → **Save**.
4. Check the view, then commit and push:

   ```bash
   git add .
   git commit -m "Describe the change"
   git push
   ```

## Related repositories

- [kellyekh/slider](https://github.com/kellyekh/slider) — `books.md`, the book list for the homepage's "Check out something new" slider. `custom.js` fetches it at page load, so editing that file updates the slider without re-uploading the package.
- [kellyekh/homepage-content](https://github.com/kellyekh/homepage-content) — `featured-collection.md`, content for the homepage's Featured Collection box.

## Development notes

### NDE is a single-page app
Homepage content can mount, unmount and remount as people navigate without a full page reload, so code can't rely on a single load event. `custom.js` uses a `MutationObserver` to set up (and tear down) the book slider whenever its markup appears or disappears.

### Loading content from GitHub
Raw GitHub URLs (`raw.githubusercontent.com`) are CORS-enabled for public repositories, so `custom.js` can fetch Markdown from them directly with `fetch()`, with no proxy. If a source repo's branch name or file path changes, update the URL in `custom.js`.

### Known quirks we've accepted
- `assets/icons/custom_icons.svg` is empty, so no default icons are overridden.
- The footer file is named `footer.html` rather than Ex Libris's `footer_en.html` convention.

### Labels vs. styling
Text such as `nui.request.signin_additional` is edited as a label in Alma; this repository only controls how it looks. See `docs/requests-section-customizations.md` for the Requests section.
