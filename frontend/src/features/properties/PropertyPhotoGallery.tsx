import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Page'
import { useDeletePropertyPhoto, useSetPropertyPhotoCover, useUploadPropertyPhoto } from './api'
import type { PropertyPhoto } from './types'

interface PropertyPhotoGalleryProps {
  propertyId: number
  photos?: PropertyPhoto[]
}

export default function PropertyPhotoGallery({ propertyId, photos = [] }: PropertyPhotoGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState('')
  const upload = useUploadPropertyPhoto(propertyId)
  const remove = useDeletePropertyPhoto(propertyId)
  const setCover = useSetPropertyPhotoCover(propertyId)

  const cover = photos.find((photo) => photo.is_cover) ?? photos[0]
  const secondary = photos.filter((photo) => photo.id !== cover?.id).slice(0, 4)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    setError('')

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.')
        continue
      }

      await upload.mutateAsync({ file })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, color: '#18181b', fontSize: '1.05rem', fontWeight: 900 }}>Property photos</h2>
          <p style={{ margin: '4px 0 0', color: '#71717a', fontSize: '0.84rem' }}>
            Use photos to identify this property and prepare richer listing profiles.
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => void handleFiles(event.target.files)}
            style={{ display: 'none' }}
          />
          <Button type="button" size="sm" variant="primary" onClick={openFilePicker} disabled={upload.isPending}>
            {upload.isPending ? 'Uploading...' : '+ Upload photos'}
          </Button>
        </div>
      </div>

      {error && <p style={{ margin: '12px 0 0', color: '#dc2626', fontSize: '0.82rem' }}>{error}</p>}

      {photos.length === 0 ? (
        <button type="button" onClick={openFilePicker} disabled={upload.isPending} style={emptyUploadStyle}>
          <span style={{ margin: '0 0 8px', color: '#18181b', fontSize: '0.94rem', fontWeight: 900 }}>No property photos yet.</span>
          <span style={{ margin: 0, color: '#71717a', fontSize: '0.84rem', lineHeight: 1.5 }}>
            Upload a cover photo first, then add a few supporting photos for the property.
          </span>
          <span style={emptyUploadButtonStyle}>{upload.isPending ? 'Uploading...' : '+ Upload photos'}</span>
        </button>
      ) : (
        <>
          <div style={galleryStyle}>
            {cover && (
              <PhotoTile
                photo={cover}
                large
                onDelete={() => remove.mutate(cover.id)}
                onSetCover={() => setCover.mutate(cover.id)}
                disabled={remove.isPending || setCover.isPending}
              />
            )}
            <div style={secondaryGridStyle}>
              {secondary.map((photo) => (
                <PhotoTile
                  key={photo.id}
                  photo={photo}
                  onDelete={() => remove.mutate(photo.id)}
                  onSetCover={() => setCover.mutate(photo.id)}
                  disabled={remove.isPending || setCover.isPending}
                />
              ))}
              {secondary.length < 4 && Array.from({ length: 4 - secondary.length }).map((_, index) => (
                <button key={`empty-${index}`} type="button" onClick={openFilePicker} style={addTileStyle}>
                  + Add photo
                </button>
              ))}
            </div>
          </div>

          <div style={photoListStyle}>
            {photos.map((photo) => (
              <div key={photo.id} style={photoListItemStyle}>
                <img src={photo.url} alt={photo.caption || 'Property photo'} style={thumbStyle} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, color: '#18181b', fontSize: '0.84rem', fontWeight: 800 }}>{photo.is_cover ? 'Cover photo' : 'Property photo'}</p>
                  <p style={{ margin: '3px 0 0', color: '#71717a', fontSize: '0.76rem' }}>{photo.caption || 'No caption'}</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {!photo.is_cover && <Button type="button" size="sm" onClick={() => setCover.mutate(photo.id)} disabled={setCover.isPending}>Set cover</Button>}
                  <Button type="button" size="sm" variant="danger" onClick={() => remove.mutate(photo.id)} disabled={remove.isPending}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function PhotoTile({ photo, large = false, onDelete, onSetCover, disabled }: { photo: PropertyPhoto; large?: boolean; onDelete: () => void; onSetCover: () => void; disabled: boolean }) {
  return (
    <div style={large ? largeTileStyle : tileStyle}>
      <img src={photo.url} alt={photo.caption || 'Property photo'} style={imageStyle} />
      {photo.is_cover && <span style={coverBadgeStyle}>Cover</span>}
      <div style={tileActionsStyle}>
        {!photo.is_cover && <button type="button" onClick={onSetCover} disabled={disabled} style={tileButtonStyle}>Set cover</button>}
        <button type="button" onClick={onDelete} disabled={disabled} style={dangerTileButtonStyle}>Delete</button>
      </div>
    </div>
  )
}

const sectionStyle: React.CSSProperties = {
  border: '1px solid #e4e4e7',
  borderRadius: '18px',
  background: '#ffffff',
  padding: '18px',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '14px',
  alignItems: 'flex-start',
}

const emptyUploadStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '14px',
  display: 'grid',
  justifyItems: 'start',
  gap: '4px',
  textAlign: 'left',
  border: '1px dashed #d4d4d8',
  borderRadius: '16px',
  background: '#fafafa',
  padding: '28px',
  cursor: 'pointer',
}

const emptyUploadButtonStyle: React.CSSProperties = {
  marginTop: '14px',
  display: 'inline-flex',
  minHeight: '38px',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '10px',
  background: '#2563eb',
  color: '#ffffff',
  fontSize: '0.86rem',
  fontWeight: 900,
  padding: '0 14px',
}

const galleryStyle: React.CSSProperties = {
  marginTop: '16px',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.3fr) minmax(280px, 0.9fr)',
  gap: '8px',
}

const secondaryGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '8px',
}

const largeTileStyle: React.CSSProperties = {
  position: 'relative',
  minHeight: '330px',
  borderRadius: '18px 0 0 18px',
  overflow: 'hidden',
  background: '#f4f4f5',
}

const tileStyle: React.CSSProperties = {
  position: 'relative',
  minHeight: '160px',
  overflow: 'hidden',
  background: '#f4f4f5',
}

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
}

const coverBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '12px',
  left: '12px',
  borderRadius: '999px',
  background: '#ffffff',
  color: '#18181b',
  fontSize: '0.72rem',
  fontWeight: 900,
  padding: '5px 9px',
}

const tileActionsStyle: React.CSSProperties = {
  position: 'absolute',
  right: '10px',
  bottom: '10px',
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
}

const tileButtonStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.92)',
  color: '#18181b',
  cursor: 'pointer',
  fontSize: '0.7rem',
  fontWeight: 900,
  padding: '6px 9px',
}

const dangerTileButtonStyle: React.CSSProperties = {
  ...tileButtonStyle,
  color: '#dc2626',
}

const addTileStyle: React.CSSProperties = {
  minHeight: '160px',
  border: '1px dashed #d4d4d8',
  background: '#fafafa',
  color: '#52525b',
  cursor: 'pointer',
  fontSize: '0.82rem',
  fontWeight: 800,
}

const photoListStyle: React.CSSProperties = {
  marginTop: '16px',
  display: 'grid',
  gap: '8px',
}

const photoListItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  border: '1px solid #e4e4e7',
  borderRadius: '14px',
  padding: '10px',
}

const thumbStyle: React.CSSProperties = {
  width: '70px',
  height: '52px',
  borderRadius: '10px',
  objectFit: 'cover',
  background: '#f4f4f5',
}
