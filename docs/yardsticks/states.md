# States

Every table, list, panel and AI block needs:

| State | Shows |
|---|---|
| Empty | What it is, why it's empty, one action |
| Loading | Skeleton the shape of the content |
| AI running | Narration + progress, violet |
| Error | What failed, Retry |
| Stale | "Changed since AI ran" + Re-run |

Use `Empty`, `Skeleton`, `Alert` from `components/ui`. Fake timing with `fakeAI()`.
