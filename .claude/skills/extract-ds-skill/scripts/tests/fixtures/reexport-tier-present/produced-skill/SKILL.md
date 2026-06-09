---
name: produced-skill
description: Test fixture — produced-skill mode with a populated `## Other re-exports` section in components.md. Locks the contract that the new section heading is accepted by the post-emit shape check.
---

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| ExampleButton asks | references/components.md | single-file components mode |
| user asks for a component not in the routing table above | references/components.md `## Other re-exports` | thin wrappers — props live in the upstream types file named under each entry |

In scope: tokens, assets, component descriptions, component APIs.
