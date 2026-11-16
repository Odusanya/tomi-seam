// Sample images with curated verdicts. Neutral SVG placeholders in public/samples;
// real photos replace them later by swapping `src` (keep the verdicts in step).
import type { Verdict } from "@/lib/fixtures/classification"

export type SampleImage = {
  id: string
  label: string
  src: string
  alt: string
  verdict: Verdict
}

export const samples: readonly SampleImage[] = [
  { id: "sample-01", label: "Sample 1", src: "/samples/sample-01.svg", alt: "Sample 1", verdict: "hot-dog" },
  { id: "sample-02", label: "Sample 2", src: "/samples/sample-02.svg", alt: "Sample 2", verdict: "not-hot-dog" },
  { id: "sample-03", label: "Sample 3", src: "/samples/sample-03.svg", alt: "Sample 3", verdict: "not-hot-dog" },
  { id: "sample-04", label: "Sample 4", src: "/samples/sample-04.svg", alt: "Sample 4", verdict: "hot-dog" },
  { id: "sample-05", label: "Sample 5", src: "/samples/sample-05.svg", alt: "Sample 5", verdict: "hot-dog" },
  { id: "sample-06", label: "Sample 6", src: "/samples/sample-06.svg", alt: "Sample 6", verdict: "not-hot-dog" },
]
