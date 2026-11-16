import assert from "node:assert/strict"
import { describe, test } from "node:test"

import { classify, validateImage } from "./classify"
import { MAX_BYTES } from "./fixtures/classification"

const AT = "2026-11-16T14:02:00.000Z"

const fileOfSize = (size: number, type = "image/jpeg") => new File([new Uint8Array(size)], "photo", { type })
const upload = (bytes: number[]) =>
  ({ source: "upload", file: new File([new Uint8Array(bytes)], "photo", { type: "image/png" }), thumbnail: "blob:preview" }) as const

describe("validateImage", () => {
  test("accepts a supported image type", () => {
    assert.equal(validateImage(fileOfSize(10, "image/webp")), null)
  })

  test("rejects an unsupported type with a reason naming the supported formats", () => {
    assert.equal(
      validateImage(fileOfSize(10, "image/gif")),
      "That file is not a supported image. Use a JPEG, PNG or WebP.",
    )
  })

  test("rejects a file with no type at all", () => {
    assert.notEqual(validateImage(fileOfSize(10, "")), null)
  })

  // The boundary pair: nobody tests a file of exactly 10 MB by hand.
  test("accepts a file of exactly 10 MB", () => {
    assert.equal(validateImage(fileOfSize(MAX_BYTES)), null)
  })

  test("rejects a file one byte over 10 MB", () => {
    assert.equal(validateImage(fileOfSize(MAX_BYTES + 1)), "That image is larger than 10 MB. Choose a smaller one.")
  })
})

describe("classify, upload input", () => {
  // The promise the screen makes: re-uploading a photo never flips its verdict.
  test("the same bytes always give the same result", async () => {
    const first = await classify(upload([1, 2, 3]), AT)
    const second = await classify(upload([1, 2, 3]), AT)

    assert.deepEqual(first, second)
  })

  test("different bytes give a different id", async () => {
    const first = await classify(upload([1, 2, 3]), AT)
    const second = await classify(upload([1, 2, 4]), AT)

    assert.notEqual(first.id, second.id)
  })
})
