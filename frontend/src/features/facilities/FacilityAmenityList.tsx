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
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { Facility } from './types'

interface FacilityAmenityListProps {
  facilities?: Facility[]
  emptyText?: string
  maxVisible?: number
}

export default function FacilityAmenityList({ facilities = [], emptyText = 'No facilities selected.', maxVisible }: FacilityAmenityListProps) {
  const visibleFacilities = maxVisible ? facilities.slice(0, maxVisible) : facilities
  const hiddenCount = maxVisible && facilities.length > maxVisible ? facilities.length - maxVisible : 0

  if (facilities.length === 0) {
    return <p style={{ margin: 0, color: '#71717a', fontSize: '0.86rem' }}>{emptyText}</p>
  }

  return (
    <div style={amenityGridStyle}>
      {visibleFacilities.map((facility) => (
        <div key={facility.id} style={amenityItemStyle}>
          <FacilityIcon facility={facility} />
          <span>{facility.name}</span>
        </div>
      ))}
      {hiddenCount > 0 && <div style={moreItemStyle}>+{hiddenCount} more facilities</div>}
    </div>
  )
}

export function FacilityIcon({ facility }: { facility: Facility }) {
  const icon = iconMap[facility.icon ?? ''] ?? iconMap[defaultIconForCategory(facility.category ?? '')] ?? faCircleDot

  return (
    <span style={iconStyle} aria-hidden="true">
      <FontAwesomeIcon icon={icon} />
    </span>
  )
}

export function defaultIconForCategory(category: string): string {
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

export const iconMap: Record<string, IconDefinition> = {
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

const amenityGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: '32px',
  rowGap: '16px',
}

const amenityItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  minWidth: 0,
  color: '#18181b',
  fontSize: '0.92rem',
  fontWeight: 500,
  lineHeight: 1.35,
}

const iconStyle: React.CSSProperties = {
  width: '26px',
  minWidth: '26px',
  display: 'inline-flex',
  justifyContent: 'center',
  color: '#18181b',
  fontSize: '1.08rem',
}

const moreItemStyle: React.CSSProperties = {
  ...amenityItemStyle,
  color: '#52525b',
  fontSize: '0.84rem',
}
