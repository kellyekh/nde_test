---
name: tdd
description: Test-driven development with a red-gree-refacotr loop. Use when user wants to build feaures or fix bugs using TDD, methions "red-gree-refactor", wants integration tests, or asks for test-first development.
---

# Test-driven development

## Definition of done: E2E is the source of truth

Focused unit and component tests are useful development feedback, but they are
never evidence that a feature is working or complete. Do not describe work as
done, implemented, verified, ready, or working based on focused tests, a build,
typechecking, static review, test discovery, or code review.

A feature is complete only after its real, unmocked end-to-end workflow passes
in full and the repository's required full E2E command passes from the completed
working tree. For this repository, that full command is:

```bash
CI=true npm run test:ci
```

If E2E execution requires a migration, storage bucket, Edge Function, secret,
feature configuration, or other Supabase/environment change that the agent is
not authorized to apply:

1. Stop before claiming completion.
2. Tell the user exactly what must be applied or configured and give them the
   opportunity to do it.
3. Wait for confirmation, then run the affected E2E test through every
   assertion and run the required full E2E command.
4. Do not replace the blocked E2E with mocks, skips, focused tests, inspection,
   or reviewer confidence.

When reporting results, name each command and distinguish focused tests from
E2E. Never say "all tests passed" when an E2E test was skipped, blocked, not
run, stopped before its later assertions, or failed.


## Philosophy

### Core principle
Tests should verify behavior through public interfaces, not implementation details. Code can change entirely, but the tests should not have to change.

### Good tests
These tests excersise real code paths through the application and public APIs. The describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with a valid card" tell you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

### Bad tests
Bad tests are coupled to implementation. They mock internal collaborators, test private methods, or varify through external means (like querying the database directly instead of using the interface). The warning sign: you test breaks when you refactor, but the behavior is still correct. If you rename an interal method and the test fails, those tests were testing implementation, not behavior.

### Anti-pattern: Horizontal slices
**DO NOT WRITE ALL TESTS FIRST THEN ALL IMPLEMENTATION** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code".

This produces bad tests because -
- Tests are written in bulk to test _imagined_ behavior, not behavior that actually exists.
- You end up testing the _shape_ of things (data structures, functionsignatures) rather than user facing behavior
- Test become insensitive to real change - they bass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding implementation


### Correct approach
Vertical slices via tracer bullets. One test -> one implementation -> repeat. Each test reponds to what you learned from the previous cycle. Because you just wrote the code you know exactly what behavior exists and how to verify it.

```
WRONG (horizontal)
  RED: test1, test2, test3
  GREEN: implement1, implement2, implement3

CORRECT (vertical)
  RED: test1
  GREEN: implement1
  RED: test2
  GREEN: implement2
  RED: test3
  GREEN: implement3


### Worflow


####1. Planning

Before writing any code:
- Confirm with user thwat interface changes are needed
- Confirm with user which behaviors to test (prioritize)
- Identify opportunities for refactor
- List behavriod to test (not implementation steps)
- Get user approval on the plan

Ask "what should the public interface look like? Which behaviors are most important to test?" You can also refer to the /testing skill for some details here.

####2. Tracer bullet
Write ONE test that confirms ONE thing about the system

```
RED: Write test for first behavior -> test fails
GREEN: Write minimal code to pass -> test passes
```

This is your tracer bullet - proves the path works

####3. Incremental loop

For each remaninig behavior:

```
RED: Write test for behavior -> test fails
GREEN: Write minimal code to pass -> test passes
```

####4. Refactor

After all tests pass, look for refactor candidates

- List these refactor candidates to the user for approval
- Apply SOLID principals where natural
- Consider what the new code reveals about the old code

**NEVER REFACTOR WHILE RED** Get to GREEN first.

GREEN for a focused test means only that the current development slice can
continue. It does not satisfy the definition of done above.


## Test Types we write

The way we write tests in our codebase is to use the [Playwright](https://playwright.dev/) framework. Playwright is a Node.js library that provides a high-level API for automating Chromium, Firefox and WebKit browsers. We write different types of tests in ourcodebase and they serve diferent purposes:

Happy path: We use Playwite to write end to end tests that simulate user interactions with our application. These tests are used to verify that the application is working as expected and that the user can perform the intended actions. We arranged our codebase around a folder structure that reflects the feature set of the applicaiton, the folders are inside src/pages/ and are structured as -  

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

**WE DO NOT MOCK ANYTHING IN OUR E2E TESTS**

We want our e2e tests to be actual usage of the applicaiton, not mocks of the applicaiton. We do not mock API calls, we do not mock the database, we do not mock the browser, we do not mock anything. When we write a test to test a form, we fill out the actual form, we submit it to the server and we verify in the user interface that the form was submitted correctly. When we write a test to test a button, we click the button and we verify in the user interface that the button was clicked correctly. We do not mock anything.
