---
role: user
phase: 2
---

This UI must be built with Primer React (`@primer/react`).

Build a GitHub-style "Invite members" flow for an organization. Edit `app/page.tsx` and add the composition under `components/showcase/invite-members.tsx` (`"use client"` on both).

## Page anatomy

A medium page title "Invite members to vercel-labs" with a muted subtitle ("Invited members get access to the organization's repositories according to their role."), above a card surface.

## Invite card

**Seat warning** at the top: an attention-tone callout — "Your plan has 2 of 25 seats remaining. Inviting more than 2 members will upgrade your plan automatically."

**Invite form** (each field properly labelled):

- **Username or email** (required) — single-line input with a leading person icon, placeholder `octocat or name@company.com`, caption "Separate multiple invitees with commas."
- **Role** — select with options Member, Moderator, Owner, Billing manager. Caption: "Owners have full administrative rights to the organization."
- **Add to teams** — three checkboxes: "design-systems" (checked), "docs", "infra". Each with a muted caption stating the team's repo count, e.g. "12 repositories".
- **Personal note** — multi-line textarea, 3 rows, vertically resizable, placeholder "Add an optional message to the invitation email…".

**Pending invitations**: a small section heading "Pending" with a neutral counter badge "3". Three pending rows. Each row: the invitee handle in regular text, muted small text with the invite age ("sent 2 days ago"), a role status pill (`member` neutral/secondary tone, `owner` danger tone, `billing` accent tone), an accented counter badge with the reminder count on one row, and two right-aligned icon-only controls — resend (sync icon) and revoke (trash icon, destructive) — each with an accessible name.

**Footer**: a right-aligned row — a ghost "Cancel" and a primary "Send invitation". To the far left, muted small text "Invitations expire after 7 days."

## Behaviour and constraints

- The app must follow the user's system colour preference: render correctly in **both light and dark mode**, including the page background behind the card — not just the card surface itself.
- Use mock/default values inline — no API calls, no new dependencies.
- All form inputs accessibly labelled; icon-only controls have accessible names.
- Status pill tones follow the design system's semantic options for each meaning — never hand-picked colours. Surface, border, radius, shadow, and muted text use tokens, not hex/px.
- Follow whatever rules `extract-ds-skill` put in `.claude/skills/primer-react/` (when that skill is installed).

## Out of scope

- Real invitation sending, seat/billing logic, team management, autocomplete of usernames.
