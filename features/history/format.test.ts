import assert from "node:assert/strict"
import { describe, test } from "node:test"

import { formatClassifiedAt } from "./format"

// formatConfidence and formatCount are one-line expressions whose output is on screen in
// every row; they are left untested on purpose.
describe("formatClassifiedAt", () => {
  // The hydration guarantee. Swapping a getUTC* call for its local twin looks correct on a
  // machine set to UTC and wrong everywhere else, so pin it with an offset timestamp.
  test("shows UTC whatever offset the timestamp was written in", () => {
    assert.equal(formatClassifiedAt("2026-11-16T01:30:00+02:00"), "15 Nov 2026, 23:30")
  })

  test("zero-pads day, hour and minute", () => {
    assert.equal(formatClassifiedAt("2026-01-05T03:04:00Z"), "05 Jan 2026, 03:04")
  })
})
