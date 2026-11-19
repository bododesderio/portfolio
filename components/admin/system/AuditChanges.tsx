import type { Prisma } from '@prisma/client'

function show(value: unknown) {
  if (value === null || value === undefined || value === '') return <em>empty</em>
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

export function AuditChanges({ action, changes }: { action: string; changes: Prisma.JsonValue }) {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes))
    return <p className="admin-audit-none">No field details were recorded for this entry.</p>
  const rows = Object.entries(changes)
  if (rows.length === 0) return <p className="admin-audit-none">No field details were recorded for this entry.</p>
  if (action === 'update')
    return (
      <div className="admin-table-scroll">
        <table className="admin-audit-table">
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Before</th>
              <th scope="col">After</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([field, change]) => {
              const pair = (change ?? {}) as { from?: unknown; to?: unknown }
              return (
                <tr key={field}>
                  <th scope="row">{field}</th>
                  <td>{show(pair.from)}</td>
                  <td>{show(pair.to)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  return (
    <div className="admin-table-scroll">
      <table className="admin-audit-table">
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">{action === 'delete' ? 'Value before deletion' : 'Value'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([field, value]) => (
            <tr key={field}>
              <th scope="row">{field}</th>
              <td>{show(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
