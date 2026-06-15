### Cost & tokens — skill (dryrun-24) vs no-skill (dryrun-25)

| variant | skill $ | no-skill $ | Δ$ | Δ% | skill out-tok | no-skill out-tok | Δtok% | skill turns | no-skill turns |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| opus · low | 5.38 | 6.57 | 1.19 | 22% | 24k | 25k | 8% | 37 | 48 |
| opus · medium | 6.34 | 8.58 | 2.23 | 35% | 36k | 37k | 4% | 61 | 54 |
| opus · high | 8.97 | 10.98 | 2.01 | 22% | 57k | 51k | -11% | 68 | 73 |
| opus · xhigh | 12.67 | 13.98 | 1.31 | 10% | 77k | 102k | 33% | 80 | 94 |
| opus · max | 14.24 | 18.21 | 3.97 | 28% | 109k | 121k | 11% | 90 | 84 |
| sonnet · low | 1.23 | 1.62 | 0.38 | 31% | 14k | 20k | 37% | 35 | 51 |
| sonnet · medium | 2.17 | 2.07 | -0.10 | -5% | 34k | 28k | -19% | 60 | 63 |
| sonnet · high | 2.32 | 2.33 | 0.01 | 0% | 34k | 39k | 14% | 59 | 76 |
| sonnet · xhigh | 1.89 | 2.35 | 0.46 | 25% | 34k | 39k | 16% | 58 | 70 |
| sonnet · max | 2.02 | 2.13 | 0.11 | 5% | 43k | 26k | -41% | 54 | 63 |
| **total** | **57.23** | **68.80** | **11.57** | **20%** | **463k** | **487k** | **5%** | | |

### Build integrity

| variant | skill typecheck | no-skill typecheck | skill console-err | no-skill console-err | no-skill editable form |
| --- | --- | --- | --- | --- | --- |
| opus · low | PASS | PASS | 0 | 0 | ✅ |
| opus · medium | PASS | PASS | 0 | 0 | ✅ |
| opus · high | PASS | PASS | 0 | 0 | ✅ |
| opus · xhigh | PASS | PASS | 0 | 0 | ✅ |
| opus · max | PASS | PASS | 0 | 0 | ✅ |
| sonnet · low | PASS | PASS | 0 | 0 | ✅ |
| sonnet · medium | PASS | PASS | 0 | 0 | ✅ |
| sonnet · high | PASS | PASS | 0 | 2 | ✅ |
| sonnet · xhigh | PASS | PASS | 0 | 0 | ✅ |
| sonnet · max | PASS | PASS | 0 | 0 | ✅ |

### Dark-mode toggle (DOM-verified) — the undocumented capability

| variant | found (s/n) | accessible name (s/n) | root-observable (s/n) |
| --- | --- | --- | --- |
| opus · low | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| opus · medium | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| opus · high | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| opus · xhigh | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| opus · max | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| sonnet · low | ✅ / ✅ | ✅ / ✅ | ✅ / ❌ |
| sonnet · medium | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| sonnet · high | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| sonnet · xhigh | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| sonnet · max | ✅ / ✅ | ✅ / ✅ | ❌ / ✅ |

### Accessibility — merge unavailable while checks run (light stage DOM)

| variant | skill gating | no-skill gating |
| --- | --- | --- |
| opus · low | disabled ✅ | disabled ✅ |
| opus · medium | disabled ✅ | not rendered ✅ |
| opus · high | disabled ✅ | disabled ✅ |
| opus · xhigh | disabled ✅ | disabled ✅ |
| opus · max | disabled ✅ | not rendered ✅ |
| sonnet · low | inactive only ❌ | disabled ✅ |
| sonnet · medium | not rendered ✅ | inactive only ❌ |
| sonnet · high | not rendered ✅ | disabled ✅ |
| sonnet · xhigh | disabled ✅ | disabled ✅ |
| sonnet · max | disabled ✅ | disabled ✅ |

### Design-system reach & token discipline

| variant | skill #prim | no-skill #prim | skill TL | no-skill TL | skill sx/hex/px | no-skill sx/hex/px | skill LOC | no-skill LOC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| opus · low | 17 | 17 | ❌ | ❌ | 0/0/9 | 0/0/3 | 674 | 451 |
| opus · medium | 18 | 19 | ✅ | ✅ | 0/0/5 | 0/0/4 | 506 | 602 |
| opus · high | 18 | 18 | ✅ | ✅ | 0/0/3 | 0/0/0 | 575 | 537 |
| opus · xhigh | 18 | 17 | ✅ | ❌ | 0/0/5 | 0/0/7 | 687 | 675 |
| opus · max | 19 | 19 | ✅ | ✅ | 0/0/6 | 0/0/5 | 588 | 681 |
| sonnet · low | 17 | 17 | ❌ | ❌ | 0/2/5 | 0/0/6 | 429 | 531 |
| sonnet · medium | 16 | 17 | ❌ | ❌ | 0/2/6 | 0/0/8 | 556 | 527 |
| sonnet · high | 17 | 19 | ❌ | ❌ | 0/6/6 | 0/1/12 | 573 | 571 |
| sonnet · xhigh | 17 | 17 | ❌ | ❌ | 0/0/4 | 0/1/2 | 419 | 494 |
| sonnet · max | 17 | 17 | ❌ | ✅ | 0/0/3 | 0/2/4 | 466 | 449 |

### Aggregate

| metric | skill (24) | no-skill (25) |
| --- | --- | --- |
| total build cost | $57.23 | $68.80 |
| total output tokens | 463k | 487k |
| typecheck pass | 10/10 | 10/10 |
| toggle found | 10/10 | 10/10 |
| toggle root-observable | 9/10 | 9/10 |
| uses Timeline | 4/10 | 4/10 |
| raw hex+px literals (sum) | 62 | 55 |

