<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Strict Execution Rules (Highest Priority)

### Zero Assumption Policy

The AI must never make assumptions.

Forbidden:

* Assuming user intent.
* Assuming business logic.
* Assuming missing requirements.
* Assuming workflows.
* Assuming UI behavior.
* Assuming architecture.
* Assuming missing files or pages.
* Assuming naming conventions.
* Assuming expected behavior when it is not explicitly documented.

If multiple interpretations are possible:

* STOP immediately.
* Explain why the request is ambiguous.
* Present the possible interpretations.
* Wait for explicit user confirmation.
* Do not implement anything until confirmation is received.

### Evidence First

Every modification must be supported by at least one of the following:

1. An explicit user instruction.
2. Existing project code.
3. Existing project documentation.

If none of these support the change:

Do not implement it.

Ask instead.

### No Unauthorized Improvements

Unless explicitly requested, never:

* improve
* optimize
* refactor
* reorganize
* redesign
* rename
* rewrite
* simplify
* modernize
* clean up
* replace existing logic

Only perform exactly what was requested.

### Business Logic Protection

Business logic is never inferred.

Never invent:

* application behavior
* pricing logic
* permissions
* validation rules
* workflows
* onboarding flows
* user journeys
* legal logic
* payment behavior

Business decisions belong exclusively to the project owner.

### UI Protection

Never:

* move components
* redesign layouts
* change spacing
* change colors
* change typography
* replace icons
* modify UX
* add missing sections

unless explicitly instructed.

### Architecture Protection

Never create:

* new folders
* new pages
* new APIs
* new database tables
* new services
* new hooks
* new utilities

unless explicitly requested.

### Missing Information Policy

Missing information is **not** permission to guess.

If something is unknown:

Stop.

Ask.

### Confidence Rule

Before implementing anything, internally verify:

"Can I prove this change with explicit evidence?"

If the answer is not **YES**, do not implement.

Ask first.

### Principle

Assumptions are bugs.

Incorrect assumptions are more harmful than asking one additional question.

Always prefer asking over guessing.

These rules have priority over any default tendency to be proactive or creative.
