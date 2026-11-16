import assert from "node:assert/strict"
import { describe, test } from "node:test"

import type { ClassificationResult, Verdict } from "@/lib/fixtures/classification"

import { filterHistory, matchesQuery } from "./filter"

/** A row builder: each test states only the fields it is about. */
function row(id: string, verdict: Verdict = "hot-dog"): ClassificationResult {
  return {
    id,
    verdict,
    thumbnail: "/samples/pizza.jpg",
    confidence: 0.9,
    model: { name: "SeeFood", version: "2.1.0" },
    classifiedAt: "2026-11-16T14:02:00.000Z",
    source: "sample",
  }
}

// The match rule is still an open decision (see the TODO in filter.ts). These pin the parts
// the TODO says must survive any choice, plus the current defaults a paste would trip over.
describe("matchesQuery", () => {
  test("an empty query matches every row", () => {
    assert.equal(matchesQuery(row("cls_9b12ffa0"), ""), true)
  })

  test("a whitespace-only query matches every row", () => {
    assert.equal(matchesQuery(row("cls_9b12ffa0"), "   "), true)
  })

  test("ignores case and spaces around a pasted id", () => {
    assert.equal(matchesQuery(row("cls_9b12ffa0"), "  9B12 "), true)
  })

  test("does not match text that is not in the id", () => {
    assert.equal(matchesQuery(row("cls_9b12ffa0"), "zzz"), false)
  })
})

describe("filterHistory", () => {
  test("a row must pass both the verdict filter and the query, and order is kept", () => {
    const rows = [
      row("cls_aa11", "hot-dog"),
      row("cls_aa33", "not-hot-dog"),
      row("cls_bb22", "not-hot-dog"),
      row("cls_aa44", "not-hot-dog"),
    ]

    const result = filterHistory(rows, "not-hot-dog", "aa")

    assert.deepEqual(result.map((each) => each.id), ["cls_aa33", "cls_aa44"])
  })
})
