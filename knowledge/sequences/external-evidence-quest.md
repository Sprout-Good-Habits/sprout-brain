# Sequence: External Evidence Quest

Use when an outside source should influence the kid program, such as Khan
Academy, Duolingo, a reading app, or a school portal.

Last verified: 2026-06-02

## Steps

1. Create the kid mission surface with a canvas or conversation task.
2. Do not attach direct gem rewards to kid self-report.
3. Define a suggested evidence shape for the home agent.
4. Home agent or parent produces evidence.
5. Create a reviewable submission with `task_complete`.
6. Post or present suggested gems and reasoning.
7. Parent approves with `task_review({ gemsAwarded })`.
8. Update the mission canvas or next mission if the evidence changes the state.

## Default rule

- Child action equals claim or request for check.
- Parent review equals reward decision.
