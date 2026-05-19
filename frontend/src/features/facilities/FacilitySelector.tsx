import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBaby,
  faBanSmoking,
  faBath,
  faBed,
  faBellConcierge,
  faBowlRice,
  faBox,
  faBoxArchive,
  faBoxOpen,
  faBreadSlice,
  faBriefcase,
  faCalendarDays,
  faChair,
  faCircleDot,
  faDoorOpen,
  faFan,
  faFireBurner,
  faFireExtinguisher,
  faGamepad,
  faHotTubPerson,
  faKey,
  faKitMedical,
  faLock,
  faMugHot,
  faPeopleRoof,
  faPumpSoap,
  faScroll,
  faShieldHalved,
  faShirt,
  faSmog,
  faSnowflake,
  faSoap,
  faSprayCanSparkles,
  faSquareParking,
  faTable,
  faToilet,
  faTree,
  faTriangleExclamation,
  faTv,
  faUmbrellaBeach,
  faUtensils,
  faVideo,
  faVolumeHigh,
  faWaterLadder,
  faWheelchair,
  faWifi,
  faWind,
  faWindowMaximize,
} from '@fortawesome/free-solid-svg-icons'
import { useCreateFacility } from './api'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { Facility, FacilityScope } from './types'

interface FacilitySelectorProps {
  facilities?: Facility[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
  scope: FacilityScope
}

export default function FacilitySelector({ facilities, selectedIds, onChange, scope }: FacilitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('Other')
  const [customScope, setCustomScope] = useState<FacilityScope>(scope)
  const [customError, setCustomError] = useState('')
  const createFacility = useCreateFacility()
  const scopedFacilities = (facilities ?? []).filter((facility) => facility.scope === scope || facility.scope === 'both')
  const selectedFacilities = scopedFacilities.filter((facility) => selectedIds.includes(facility.id))
  const normalizedSearch = search.trim().toLowerCase()
  const categories = Array.from(new Set((facilities ?? []).map((facility) => facility.category || 'Other'))).sort()
  const filteredFacilities = normalizedSearch
    ? scopedFacilities.filter((facility) => {
      const name = facility.name.toLowerCase()
      const category = (facility.category || '').toLowerCase()
      return name.includes(normalizedSearch) || category.includes(normalizedSearch)
    })
    : scopedFacilities

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

  async function handleAddCustomFacility() {
    const name = customName.trim()
    const category = customCategory.trim() || 'Other'
    setCustomError('')

    if (!name) {
      setCustomError('Facility name is required.')
      return
    }

    try {
      const facility = await createFacility.mutateAsync({ name, category, scope: customScope, icon: defaultIconForCategory(category) })
      onChange([...selectedIds, facility.id])
      setCustomName('')
      setCustomCategory(category)
      setSearch(name)
    } catch {
      setCustomError('Unable to add this facility. It may already exist.')
    }
  }

  if (!facilities) {
    return (
      <div style={summaryBoxStyle}>
        <p style={{ margin: 0, color: '#71717a', fontSize: '0.82rem' }}>Loading available facilities...</p>
      </div>
    )
  }

  if (scopedFacilities.length === 0) {
    return (
      <div style={summaryBoxStyle}>
        <p style={{ margin: '0 0 4px', color: '#18181b', fontSize: '0.84rem', fontWeight: 800 }}>Facilities</p>
        <p style={{ margin: 0, color: '#71717a', fontSize: '0.82rem', lineHeight: 1.5 }}>
          No facilities are available for this scope yet. Run migrations or seed the default facilities catalogue before selecting them here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div style={summaryBoxStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 4px', color: '#18181b', fontSize: '0.86rem', fontWeight: 800 }}>Facilities</p>
            <p style={{ margin: 0, color: '#71717a', fontSize: '0.78rem', lineHeight: 1.5 }}>
              {selectedFacilities.length > 0 ? `${selectedFacilities.length} selected` : `No ${scope} facilities selected yet`}.
            </p>
          </div>
          <button type="button" onClick={() => setIsOpen(true)} style={manageButtonStyle}>Manage facilities</button>
        </div>

        {selectedFacilities.length > 0 && (
          <div style={selectedSummaryListStyle}>
            {selectedFacilities.slice(0, 8).map((facility) => (
              <span key={facility.id} style={selectedSummaryItemStyle}>
                <FacilityIcon facility={facility} compact />
                <span>{facility.name}</span>
              </span>
            ))}
            {selectedFacilities.length > 8 && <span style={moreItemStyle}>+{selectedFacilities.length - 8} more facilities</span>}
          </div>
        )}
      </div>

      {isOpen && (
        <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Manage facilities">
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <button type="button" onClick={() => setIsOpen(false)} style={closeButtonStyle} aria-label="Close facilities picker">×</button>
              <div>
                <h2 style={{ margin: 0, color: '#18181b', fontSize: '1.2rem', fontWeight: 900 }}>What this place offers</h2>
                <p style={{ margin: '6px 0 0', color: '#71717a', fontSize: '0.84rem' }}>
                  Select facilities available for this {scope}. Changes are saved when you submit the form.
                </p>
              </div>
            </div>

            <div style={stickySearchStyle}>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search facilities..."
                style={searchInputStyle}
                autoFocus
              />
              <span style={countBadgeStyle}>{selectedFacilities.length} selected</span>
            </div>

            <div style={modalBodyStyle}>
              <section style={customFacilityStyle}>
                <h3 style={categoryTitleStyle}>Add another facility</h3>
                <div style={customGridStyle}>
                  <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Facility name, e.g. Espresso machine" style={smallInputStyle} />
                  <input value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} list="facility-categories" placeholder="Category" style={smallInputStyle} />
                  <datalist id="facility-categories">
                    {categories.map((category) => <option key={category} value={category} />)}
                  </datalist>
                  <select value={customScope} onChange={(event) => setCustomScope(event.target.value as FacilityScope)} style={smallInputStyle}>
                    <option value={scope}>This {scope} type</option>
                    <option value="both">Property and unit</option>
                    <option value="property">Property only</option>
                    <option value="unit">Unit only</option>
                  </select>
                  <button type="button" onClick={handleAddCustomFacility} disabled={createFacility.isPending} style={addButtonStyle}>
                    {createFacility.isPending ? 'Adding...' : '+ Add'}
                  </button>
                </div>
                {customError && <p style={{ margin: '8px 0 0', color: '#dc2626', fontSize: '0.8rem' }}>{customError}</p>}
              </section>

              {Object.entries(grouped).map(([category, items]) => (
                <section key={category} style={categorySectionStyle}>
                  <h3 style={categoryTitleStyle}>{category}</h3>
                  <div style={{ display: 'grid' }}>
                    {items.map((facility) => {
                      const checked = selectedIds.includes(facility.id)
                      return (
                        <label key={facility.id} style={facilityRowStyle}>
                          <span style={facilityTextWrapStyle}>
                            <FacilityIcon facility={facility} />
                            <span style={{ display: 'grid', gap: '3px' }}>
                              <span style={{ color: '#18181b', fontSize: '0.92rem', fontWeight: 700 }}>{facility.name}</span>
                              {facility.scope === 'both' && <span style={{ color: '#71717a', fontSize: '0.76rem' }}>Available for properties and units</span>}
                            </span>
                          </span>
                          <input type="checkbox" checked={checked} onChange={() => toggleFacility(facility.id)} style={checkboxStyle} />
                        </label>
                      )
                    })}
                  </div>
                </section>
              ))}

              {filteredFacilities.length === 0 && (
                <p style={{ margin: 0, color: '#71717a', fontSize: '0.86rem' }}>No facilities match your search. Add it above if this is a new facility.</p>
              )}
            </div>

            <div style={modalFooterStyle}>
              <button type="button" onClick={() => setIsOpen(false)} style={doneButtonStyle}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FacilityIcon({ facility, compact = false }: { facility: Facility; compact?: boolean }) {
  const icon = iconMap[facility.icon ?? ''] ?? iconMap[defaultIconForCategory(facility.category ?? '')] ?? faCircleDot

  return (
    <span style={compact ? summaryIconStyle : rowIconStyle} aria-hidden="true">
      <FontAwesomeIcon icon={icon} />
    </span>
  )
}

function defaultIconForCategory(category: string): string {
  const normalized = category.toLowerCase()

  if (normalized.includes('bathroom')) return 'bath'
  if (normalized.includes('laundry')) return 'shirt'
  if (normalized.includes('entertainment')) return 'tv'
  if (normalized.includes('family')) return 'baby'
  if (normalized.includes('cooling') || normalized.includes('heating')) return 'fan'
  if (normalized.includes('internet') || normalized.includes('office')) return 'wifi'
  if (normalized.includes('kitchen') || normalized.includes('dining')) return 'utensils'
  if (normalized.includes('location')) return 'door-open'
  if (normalized.includes('outdoor')) return 'tree'
  if (normalized.includes('parking')) return 'parking'
  if (normalized.includes('service')) return 'bell-concierge'
  if (normalized.includes('safety')) return 'shield-halved'
  if (normalized.includes('policy')) return 'ban-smoking'

  return 'circle-dot'
}

const iconMap: Record<string, IconDefinition> = {
  baby: faBaby,
  'ban-smoking': faBanSmoking,
  bath: faBath,
  bed: faBed,
  'bell-concierge': faBellConcierge,
  'bowl-rice': faBowlRice,
  box: faBox,
  'box-archive': faBoxArchive,
  'box-open': faBoxOpen,
  'bread-slice': faBreadSlice,
  briefcase: faBriefcase,
  'calendar-days': faCalendarDays,
  chair: faChair,
  'circle-dot': faCircleDot,
  'door-open': faDoorOpen,
  fan: faFan,
  'fire-burner': faFireBurner,
  'fire-extinguisher': faFireExtinguisher,
  gamepad: faGamepad,
  'hot-tub-person': faHotTubPerson,
  key: faKey,
  'kit-medical': faKitMedical,
  lock: faLock,
  'mug-hot': faMugHot,
  parking: faSquareParking,
  'people-roof': faPeopleRoof,
  'pump-soap': faPumpSoap,
  scroll: faScroll,
  'shield-halved': faShieldHalved,
  shirt: faShirt,
  smog: faSmog,
  snowflake: faSnowflake,
  soap: faSoap,
  'spray-can-sparkles': faSprayCanSparkles,
  table: faTable,
  toilet: faToilet,
  tree: faTree,
  'triangle-exclamation': faTriangleExclamation,
  tv: faTv,
  'umbrella-beach': faUmbrellaBeach,
  utensils: faUtensils,
  video: faVideo,
  'volume-high': faVolumeHigh,
  'water-ladder': faWaterLadder,
  wheelchair: faWheelchair,
  wifi: faWifi,
  wind: faWind,
  'window-maximize': faWindowMaximize,
}

const summaryBoxStyle: React.CSSProperties = {
  border: '1px solid #e4e4e7',
  borderRadius: '14px',
  background: '#ffffff',
  padding: '16px 18px',
}

const manageButtonStyle: React.CSSProperties = {
  minHeight: '38px',
  border: '1px solid #d4d4d8',
  borderRadius: '10px',
  background: '#ffffff',
  color: '#18181b',
  cursor: 'pointer',
  fontSize: '0.84rem',
  fontWeight: 800,
  padding: '0 14px',
  whiteSpace: 'nowrap',
}

const selectedSummaryListStyle: React.CSSProperties = {
  marginTop: '16px',
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: '28px',
  rowGap: '14px',
}

const selectedSummaryItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  minHeight: '30px',
  color: '#18181b',
  fontSize: '0.92rem',
  fontWeight: 500,
  lineHeight: 1.35,
}

const moreItemStyle: React.CSSProperties = {
  ...selectedSummaryItemStyle,
  color: '#52525b',
  fontSize: '0.84rem',
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(24, 24, 27, 0.45)',
  padding: '24px',
}

const modalStyle: React.CSSProperties = {
  width: 'min(860px, 100%)',
  maxHeight: '88vh',
  borderRadius: '28px',
  background: '#ffffff',
  boxShadow: '0 24px 70px rgba(15, 23, 42, 0.22)',
  display: 'grid',
  gridTemplateRows: 'auto auto 1fr auto',
  overflow: 'hidden',
}

const modalHeaderStyle: React.CSSProperties = {
  display: 'grid',
  gap: '22px',
  padding: '24px 28px 14px',
}

const closeButtonStyle: React.CSSProperties = {
  width: '34px',
  height: '34px',
  border: '0',
  borderRadius: '999px',
  background: '#ffffff',
  color: '#18181b',
  cursor: 'pointer',
  fontSize: '1.7rem',
  lineHeight: 1,
  padding: 0,
}

const stickySearchStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  borderBottom: '1px solid #e4e4e7',
  padding: '0 28px 16px',
}

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '42px',
  border: '1px solid #d4d4d8',
  borderRadius: '12px',
  background: '#ffffff',
  color: '#18181b',
  fontSize: '0.9rem',
  padding: '0 12px',
}

const countBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '30px',
  borderRadius: '999px',
  background: '#eff6ff',
  color: '#2563eb',
  fontSize: '0.76rem',
  fontWeight: 800,
  padding: '0 10px',
  whiteSpace: 'nowrap',
}

const modalBodyStyle: React.CSSProperties = {
  overflowY: 'auto',
  padding: '0 28px 18px',
}

const customFacilityStyle: React.CSSProperties = {
  borderBottom: '1px solid #e4e4e7',
  padding: '18px 0 20px',
}

const customGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(180px, 1.5fr) minmax(140px, 1fr) minmax(140px, 1fr) auto',
  gap: '8px',
}

const smallInputStyle: React.CSSProperties = {
  minHeight: '38px',
  border: '1px solid #d4d4d8',
  borderRadius: '10px',
  background: '#ffffff',
  color: '#18181b',
  fontSize: '0.84rem',
  padding: '0 10px',
}

const addButtonStyle: React.CSSProperties = {
  minHeight: '38px',
  border: '0',
  borderRadius: '10px',
  background: '#2563eb',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: '0.84rem',
  fontWeight: 900,
  padding: '0 12px',
}

const categorySectionStyle: React.CSSProperties = {
  padding: '22px 0 4px',
}

const categoryTitleStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#18181b',
  fontSize: '1rem',
  fontWeight: 900,
}

const facilityRowStyle: React.CSSProperties = {
  minHeight: '62px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  borderBottom: '1px solid #e4e4e7',
  cursor: 'pointer',
}

const facilityTextWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  minWidth: 0,
}

const rowIconStyle: React.CSSProperties = {
  width: '26px',
  minWidth: '26px',
  display: 'inline-flex',
  justifyContent: 'center',
  color: '#18181b',
  fontSize: '1.1rem',
}

const summaryIconStyle: React.CSSProperties = {
  width: '24px',
  minWidth: '24px',
  display: 'inline-flex',
  justifyContent: 'center',
  color: '#18181b',
  fontSize: '1.05rem',
}

const checkboxStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  accentColor: '#2563eb',
}

const modalFooterStyle: React.CSSProperties = {
  borderTop: '1px solid #e4e4e7',
  padding: '16px 28px',
  display: 'flex',
  justifyContent: 'flex-end',
}

const doneButtonStyle: React.CSSProperties = {
  minHeight: '42px',
  border: '0',
  borderRadius: '12px',
  background: '#2563eb',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: '0.88rem',
  fontWeight: 900,
  padding: '0 18px',
}
