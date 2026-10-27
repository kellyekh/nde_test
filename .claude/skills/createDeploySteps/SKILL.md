---
name: create deploy steps
description: using the environment that I describe and the work we just did in the current branch create a .md file for me with the steps I need to take to deploy my code to production.
---

# Environment
I use a separate project in Supabase for staging and a separate one for production. When we make changes or write code for things like RPCs or Edge Functions I need to move that code from my staging project to my production one. Here are the ways I handle different parts of the code and how I need you to give me the steps for deploying that code -

1. RPCs - In Supabase I often make use of RPCs and I need to deploy them from one project to the other. I do not use the local Supabase database so for RPCs specifically I need you to list the migration file I need to copy the code out of so that I can paste it into the Supabase SQL Editor UI.
2. Edge Functions - I do use the Supabase CLI to deploy Edge Functions so I need you to list for me the Edge Functions that changed and need to be deployed as part of the code changes going live.
3. Front End Changes - I need you to list for me what changes will be in the Front End Branch that we deploy as well as the branch name
4. Django Back End Changes - If we made changes to the Django back end I nedd you to list for me the changes that will be in the back end branch as well as the branch name

# Writing the document
I want you to create a .md file named for the Linear initiative we are working on, so if the initiative is "migrating donations to Supabase" you should create a migrating-donations-to-supabase.md file that lists all the things noted above in the environment section. The document can be put in the Supabase folder.