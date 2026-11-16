# Image classifier

Drop in an image. Get one of two answers: **Hot Dog** or **Not Hot Dog**.

**Live:** https://seamflow.tomiodusanya.com

Inference is simulated. The sandbox label in the app says so. Verdicts come from fixtures, not a model.

## The job

A reviewer wants a straight answer fast. An operator wants to check past answers later. Those are two screens, and each does one thing.

## What's in it

- **Classify.** Drop, browse or pick a sample. A short scan runs, then the verdict appears alone. Nothing else is on screen.
- **History.** Every past result in a dense table, with confidence, model, time and ID. Filter by verdict, search by ID, open a row for detail.
- **Overview.** Daily volume, verdict split, confidence spread and the latest results.
- **Sidebar.** Admin pages are visible but marked "Soon". They aren't links, so nothing leads nowhere.

## Decisions

- **Two words, no extras.** The Classify screen withholds confidence and metadata on purpose. History holds the detail.
- **Not Hot Dog is a result, not an error.** Same layout and weight as Hot Dog. Red is only for rejected files.
- **Status never relies on colour.** The verdict is text plus a glyph.
- **Same file, same answer.** Samples carry curated verdicts. Any other file gets one derived from a hash of its contents.
- **Real validation.** JPEG, PNG and WebP, up to 10 MB. A bad file gets an inline message and the dropzone stays usable.
- **Tokens only.** Colour, type and row density come from one token file. No one-off styles.

## What I cut

- **No real model, accounts or backend.** The classify function is the one place a real model would plug in.

## What I'd test next

Whether a reviewer expects metadata on the Classify screen. I held it back to keep the verdict loud. I'd watch five people try the app before deciding.

## Run it

```bash
npm install
npm run dev     # http://localhost:3100
npm run check   # types, lint, build
npm test        # unit tests for fixtures, filters and formatting
```

## Built with

Next.js 16, Tailwind, shadcn on Base UI, TanStack Table. Deployed to Cloudflare Workers. Sample photos are from Wikimedia Commons; credits are in `public/samples/CREDITS.md`.
