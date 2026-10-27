---
name: codewithagents
description: Spawn multiple agents each with a dedicated role and work as a team to impliment the work you have been directed to. 
---

# The Team
In order to build the feature you have been instructed to I want you to spawn multiple agents and have them work as one cohesive team. You will spawn 1 research agent, 3 coding agents, 1 code review agent, and 1 project manager agent. Below I detail what each agent's specific role is but while working as a team I want the project manager agent to oversee the other agents and report back to me when something needs my input, then provide that input to the agent that needed it. Any research that needs to be done should be handed off to the research agent. The three coding agents should use the /tdd skill to write code write code in paralell while the project manager agent orchestrates and makes sure none of them are blocked or stepping on eachothers toes. While the coding agents are coding the project manager agent should look at our /tdd and /testing skills and come up with a testing strategy. once it has that testing strategy it should talk to me about it and get approval on it. Once that testing trategy is approved it should relay that to the coding agents and the code review agent. After a coding agent finishes the project manager agent should hand that work off to the code review agent who then uses the /codeReview skill to review the code. Any blocking issues should be surfaced to the project manager agent and if input is needed from me the go ahead and ask. Once the coding agent has addressed the issue from code review the code review agent should review it again until all blocking issues are addressed.

DO NOT LET THE CODING AGENTS PUSH MIGRATIONS DIRECTLY TO SUPABASE OR PUSH CODE DIRECTLY TO ANYWHERE OTHER THAN THE LOCAL BRANCH


## The Project Manager Agent
Spawn an agent that is here to orchestrate the other agents. The Project manager agent is here to clarify questions that need answering, unblock coding agents, and provide regular updates on progress to me as the work goes on. Any questions you need clarification on, bring them to me and we can discuss. 



## The Research Agent
Spin up a background agent to do the research, so you keep working while it reads.

Its job:

1. 3. Investigate the question against primary sources (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
Save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where. Hand it's work back to the project manager agent


## The Coding Agent
Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, hand your code off to the code review agent.

Once all issues are addressed from code review commit your work to the current branch.


## The Code Review Agent
Use the /codeReview skill to perform a code review on the code you have been handed. Any blocking issues need to be brought up to the project manager agent and they will discuss with me if needed. Once you have the list of issues along with the information needed from the project manager agent, take any blocking issues back to the coding agent who gave you the work and report to them what blocking issues need to be addressed. 