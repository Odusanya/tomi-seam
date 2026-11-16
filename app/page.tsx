// Placeholder screen: shows the fixture pattern and the tokens in use.
// Replace on the day. Keep it a server component; add "use client" only to leaves.
import { SeverityBadge } from "@/components/domain/severity-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { exampleFindings } from "@/lib/fixtures/example"

export default function Home() {
  return (
    <main className="flex flex-col gap-4 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-heading-6 font-medium">Assessments</h1>
        <p className="text-caption-lg text-fg-tertiary">Dummy data · lib/fixtures</p>
      </header>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Finding</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Clause</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exampleFindings.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                <span className="text-fg-tertiary tabular-nums">{f.id}</span>
              </TableCell>
              <TableCell>{f.title}</TableCell>
              <TableCell>
                <SeverityBadge severity={f.severity} />
              </TableCell>
              <TableCell>
                <span className="font-mono">{f.clause}</span>
              </TableCell>
              <TableCell>
                {f.ai.source ? (
                  <span className="text-fg-secondary">{`${f.ai.source.doc} · p.${f.ai.source.page}`}</span>
                ) : (
                  <span className="text-fg-danger">No source</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  )
}
