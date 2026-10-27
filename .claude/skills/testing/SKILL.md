---
name: testing
description: Toolkit and description of how we use testing in our codebase and how you should write tests in general in our codebase.
---

# Overview

## E2E completion gate

End-to-end tests are the source of truth for whether application behavior works.
Unit and component tests may guide development and improve coverage, but their
success never makes work complete.

Do not report a feature as done, implemented, verified, ready, or working until:

1. Every affected real, unmocked E2E workflow passes through all assertions.
2. No relevant E2E test is skipped, blocked, or only partially executed.
3. The completed working tree passes the repository's full E2E command:

   ```bash
   CI=true npm run test:ci
   ```

If an E2E test depends on an unapplied Supabase migration, storage bucket,
Edge Function, secret, or environment configuration, stop and give the user the
exact prerequisite and a chance to apply it. After the user confirms, resume
the E2E and full-suite runs. Never apply Supabase changes without authorization,
and never substitute mocks, skips, focused tests, build success, static review,
or code-review approval for the blocked E2E.

Verification reports must state the exact commands and outcomes. Use wording
such as "focused tests passed; E2E verification is pending" when appropriate,
and never summarize that state as "all tests passed" or "done."

The way we write tests in our codebase is to use the [Playwright](https://playwright.dev/) framework. Playwright is a Node.js library that provides a high-level API for automating Chromium, Firefox and WebKit browsers. We write different types of tests in ourcodebase and they serve diferent purposes:

1. Happy path: We use Playwite to write end to end tests that simulate user interactions with our application. These tests are used to verify that the application is working as expected and that the user can perform the intended actions. We arranged our codebase around a folder structure that reflects the feature set of the applicaiton, the folders are inside src/pages/ and are structured as -  

- communications - for email and postal communications as well as communications automations
- configuration - for user selectable configurations of the application
- contactdetailspage - for the contact details page which also includes a modal that can be used to create a donation for that contact
- contacts - for the contact listing page
- donations - This is the main folder for the donations functionality, these donations can either be added through a batch entry workflow or through the donation page. There is also a listing of all the transactions for that user
- profile - For the user's profile page
- reciepts - For the receipts functionality. There is a lof ot functionality here so if you are making changes to the reeipts functionality we have created a separate skill for that which will be referenced in the prompt.
- reports - For the reports functionality. Again there is a lot of functionality here so we have created a separate skill for that which will be referenced in the prompt.
- taskspage - Where tasks that can be assigned to users are listed and created

  End to End tests are inside the folder for the area of the application that is being tested and inside a /test/e2e/ folder. For example, the end to end tests for the emailspage page are inside the /src/pages/communications/email/emailspage/test/e2e/ folder.

2. Unit tests: For all other paths that are not happy path we use Playwright to write unit tests. These tests are used to verify that the code is working as expected and that the functions are behaving as expected when something goes wrong or for edge cases. 

## Test coverage

We use Playwright to also show test coverage for our codebase. We have a goal of 100% test coverage across all the codebase which we are in the process of achieving. We want you to get as close to 100% test coverage as possible within reason.

## Test naming

We use the following naming convention for our tests:

1. For end to end tests we use the following naming convention:

```
{component name}.e2e.spec.js
```

2. For unit tests we use the following naming convention:

```
{component name}.spec.js
```

## Simplicity rules — MUST follow

These rules exist because overly complex tests break frequently and are hard to fix. Always prefer the simpler approach:

### 1. Use `page.getByText()` for clicks whenever the text is visible

For buttons and MUI Select options, click the visible text directly — do NOT use `getByTestId` or `getByRole` unless `getByText` is genuinely ambiguous.

```js
// WRONG — too specific, brittle with MUI
await page.getByTestId("sizeOfDonationMode").click();
await page.getByRole("option", { name: "Greater than" }).click();

// RIGHT — click exactly what the user sees
await page.getByText("Within Range").click();
await page.getByText("Greater than").click();
```

### 2. Keep each test self-contained

Repeat the setup steps (open modal, click filter button, etc.) inside each test. Do NOT extract those steps into helper functions — helpers make tests harder to read and debug.

```js
// WRONG — hides what the test is actually doing
async function openSizeFilter(page) { ... }

// RIGHT — just repeat the two lines
await page.getByText("Add to List").click();
await page.getByText("Size of single donation").click();
```

### 3. `beforeEach` does navigation only

```js
test.beforeEach(async ({ page }) => {
  await page.goto("/lists/22");
});
```

Nothing else belongs in `beforeEach`.

### 4. Assert the outcome, not the count

When verifying that a filter updated the contact count, just check the label appears — do NOT assert a specific number, since test DB data can change.

```js
// WRONG — brittle, breaks when DB changes
await expect(page.getByText("Number of Contacts: 3")).toBeVisible();

// RIGHT — just verify the count section rendered
await expect(page.getByText(/Number of Contacts/)).toBeVisible({ timeout: 10000 });
```

### 5. One meaningful assertion per test

Each test should end with a single `expect` that captures the key outcome. Don't chain multiple assertions unless you're explicitly testing multiple states in sequence (e.g., showing then hiding an element).

### 6. Use `data-testid` only for inputs you need to fill or elements with no unique text

For form inputs (`fill`, `blur`), `locator("#id")` or `getByTestId` is fine. For anything the user clicks, prefer `getByText`.

### 7. Assert user-visible success, not network implementation details

For happy-path e2e tests, do NOT use REST calls, GraphQL calls, RPC responses, or `page.waitForResponse()` as the main proof that an action succeeded. Assert the outcome the user sees, such as a success toast, updated row, changed page content, or navigation. Network waits are allowed only when they are incidental synchronization and the final assertion is still user-visible.
