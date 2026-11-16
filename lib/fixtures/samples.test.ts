import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { test } from "node:test"

import { samples } from "./samples"

// `src` is a plain string, so the compiler cannot tell a typo or a renamed file from a real
// path, and a broken image only shows if someone looks at all nine tiles.
test("every sample image exists in public/", () => {
  for (const sample of samples) {
    const file = new URL(`../../public${sample.src}`, import.meta.url)

    assert.ok(existsSync(file), `${sample.src} is missing from public/`)
  }
})
