---
title: Banner
description: Semantic tonal alert with five variants. `critical` is for blocking failures only — not a colour swap.
---

## Public imports

```ts
import { Banner } from "@/ds/components/Banner";
```

Compound subcomponents accessed as `Banner.Title`, `Banner.Description`, `Banner.PrimaryAction`, `Banner.SecondaryAction` when richer content is needed.

## When to use

Use `Banner` for full-width, persistent, page- or section-level messages — security advisories, deprecation warnings, deploy status. For transient feedback (a save just succeeded, a copy-to-clipboard fired) prefer a toast / inline message; `Banner` stays until dismissed and takes layout space, which is wrong for transient feedback.

## Key props

- `variant: "info" | "warning" | "critical" | "success" | "upsell"` — required. The full enum is exactly these five values. (Banner.d.ts:4)
- `title?: string` — short headline. Required unless using `<Banner.Title>` child. (Banner.d.ts)
- `description?: string` — body copy. Required unless using `<Banner.Description>` child. Routing note: the prose itself is OUT OF SCOPE for this skill; the prop API is in scope.
- `hideTitle?: boolean` — visually hides the title while keeping it in the a11y tree.
- `icon?: ReactNode` — custom leading icon. Only valid when `variant` is `info` or `upsell`. (Banner.d.ts:26)
- `onDismiss?: () => void` — adds a dismiss control. Without it the banner is persistent until removed by the parent.

## Best Practices

### When to use

- Use for page-/section-level persistent messages. For transient confirmation feedback use a toast or inline message instead — Banner takes layout space.

### Behavior

- `variant` is semantic, not cosmetic. Pick by what the user must do, NOT by which colour the design calls for. (ds/components/Banner.docs.tsx:4-18)
  - `critical` — blocking failure the user must resolve before continuing (payment failed, deploy blocked, data loss imminent).
  - `warning` — important but non-blocking (deadline approaching, deprecated config still works).
  - `info` — neutral information (a feature is rolling out, a sync finished).
  - `success` — a user-initiated action completed.
  - `upsell` — promote an opt-in (Pro plan, beta program).
- The trap: models reach for `critical` whenever the design looks red, even when the message is non-blocking. `critical` maps to an `alert`-style landmark and stronger SR urgency — it is not a colour swap. (ds/components/Banner.docs.tsx:16-18)
- Custom `icon` is only valid on `variant="info"` or `variant="upsell"`; the other three variants ship a fixed icon for SR consistency. (Banner.d.ts:26)

### Accessibility

- `variant="critical"` renders an `alert` landmark — screen readers announce it immediately on appearance. Reserve for the blocking-failure case to avoid alert fatigue.
- `title` is the accessible name. Even with `hideTitle`, it must be present and meaningful.

## Composition examples

```tsx
import { Banner } from "@/ds/components/Banner";

export function SecurityAdvisoryBanner() {
  return (
    <Banner
      variant="warning"
      title="Two-factor authentication required next month"
      description="Set it up before July 1 to keep your account active."
    />
  );
}
```

For richer content using compound subcomponents:

```tsx
<Banner variant="info">
  <Banner.Title>Feature flag rolled out</Banner.Title>
  <Banner.Description>
    The new dashboard is now enabled for all users on the Pro plan.
  </Banner.Description>
  <Banner.PrimaryAction>View dashboard</Banner.PrimaryAction>
</Banner>
```

## Source references

- `ds/components/Banner.tsx:15` — wrapper (re-export of `@primer/react` `Banner`).
- `ds/components/Banner.docs.tsx:4-18` — variant semantics rule.
- `node_modules/@primer/react/dist/Banner/Banner.d.ts:4` — `BannerVariant` enum: `'critical' | 'info' | 'success' | 'upsell' | 'warning'`.
- `node_modules/@primer/react/dist/Banner/Banner.d.ts:26` — `icon` prop restriction to `info`/`upsell`.

## Common mistakes

| Bad | Good | Why |
|-----|------|-----|
| `<Banner variant="critical" title="2FA required next month">` for a non-blocking deadline | `<Banner variant="warning" title="2FA required next month">` | `critical` is an `alert` landmark — SRs announce it immediately and aggressively. Reserve for blocking failures or alert fatigue defeats the purpose. |
| `<Banner variant="error">` | `<Banner variant="critical">` | There is no `error` variant. The five variants are exact; TypeScript will reject `error` — but a stringly-typed JSX leak might let it through silently. |
| `<Banner variant="critical" icon={<CustomIcon />}>` | Use `variant="info"` or `variant="upsell"` for a custom icon; or accept the default icon on `critical` | Custom icon is only valid on `info` / `upsell` per the type. The other variants ship a fixed icon. |

## Things to never invent

- `variant="error"`, `variant="danger"`, `variant="alert"`, `variant="neutral"` — exactly five variants: `info`, `warning`, `critical`, `success`, `upsell`.
- A "tone" or "severity" prop — there is none; tone IS the variant.
- `onClose` (the prop is `onDismiss`).
