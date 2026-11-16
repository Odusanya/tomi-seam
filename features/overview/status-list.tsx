// System status as a property list: labels secondary and medium, values primary and regular,
// one 36 px row each with a hairline between. Copy from the Paper Overview frame.
import { ChartSection } from "@/features/overview/daily-chart"
import { formatClassifiedAt } from "@/features/history/format"
import { MODEL } from "@/lib/fixtures/classification"

export function StatusList({ lastVerdictAt }: { lastVerdictAt: string | null }) {
  const items = [
    { label: "Model", value: `${MODEL.name} ${MODEL.version}` },
    { label: "Environment", value: "Sandbox" },
    {
      label: "Status",
      value: (
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-1.5 rounded-full bg-positive-solid" />
          Operational
        </span>
      ),
    },
    {
      label: "Last verdict",
      value: lastVerdictAt ? (
        <time dateTime={lastVerdictAt} className="tabular-nums">
          {formatClassifiedAt(lastVerdictAt)}
        </time>
      ) : (
        "None yet"
      ),
    },
    { label: "Accepted formats", value: "JPEG, PNG, WebP · 10 MB" },
  ]
  return (
    <ChartSection title="System status">
      <dl className="flex flex-col border-t border-default">
        {items.map((item) => (
          <div key={item.label} className="flex h-row items-center justify-between gap-4 border-b border-default">
            <dt className="text-body-sm font-medium text-fg-secondary">{item.label}</dt>
            <dd className="truncate text-body-sm text-fg-primary">{item.value}</dd>
          </div>
        ))}
      </dl>
    </ChartSection>
  )
}
