---
name: writeAPrd
description: Create a PRD through user interview, codebase exploration, and code design, then submit as a Linear Initianitve. Use then the user wants to write a PRD, create a product requirements document, or plan a new feature.
---

This skill will be invoked when the user wants to create a PRD. You may skip steps if you don't consider them necessary.

1. As the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions.

2. Explore the repo to verify their assertions and understand the current state of the codease.

3. Interview the user relentlessly about every aspect of this plan until you reach a shared understanding, resolving each branch of the decision tree resolving dependencies between decisions one-by-one.

4. Sketch out the major modules or components you will need to build or modify to complete the implementstion. Actively look for opportunities to extract deep modules that can be tested in isolation. A deep module ( as opposed to a shallow one) is one which encapsulates a lot of functinlity into a simple, testable interface that rarely changes. Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

5. Once you have a complete understanding of the problem and solution, use the template below to write the PRD. The PRD should be submitted as a Linear Initiative.

<prd-template>

## Problem Statement

The problem that the user is facing from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## Expected Results

How we expect that this solution will affect the user and our applicaiton.

## Key Metrics

What are the key metrics that we will use to measure the success of this solution?

## Dependencies

What other solutions or features are required to implement this solution?

## User Stories

A list of user stories that describe the solution in detail. A user story is a concise, non-technical explanation of a software feature written from the perspective of an end-user, focusing on the value a functionality provides. Used in Agile development, they follow the format: "As a [type of user], I want to [perform an action] so that I can [achieve a goal]".