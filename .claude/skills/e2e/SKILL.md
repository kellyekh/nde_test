---
name: e2e
description: Toolkit and description of how we use end to end tests in our codebase and how you should write end to end tests in general in our codebase.
---

# Overview

We use end to end tests to test the "happy path" of our application. The happy path is meant to describe the ideal process, without any exceptions, errors or edge cases. We use Playwright to write end to end tests for our application. Our tests follow a similar structure to the following:

1. Open the page that is being tested
2. Perform actions on the page
3. Verify the expected results

An example test is as follows:

```js
test("Emails page should render", async ({ page }) => {
  await page.goto("/emails");

  await expect(page.getByRole("heading", { name: "Emails" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Email" })).toBeVisible();
  await expect(page.getByText("Name")).toBeVisible();
});
```

This test does not have any interactions but it does verify that the page renders correctly. Here is a full example with interaction:

```js
test("contacts test adding individual", async ({ page }) => {
  const lastName = "Test" + new Date().toISOString();
  const email = `john${Math.random().toString(36).slice(2, 7)}@example.com`;
  const phone = "17285343191";
  const address = "531 Wick Lane" + new Date().toISOString();

  await page.goto("/contacts");

  await page.getByTestId("modal-open-button").click();
  await page.getByTestId("firstName").click();
  await page.getByTestId("firstName").fill("John");
  await page.getByTestId("firstName").press("Tab");
  await page.getByTestId("lastName").fill(lastName);
  await page.getByTestId("lastName").press("Tab");
  await page.getByTestId("email").fill(email);
  await page.getByTestId("email").press("Tab");
  await page.getByTestId("phone").fill(phone);
  await page.getByTestId("phone").press("Tab");
  await page.getByTestId("streetAddress").fill(address);
  await page.getByTestId("streetAddress").press("Tab");
  await page.getByTestId("city").fill("Testland");
  await page.getByTestId("city").press("Tab");
  await page.getByTestId("state").selectOption("14");
  await page.getByTestId("state").press("Tab");
  await page.getByTestId("country").selectOption("2");
  await page.getByTestId("country").press("Tab");
  await page.getByTestId("postalZip").fill("12345");
  await page.getByTestId("submit").click();

  await page
    .getByText("Contact created! well done.")
    .waitFor({ state: "visible" });
});
```

## Conventions to follow

### Real end-to-end behavior

Do not mock application API calls, database behavior, payment processors,
browser behavior, or email/receipt delivery in E2E tests. Exercise the real
workflow through the user interface and verify the user-visible persisted
outcome. A browser test that replaces those boundaries is an integration or
component test, not an E2E test.

### Required completion verification

Targeted E2E runs are development feedback only. Before describing a completed
code change as ready for review, run the repository's exact local CI gate:

```bash
CI=true npm run test:ci
```

Before describing it as ready to merge, confirm GitHub passed the same gate for
the commit that will be merged. Test discovery, targeted tests, linting, or a
previous commit's CI result do not satisfy this requirement. If the full gate
has not passed, state that verification remains incomplete.

### Simplicity

We want to keep tests as simple as possible but we also want to make sure that we are testing the right things. A super simple test that doesn't really test anything is not useful. 

### Element selectors

We try to use element selectors that mirror the way a user woudq like to interact with the page when possible. For example when we are trying to target an element with specific text we use the `getByText` selector if possible. This isn't always possible becasue sometimes there are multiple elements with the same text. In this case we use the `getByRole` selector. If we also cannot use the `getByRole` selector we use `getByTestId` which is a unique identifier for the element.
