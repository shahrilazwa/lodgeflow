import type { Facility, FacilityScope } from './types'

interface FacilitySelectorProps {
  facilities?: Facility[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
  scope: FacilityScope
}

export default function FacilitySelector({ facilities, selectedIds, onChange, scope }: FacilitySelectorProps) {
  const scopedFacilities = (facilities ?? []).filter((facility) => facility.scope === scope || facility.scope === 'both')
  const grouped = scopedFacilities.reduce<Record<string, Facility[]>>((acc, facility) => {
    const category = facility.category || 'Other'
    acc[category] = acc[category] || []
    acc[category].push(facility)
    return acc
  }, {})

  function toggleFacility(id: number) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id))
      return
    }

    onChange([...selectedIds, id])
  }

  if (!facilities) {
    return <p style={{ margin: 0, color: '#71717a', fontSize: '0.82rem' }}>Loading facilities...</p>
  }

  if (scopedFacilities.length === 0) {
    return <p style={{ margin: 0, color: '#71717a', fontSize: '0.82rem' }}>No facilities available.</p>
  }

  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p style={{ margin: '0 0 8px', color: '#71717a', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{category}</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {items.map((facility) => {
              const checked = selectedIds.includes(facility.id)
              return (
                <button
                  key={facility.id}
                  type="button"
                  onClick={() => toggleFacility(facility.id)}
                  style={{
                    minHeight: '34px',
                    border: checked ? '1px solid #2563eb' : '1px solid #e4e4e7',
                    borderRadius: '999px',
                    background: checked ? '#eff6ff' : '#ffffff',
                    color: checked ? '#2563eb' : '#18181b',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0 12px',
                  }}
                  aria-pressed={checked}
                >
                  {facility.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
