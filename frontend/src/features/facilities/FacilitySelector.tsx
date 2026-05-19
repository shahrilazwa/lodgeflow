import type { Facility, FacilityScope } from './types'

interface FacilitySelectorProps {
  facilities?: Facility[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
  scope: FacilityScope
}

export default function FacilitySelector({ facilities, selectedIds, onChange, scope }: FacilitySelectorProps) {
  const scopedFacilities = (facilities ?? []).filter((facility) => facility.scope === scope || facility.scope === 'both')
  const selectedFacilities = scopedFacilities.filter((facility) => selectedIds.includes(facility.id))
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
    return (
      <div style={selectorShellStyle}>
        <p style={{ margin: 0, color: '#71717a', fontSize: '0.82rem' }}>Loading available facilities...</p>
      </div>
    )
  }

  if (scopedFacilities.length === 0) {
    return (
      <div style={selectorShellStyle}>
        <p style={{ margin: '0 0 4px', color: '#18181b', fontSize: '0.84rem', fontWeight: 800 }}>Available {scope} facilities</p>
        <p style={{ margin: 0, color: '#71717a', fontSize: '0.82rem', lineHeight: 1.5 }}>
          No facilities are available for this scope yet. Seed or add facilities to the catalogue before selecting them here.
        </p>
      </div>
    )
  }

  return (
    <div style={selectorShellStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <p style={{ margin: '0 0 4px', color: '#18181b', fontSize: '0.86rem', fontWeight: 800 }}>Available {scope} facilities</p>
          <p style={{ margin: 0, color: '#71717a', fontSize: '0.78rem', lineHeight: 1.5 }}>
            Select all facilities that apply. Facilities marked as “both” can be used for properties and units.
          </p>
        </div>
        <span style={countBadgeStyle}>{selectedFacilities.length} selected</span>
      </div>

      {selectedFacilities.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <p style={sectionLabelStyle}>Selected facilities</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selectedFacilities.map((facility) => (
              <button key={facility.id} type="button" onClick={() => toggleFacility(facility.id)} style={selectedChipStyle}>
                {facility.name} ×
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '14px' }}>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p style={sectionLabelStyle}>{category}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {items.map((facility) => {
                const checked = selectedIds.includes(facility.id)
                return (
                  <button
                    key={facility.id}
                    type="button"
                    onClick={() => toggleFacility(facility.id)}
                    style={checked ? selectedChipStyle : availableChipStyle}
                    aria-pressed={checked}
                    title={facility.scope === 'both' ? 'Available for properties and units' : `Available for ${facility.scope}s`}
                  >
                    {facility.name}
                    {facility.scope === 'both' && <span style={{ opacity: 0.7 }}> · both</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const selectorShellStyle: React.CSSProperties = {
  border: '1px solid #e4e4e7',
  borderRadius: '14px',
  background: '#fafafa',
  padding: '14px',
}

const sectionLabelStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#71717a',
  fontSize: '0.74rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const countBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '26px',
  borderRadius: '999px',
  background: '#eff6ff',
  color: '#2563eb',
  fontSize: '0.74rem',
  fontWeight: 800,
  padding: '0 10px',
  whiteSpace: 'nowrap',
}

const availableChipStyle: React.CSSProperties = {
  minHeight: '34px',
  border: '1px solid #e4e4e7',
  borderRadius: '999px',
  background: '#ffffff',
  color: '#18181b',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 700,
  padding: '0 12px',
}

const selectedChipStyle: React.CSSProperties = {
  ...availableChipStyle,
  border: '1px solid #2563eb',
  background: '#eff6ff',
  color: '#2563eb',
}
