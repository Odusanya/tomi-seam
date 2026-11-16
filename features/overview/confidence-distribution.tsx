// How sure the model was, in confidence bands (after Gumloop's score histogram and Wordle's
// guess distribution). One horizontal bar per band, split by verdict in the chart colours,
// count at the bar end. The shaky band is the exception: a warning glyph and a link, not a
// recoloured bar, so the series colours keep one meaning.
import { TriangleAlertIcon } from "lucide-react"
import Link from "next/link"
import type { CSSProperties } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Swatch } from "@/features/overview/daily-chart"
import type { ConfidenceBand } from "@/features/overview/stats"
import { VERDICT_LABEL } from "@/lib/fixtures/classification"

// Bar widths are data, so they travel as a custom property and a class reads it.
type BarStyle = CSSProperties & { "--bar-w": string }

function BandRow({ band, max }: { band: ConfidenceBand; max: number }) {
  const total = band.hotDog + band.notHotDog
  const width = (value: number) => `${max === 0 ? 0 : (value / max) * 100}%`
  const summary = `${band.label}: ${total} classified, ${band.hotDog} ${VERDICT_LABEL["hot-dog"]}, ${band.notHotDog} ${VERDICT_LABEL["not-hot-dog"]}`
  return (
    <li className="flex h-row items-center gap-3">
      {/* Fixed label lane with a glyph slot, so bars start on one edge whether or not a band is flagged. */}
      <span className="flex w-24 shrink-0 items-center gap-1.5 text-caption-lg text-fg-secondary tabular-nums">
        <span className="flex size-3.5 shrink-0 items-center">
          {band.low > 0 ? <TriangleAlertIcon aria-hidden strokeWidth={1.5} className="size-3.5 text-fg-warning" /> : null}
        </span>
        {band.label}
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label={summary}
              className="flex h-full min-w-0 flex-1 cursor-default items-center rounded-sm transition-colors duration-150 hover:bg-component focus-visible:bg-component motion-reduce:transition-none"
            />
          }
        >
          {/* The track scales to the largest band; 2 px gap between the verdict segments. */}
          <span className="flex h-4 w-(--bar-w) gap-0.5 overflow-hidden rounded-r-sm" style={{ "--bar-w": width(total) } as BarStyle}>
            {band.hotDog > 0 ? <span className="h-full grow-(--grow) bg-chart-hot-dog" style={{ "--grow": band.hotDog } as CSSProperties} /> : null}
            {band.notHotDog > 0 ? <span className="h-full grow-(--grow) bg-chart-not-hot-dog" style={{ "--grow": band.notHotDog } as CSSProperties} /> : null}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{band.label} confidence</span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Swatch verdict="hot-dog" />
              {band.hotDog} {VERDICT_LABEL["hot-dog"]}
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Swatch verdict="not-hot-dog" />
              {band.notHotDog} {VERDICT_LABEL["not-hot-dog"]}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
      <span className="w-6 shrink-0 text-right text-caption-lg text-fg-primary tabular-nums">{total}</span>
    </li>
  )
}

export function ConfidenceDistribution({ bands }: { bands: readonly ConfidenceBand[] }) {
  const max = Math.max(...bands.map((band) => band.hotDog + band.notHotDog))
  const low = bands.reduce((sum, band) => sum + band.low, 0)
  return (
    <div className="flex flex-col gap-3">
      <ol aria-label="Confidence bands" className="flex flex-col">
        {bands.map((band) => (
          <BandRow key={band.label} band={band} max={max} />
        ))}
      </ol>
      {low > 0 ? (
        <p className="flex items-center gap-1.5 text-caption-lg text-fg-secondary">
          <TriangleAlertIcon aria-hidden strokeWidth={1.5} className="size-3.5 shrink-0 text-fg-warning" />
          <span>
            <span className="text-fg-primary tabular-nums">{low}</span> under the low-confidence line.{" "}
            <Link href="/history" className="underline decoration-line-strong underline-offset-4 hover:text-fg-primary">
              Review
            </Link>
          </span>
        </p>
      ) : null}
      <table className="sr-only">
        <caption>Classifications by confidence band, by verdict</caption>
        <thead>
          <tr>
            <th>Confidence</th>
            <th>{VERDICT_LABEL["hot-dog"]}</th>
            <th>{VERDICT_LABEL["not-hot-dog"]}</th>
          </tr>
        </thead>
        <tbody>
          {bands.map((band) => (
            <tr key={band.label}>
              <td>{band.label}</td>
              <td>{band.hotDog}</td>
              <td>{band.notHotDog}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
