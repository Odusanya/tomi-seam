import assert from "node:assert/strict"
import { describe, test } from "node:test"

import { prng } from "./prng"

describe("prng", () => {
  // Every fixture and the fake classifier lean on this. If it broke, the server and client
  // would render different data: a hydration warning in the console, not an obvious UI bug.
  test("the same seed gives the same sequence", () => {
    const first = prng(7)
    const second = prng(7)

    assert.deepEqual(
      Array.from({ length: 20 }, () => first.next()),
      Array.from({ length: 20 }, () => second.next()),
    )
  })

  // Off-by-one guard: both ends are inclusive, and confidence ranges are written assuming so.
  test("int() stays inside its bounds and reaches both ends", () => {
    const rand = prng(5)

    const values = Array.from({ length: 2000 }, () => rand.int(3, 6))

    assert.deepEqual([...new Set(values)].toSorted(), [3, 4, 5, 6])
  })
})
