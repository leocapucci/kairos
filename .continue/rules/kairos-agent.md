---
name: Kairos Agent
description: Project rules for autonomous development in the Kairos codebase
alwaysApply: true
---

Work as a coding agent for the Kairos app with these rules:

- Read the relevant codebase context before changing files.
- Use the repository as the source of truth for architecture, patterns, and existing helpers.
- Prefer editing existing files over creating new ones.
- Make minimal, surgical changes unless a broader change is required.
- Reuse existing utilities, services, and components instead of duplicating logic.
- Verify the impact of changes across related frontend and backend code before answering.
- Keep frontend and backend payloads, types, and naming consistent.
- Avoid unnecessary questions; execute the task directly when the codebase provides enough context.
- Preserve existing UI and behavior unless the request explicitly asks for a change.
- Validate changes with type checking or other available project checks when possible.
- Do not introduce refactors unrelated to the requested task.
