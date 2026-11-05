# Digital Versions: Sign in button (01CACCL_AHC:TEST)

Added November 2026. This file lives outside `assets/`, so it is never included in the upload zip.

## What it is

On records with controlled digital files (e.g. the PDF chapters on *Survey of accounting*, `alma991002468199905262`), signed-out users see a lock icon and our Alma label:

> Please sign in to unlock these free PDF chapters for 2 hours. 1 user at a time.

NDE's only Sign In button on the record is far down the page in **Requests**. This customization adds a dark blue **Sign in** button (with NDE's login icon) right under the lock message, and bumps the message to 16px medium text so it matches the Requests sign-in notice.

## How it works

- The button doesn't run its own login. It clicks NDE's Sign In button (`nde-login button`), so people get the normal "Login using" dialog.
- The message is found by its Lock icon (`mat-icon[data-mat-icon-name="Lock"]` inside `nde-view-it-section`), not its wording, so the label can be edited in Alma freely.
- If NDE's Sign In button isn't on the page (signed in), our button is removed.
- A `MutationObserver` re-adds the button when NDE re-renders the record.

## Code

- `assets/js/custom.js`: section *Full record — Sign in button for locked Digital Versions*. Button text and screen-reader label are `BUTTON_TEXT` and `BUTTON_LABEL`.
- `assets/css/custom.css`: section *Record page, signed out: Sign in button under the lock message in Digital Versions*.

## Signed in: View button

Once signed in, NDE replaces the lock message with our CDL label ("You're all set to view this item...") and a **View** button (`button.cdl-button`). CSS only: the button is restyled to match the Sign in button (filled `#003e5a`, 16px bold, 40px tall) and the message is 16px medium. See *Record page, signed in: "View" button for controlled digital files* in `custom.css`.
