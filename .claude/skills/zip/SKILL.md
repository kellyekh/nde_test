---
name: zip
description: Zip the Primo NDE customization package (the assets folder inside a top-level 01CACCL_AHC-TEST folder) into 01CACCL_AHC-TEST.zip on the Desktop, ready to upload to Primo. Use when the user asks to zip, package, or build the upload file for Primo.
---

Build the Primo NDE customization package zip for the **01CACCL_AHC-TEST** view.

## What the zip must look like

Primo expects one top-level folder named after the view code, with the `assets` folder inside it:

```
01CACCL_AHC-TEST.zip
└── 01CACCL_AHC-TEST/
    └── assets/
        ├── css/
        ├── header-footer/
        ├── homepage/
        ├── html/
        ├── icons/
        ├── images/
        └── js/
```

Only `assets/` goes in. Never include `.claude/`, `README.md`, `showDirectives.txt`, `featured-collection.md` (that file lives in the `kellyekh/homepage-content` GitHub repo), any other root-level files, or macOS junk (`.DS_Store`, `__MACOSX`).

## Steps

1. Run from the Desktop so the paths inside the zip start with `01CACCL_AHC-TEST/`. Remove any old zip first so stale files don't linger:

   ```bash
   cd /Users/kellyecohn/Desktop && rm -f 01CACCL_AHC-TEST.zip && zip -rq 01CACCL_AHC-TEST.zip 01CACCL_AHC-TEST/assets -x "*.DS_Store" "*__MACOSX*"
   ```

2. Verify the contents with `unzip -l /Users/kellyecohn/Desktop/01CACCL_AHC-TEST.zip`, and check that:
   - every path starts with `01CACCL_AHC-TEST/assets/`
   - nothing outside `assets/` and no `.DS_Store` slipped in
   - `assets/js/custom.js` and `assets/homepage/homepage_en.html` are present

3. Flag anything suspicious, but still build the zip:
   - zero-byte files (for example, an empty `custom_icons.svg` overrides no icons)
   - files Primo won't recognize by name (for example, the footer should be `footer_en.html`, not `footer.html`)
   - the zip getting close to Primo's upload size limit

   Known and accepted, so don't flag them: the empty `assets/icons/custom_icons.svg` and the footer being named `assets/header-footer/footer.html`.

4. Report the zip's location (`~/Desktop/01CACCL_AHC-TEST.zip`), its file count and size, and any warnings. Remind the user how to upload it: in Alma, go to **Configuration → Discovery → Display Configuration → Configure Views**, edit the **01CACCL_AHC:TEST** view, open the **Manage Customization Package** tab, upload the zip and click **Save**.

Do not upload or submit the zip to Primo yourself unless the user explicitly asks in this conversation.
