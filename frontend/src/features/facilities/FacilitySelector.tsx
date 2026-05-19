import { useMemo, useState } from 'react'
import type { Facility, FacilityScope } from './types'

interface FacilitySelectorProps {
  facilities?: Facility[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
  scope: FacilityScope
}

export default function FacilitySelector({ facilities, selectedIds, onChange, scope }: FacilitySelectorProps) {
  const [search, setSearch] = useState('')
  const scopedFacilities = (facilities ?? []).filter((facility) => facility.scope === scope || facility.scope === 'both')
  const selectedFacilities = scopedFacilities.filter((facility) => selectedIds.includes(facility.id))
  const normalizedSearch = search.trim().toLowerCase()
  const filteredFacilities = useMemo(() => {
    if (!normalizedSearch) return scopedFacilities

    return scopedFacilities.filter((facility) => {
      const name = facility.name.toLowerCase()
      const category = (facility.category || '').toLowerCase()
      return name.includes(normalizedSearch) || category.includes(normalizedSearch)
    })
  }, [normalizedSearch, scopedFacilities])

  const grouped = filteredFacilities.reduce<Record<string, Facility[]>>((acc, facility) => {
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
          No facilities are available for this scope yet. Run migrations or seed the default facilities catalogue before selecting them here.
        </p>
      </div>
    )
  }

  return (
    <div style={selectorShellStyle}>
      <div style={selectorHeaderStyle}>
        <div>
          <p style={{ margin: '0 0 4px', color: '#18181b', fontSize: '0.86rem', fontWeight: 800 }}>Facilities catalogue</p>
          <p style={{ margin: 0, color: '#71717a', fontSize: '0.78rem', lineHeight: 1.5 }}>
            Search and select facilities for this {scope}. Selected items are shown first.
          </p>
        </div>
        <span style={countBadgeStyle}>{selectedFacilities.length} selected</span>
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search facilities..."
        style={searchInputStyle}
      />

      <div style={selectedPanelStyle}>
        {selectedFacilities.length > 0 ? (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selectedFacilities.map((facility) => (
              <button key={facility.id} type="button" onClick={() => toggleFacility(facility.id)} style={selectedChipStyle}>
                {facility.name} ×
              </button>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#71717a', fontSize: '0.8rem' }}>No facilities selected yet.</p>
        )}
      </div>

      <div style={availableListStyle}>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={categoryRowStyle}>
            <div style={categoryLabelStyle}>{category}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
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
                    {checked ? '✓ ' : ''}{facility.name}
                    {facility.scope === 'both' && <span style={{ opacity: 0.7 }}> · both</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {filteredFacilities.length === 0 && (
          <p style={{ margin: 0, color: '#71717a', fontSize: '0.82rem' }}>No facilities match your search.</p>
        )}
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

const selectorHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
  marginBottom: '12px',
}

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '40px',
  border: '1px solid #d4d4d8',
  borderRadius: '10px',
  background: '#ffffff',
  color: '#18181b',
  fontSize: '0.9rem',
  padding: '0 12px',
  marginBottom: '12px',
}

const selectedPanelStyle: React.CSSProperties = {
  minHeight: '44px',
  border: '1px dashed #d4d4d8',
  borderRadius: '12px',
  background: '#ffffff',
  padding: '10px',
  marginBottom: '12px',
}

const availableListStyle: React.CSSProperties = {
  maxHeight: '260px',
  overflowY: 'auto',
  display: 'grid',
  gap: '10px',
  paddingRight: '4px',
}

const categoryRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '120px 1fr',
  gap: '10px',
  alignItems: 'start',
}

const categoryLabelStyle: React.CSSProperties = {
  color: '#71717a',
  fontSize: '0.74rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  paddingTop: '9px',
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
