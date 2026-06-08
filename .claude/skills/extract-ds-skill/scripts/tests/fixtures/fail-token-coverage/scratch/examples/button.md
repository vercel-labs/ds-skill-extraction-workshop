# Example: Button

## Composition (verbatim)

```tsx
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface-default)', padding: 8 }}>
      {children}
    </div>
  );
}
```
