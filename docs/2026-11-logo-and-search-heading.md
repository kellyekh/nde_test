# Header logo and OneSearch heading (2026-11)

Design changes made on 2026-11-10. The code is done and saved in this folder. It has not been zipped or uploaded yet.

## What changed

### 1. Header logo: AHC emblem + "Library"
- `01CACCL_AHC-TEST/assets/images/library-logo.png` is now the AHC emblem (the circle, without the "AHC" letters) with "LIBRARY" in navy condensed caps. Ex Libris requires a PNG with this exact name in the images folder.
- It is a transparent PNG at 993x278 px (about 5x its display size), so it stays sharp on high-resolution screens. Shown 56px tall, it is about 200px wide.
- This replaced an earlier version from the same day (AHC monogram + "LIBRARIES", 909x224), which is kept in `design/library-logo-monogram.png`.
- `custom.css`, the "Header logo" rule near the top: shown 56px tall in Primo's 78px header. The logo's link is stretched to the logo's height so the keyboard focus outline wraps the whole logo.
- `custom.css`, the rule right after "Header logo": 40px of space between the logo and the menu links (New Search, Help, ...) from 600px up. Before this the links started right at the logo's edge. Phones are unchanged.
- `custom.css`, the "Phone header" rule (max-width 599px): the logo shrinks to fit, at most 44px tall and `100vw - 205px` wide.

### 2. OneSearch heading: search badge
- `custom.css`, the rule after the "OneSearch title" rules: the heading is larger (28px on phones, 36px from 600px up) and keeps its regular weight.
- A light-blue circle (#B3C5CE, the same color as the homepage tile icons) with a navy search icon sits to the left: 40px on phones, 48px from 600px up.
- The badge is a CSS background image, so screen readers still announce just "OneSearch".

## Backups and source files (`design/`)
| File | What it is |
| --- | --- |
| `library-logo-original.png` | The original 289x40 logo (fuzzy) |
| `library-logo-sharp-hancock.png` | "Hancock \| Libraries" rebuilt sharp at 4x. Use this to go back to the old design without the blur. |
| `library-logo-source.svg` | Vector master of the sharp Hancock version |
| `library-logo-monogram-source.svg` | Vector master of the new monogram logo |
| `library-logo-library.png` | Copy of the installed emblem + "LIBRARY" logo (993x278). No vector source is in this folder. |
| `library-logo-monogram.png` | The AHC monogram + "LIBRARIES" logo (909x224), rendered from the SVG above. Installed briefly on 2026-11-10, then replaced. |
| `library-logo-hancock-2026-11-10.png` | The "Hancock \| Libraries" logo that was in `assets/images` before the monogram was installed |

To roll back the logo: copy a backup over `assets/images/library-logo.png`, then set `nde-logo img` back to `width: 253px; height: auto` in `custom.css` (and `width: min(253px, calc(100vw - 205px))` in the phone rule).

Note: the monogram PNG and its CSS were installed later on 2026-11-10. Earlier that day the folder still had the Hancock logo at 253px wide, even though this doc already described the monogram.

## Before going live
- [ ] Load the package into the 01CACCL_AHC-TEST view and check the header and the search banner on desktop and on a phone.
- [ ] Phones: check that the OneSearch heading lines up with the left edge of the search box. The first TEST upload showed it about 28px too far right: Primo's own stylesheet caps the heading at `max-width: 85%` and centers it. Fixed on 2026-11-10 with `max-width: none !important` on `.custom-search-bar-container h1` (tablet and desktop were already aligned and are unchanged). The "What am I searching? | Ask a librarian" links also lost their 16px left padding, so they line up too, on the homepage and on results pages. Re-check after the next TEST upload.
- [ ] Get Campus Graphics / Public Affairs approval for the new logo lockup. The brand guide requires it for department lockups. Contact: Robert Nourse, rnourse@hancockcollege.edu, ext. 3249.
- [ ] Confirm the larger OneSearch heading with library staff, who asked for regular weight earlier.

## Design references
- Mockups: the "Hancock Libraries Logo" design canvas (artboards for logo options and OneSearch heading options).
- Write-up: the "Hancock Libraries Logo Options" doc.
- Brand: Hancock College Brand Standards Guide (pp. 10–12 for logos and lockups). Hancock Midnight is #003E5A.
