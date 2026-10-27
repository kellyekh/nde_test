# Requests Section Customizations (01CACCL_AHC:TEST)

Notes on the customizations made to the **Requests** section of the full record page in Primo NDE, October 2026. This file lives outside `assets/`, so it is never included in the upload zip.

All of the code is in two files:

- `assets/js/custom.js`
- `assets/css/custom.css`

Every section uses the same look so the Requests area reads as one design: a light blue-grey panel (`#e6eef2`, 8px rounded corners), 16px text in `#1b1b20`, and dark blue buttons (`#003e5a`, hover `#002a3d`) with a 16px bold white label.

---

## 1. Sign-in notice (signed out)

**What it is:** NDE's "Please sign in to check if you can request this item." notice, with a filled dark blue **Sign in** button.

**Label:** `nui.request.signin_additional`. Edit the wording in Alma; the styling follows automatically.

**Code:** CSS only. In `custom.css`, see the section headed *Record page: "Please sign in to check if there are additional request options"*. The rules are scoped to the notice that contains the Login icon, so other notices aren't affected.

## 2. Request cards (signed in)

**What it is:** NDE's request cards, restyled to match the sign-in notice.

**Code:** CSS only. In `custom.css`, see *Record page, signed in: Request card in the Requests section*.

## 3. "Check for Online Access" step cards (signed in or out)

**When it shows:** on any record whose availability status is "Check for Online Access".

**What it shows:**

> **Didn't find what you need online?**
>
> **STEP 1:** Search Google Scholar for availability.
> If there are no results there, go to Step 2. → **[Search Google Scholar]**
>
> **STEP 2:** Request it from another library.
> Fill out our Interlibrary Loan (ILL) form to request a copy. → **[Open ILL Form]**

- **Search Google Scholar** searches Google Scholar for the record's exact title. The title is read from the availability button's aria-label: "Check for Online Access (Title)".
- **Open ILL Form** goes to https://www.hancockcollege.edu/library/request-a-book.php.
- Both open in a new tab.

**Code:** `custom.js` section *Full record — "Check for Online Access" steps in Requests*, plus the matching `custom.css` section.

**To change it:**

| What | Where in `custom.js` |
|---|---|
| Status that triggers the cards | `STATUS_TEXT` (must match the label `delivery.code.no_inventory`) |
| Heading | `INTRO_TEXT` |
| Step wording and button text | the two `buildStep(...)` calls in `buildSteps()` |
| ILL form link | `ILL_URL` |

**Note:** the wording is in the code, not in an Alma label. Editing labels won't change these cards.

## 4. "No available request options" notice (signed in)

**When it shows:** signed in, on a record with no request options at the title level. Individual copies may still be requestable under **Locations → View Items**, which is why the wording was changed.

**What it shows:** the wording depends on how many copies the Locations section lists. Some locations show "(N copies, N available, N requests)"; a location without that summary counts as one copy.

| Copies | Wording |
|---|---|
| 2 or more | There are no request options for this title as a whole, but some copies may still be requestable — open View Items under Locations above to check. |
| 1 | There are no request options for this item right now. See its status under Locations above. |
| 0, or no Locations section (online items like PDFs) | There are no request options for this item. |

Every version ends with:

> If you believe there is an error, please **let us know**.

- **let us know** opens NDE's **Give Us Feedback** dialog, the same one as the "!" button in the bottom-right corner (Report a Broken Link / Report a Search Issue / Other Catalog Issue).
- If that button isn't on the page, the link goes to the Ask a Librarian page instead: https://www.hancockcollege.edu/library/ask-a-librarian.php.

**How it works:** NDE renders its message as
`<div translate="nde.request.noRequests" data-qa="nde.request.noRequests">`.
NDE keeps resetting that div's text from the label, so rewriting the text doesn't stick. Instead, the code hides NDE's div and adds its own notice right after it. The code finds the div by its `data-qa` attribute, so the label's wording in Alma doesn't matter.

**Code:** `custom.js` section *Full record — "No available request options" notice in Requests*, plus the matching `custom.css` section.

**To change it:**

| What | Where in `custom.js` |
|---|---|
| Wording for 2+ copies | `NOTICE_MANY_COPIES` |
| Wording for 1 copy | `NOTICE_ONE_COPY` |
| Wording for 0 copies / online | `NOTICE_NONE` |
| How copies are counted | `copyCount()` |
| "let us know" sentence | the `help.append(...)` line in `buildNotice()` |
| Fallback link | `CHAT_URL` |

---

## Related Primo labels

Edit these in Alma under **Configuration → Discovery → Display Configuration → Labels**. Search by the label code.

| Label code | Current text | Notes |
|---|---|---|
| `nui.request.signin_additional` | Please sign in to check if you can request this item. | Signed-out notice (section 1) |
| `nde.request.noRequests` | No available request options | Hidden by custom.js and replaced (section 4) |
| `delivery.code.no_inventory` | Check for Online Access | Triggers the step cards (section 3); keep `STATUS_TEXT` in sync |
| `nui.locations.noitems.signin` | We couldn't find any items to display for this location… | Locations section, signed in |
| `nui.locations.noitems.guest` | We couldn't find any items to display for this location. Please sign in above… | Locations section, signed out |
| `nde.getit.noitems.message` | No items were found in this location. You may place a request via one of the following options: | Similar wording; not seen on these pages |

---

## Gotchas and tips

- **Labels can override what you type into an element.** If an NDE element has a `translate="..."` attribute, NDE resets its text from the label. Hide the element and add your own after it instead of rewriting its text.
- **Claude can't see signed-in views.** To check signed-in markup, sign in, open the browser console (Chrome: **View → Developer → JavaScript Console**) on the record, and run:

  ```js
  copy(document.querySelector('nde-requests')?.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g,'') || 'no nde-requests found')
  ```

  This copies the Requests section's HTML to your clipboard. Make sure the Sign in button is gone first. If it's still there, the tab isn't signed in.
- **NDE is a single-page app.** Records can re-render without a page reload, so each customization uses a MutationObserver to reapply itself.
- **After uploading,** do a hard refresh (Cmd+Shift+R) before checking changes.
- **Test records:**
  - Check for Online Access: *Reflections on Voice: Women, Poetry, and Power—Xhosa and Zulu Considerations* (`cdi_cambridge_journals_10_1017_asr_2026_10260`)
  - No request options, signed in: *Elementary statistics* (`alma991002403015005262`)
  - No request options, signed in (from a "pachinko" search): *The best women's monologues from new plays, 2020* (`alma991002440283005262`)
  - Single physical copy ("1 copy" in Locations): *Undocumented lives : the untold story of Mexican migration* (`alma991002027329705262`)
- **Design reference:** the UT School of Dentistry Library NDE view (`01TEXASHEALTH_UTXDENTISTRY:LMM_NDE`). It puts its step text in `nui.request.signin_additional` and uses Alma General Electronic Services for its links.

---

## Packaging and upload

1. Ask Claude to zip the package, or run `/zip`. This builds `~/Desktop/01CACCL_AHC-TEST.zip` containing `01CACCL_AHC-TEST/assets/…` only.
2. In Alma, go to **Configuration → Discovery → Display Configuration → Configure Views**.
3. Edit **01CACCL_AHC:TEST**, open the **Manage Customization Package** tab, upload the zip and click **Save**.
4. Hard-refresh a test record and check both signed-out and signed-in views.

Known and accepted (the zip skill doesn't flag these): `assets/icons/custom_icons.svg` is empty, and the footer file is named `assets/header-footer/footer.html`.
