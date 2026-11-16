// Classifications per day, stacked by verdict. Plain HTML bars: two series and at most 14
// days need no chart library. Identity is never colour alone: a legend with totals, a count
// above every bar, a tooltip per day and a screen-reader table.
import type { CSSProperties, ReactNode } from "react"

import { SurfaceCard } from "@/components/domain/surface-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { DayBucket } from "@/features/overview/stats"
import { VERDICT_LABEL } from "@/lib/fixtures/classification"

// Plot is h-40 (160 px); the tallest bar leaves 20 px for its total label.
const PLOT_HEIGHT = 160
const BAR_ROOM = PLOT_HEIGHT - 20

// Bar heights are data, so they travel as a custom property and a class reads it.
type BarStyle = CSSProperties & { "--bar-h": string }

export function Swatch({ verdict }: { verdict: "hot-dog" | "not-hot-dog" }) {
  return (
    <span
      aria-hidden
      className={verdict === "hot-dog" ? "size-2 shrink-0 rounded-xs bg-chart-hot-dog" : "size-2 shrink-0 rounded-xs bg-chart-not-hot-dog"}
    />
  )
}

export function Legend({ days }: { days: readonly DayBucket[] }) {
  const hotDog = days.reduce((sum, day) => sum + day.hotDog, 0)
  const notHotDog = days.reduce((sum, day) => sum + day.notHotDog, 0)
  return (
    <ul className="flex items-center gap-4 text-caption-lg text-fg-secondary">
      <li className="flex items-center gap-1.5">
        <Swatch verdict="hot-dog" />
        {VERDICT_LABEL["hot-dog"]}
        <span className="text-fg-primary tabular-nums">{hotDog}</span>
      </li>
      <li className="flex items-center gap-1.5">
        <Swatch verdict="not-hot-dog" />
        {VERDICT_LABEL["not-hot-dog"]}
        <span className="text-fg-primary tabular-nums">{notHotDog}</span>
      </li>
    </ul>
  )
}

/** A titled Overview section on its own card: title left, an optional aside right. */
export function ChartSection({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <SurfaceCard size="section">
      <section className="flex min-w-0 flex-col gap-4" aria-label={title}>
        <header className="flex min-h-7 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 className="text-body-sm font-medium text-fg-primary">{title}</h2>
          {aside}
        </header>
        {children}
      </section>
    </SurfaceCard>
  )
}

function Bar({ day, max }: { day: DayBucket; max: number }) {
  const total = day.hotDog + day.notHotDog
  // Segment heights in px of the plot; a 2 px gap separates the segments.
  const scale = (value: number) => (max === 0 ? 0 : (value / max) * BAR_ROOM)
  const summary = `${day.long}: ${total} classified, ${day.hotDog} ${VERDICT_LABEL["hot-dog"]}, ${day.notHotDog} ${VERDICT_LABEL["not-hot-dog"]}`
  return (
    <li className="flex min-w-0 flex-1 flex-col items-stretch">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label={summary}
              className="group/bar flex h-40 cursor-default flex-col items-center justify-end gap-1 rounded-sm px-1 transition-colors duration-150 hover:bg-component focus-visible:bg-component motion-reduce:transition-none"
            />
          }
        >
          {total > 0 ? (
            <>
              <span className="text-caption-base text-fg-secondary tabular-nums">{total}</span>
              <span className="flex w-full max-w-8 flex-col gap-0.5 overflow-hidden rounded-t-sm">
                {day.hotDog > 0 ? <span className="h-(--bar-h) w-full bg-chart-hot-dog" style={{ "--bar-h": `${scale(day.hotDog)}px` } as BarStyle} /> : null}
                {day.notHotDog > 0 ? <span className="h-(--bar-h) w-full bg-chart-not-hot-dog" style={{ "--bar-h": `${scale(day.notHotDog)}px` } as BarStyle} /> : null}
              </span>
            </>
          ) : null}
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{day.long}</span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Swatch verdict="hot-dog" />
              {day.hotDog} {VERDICT_LABEL["hot-dog"]}
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Swatch verdict="not-hot-dog" />
              {day.notHotDog} {VERDICT_LABEL["not-hot-dog"]}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
      <span className="border-t border-strong pt-2 text-center text-caption-base text-fg-tertiary tabular-nums">{day.label}</span>
    </li>
  )
}

/** The bars and their screen-reader table, without a section header. */
export function DailyBars({ days }: { days: readonly DayBucket[] }) {
  const max = Math.max(...days.map((day) => day.hotDog + day.notHotDog))
  return (
    <>
      <ol className="flex gap-1" aria-label="Days">
        {days.map((day) => (
          <Bar key={day.key} day={day} max={max} />
        ))}
      </ol>
      <table className="sr-only">
        <caption>Classifications per day, by verdict</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>{VERDICT_LABEL["hot-dog"]}</th>
            <th>{VERDICT_LABEL["not-hot-dog"]}</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.key}>
              <td>{day.long}</td>
              <td>{day.hotDog}</td>
              <td>{day.notHotDog}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export function DailyChartSkeleton({ count }: { count: number }) {
  const bars = Array.from({ length: count }, (_, index) => `bar-${index}`)
  return (
    <ChartSection title="Classifications">
      <div className="flex h-40 items-end gap-1">
        {bars.map((key) => (
          <div key={key} className="flex flex-1 justify-center">
            <Skeleton className="h-16 w-full max-w-8" />
          </div>
        ))}
      </div>
    </ChartSection>
  )
}
