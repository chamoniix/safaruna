'use client'

import { useState } from 'react'
import { APPLICATION_PHOTO_KINDS, APPLICATION_PHOTO_LABELS, type ApplicationMediaView, type ApplicationPhotoKind } from '@/lib/guide-application-media'

function PrivatePhoto({ url, kind }: { url: string; kind: ApplicationPhotoKind }) {
  const [failed, setFailed] = useState(false)
  return <>
    {failed ? <p role="status" style={{ color: '#991B1B', fontSize: 13 }}>Photo indisponible. Rechargez la page ou reconnectez-vous.</p>
      // Deliberately bypass the public image optimizer: authentication cookies are needed on every read.
      // eslint-disable-next-line @next/next/no-img-element
      : <img src={url} alt={APPLICATION_PHOTO_LABELS[kind]} loading="lazy" onError={() => setFailed(true)} style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8, background: '#F8F6F2' }} />}
    <a href={`${url}?download=1`} style={{ display: 'inline-block', marginTop: 10, color: '#6B5218', fontWeight: 700, fontSize: 12 }}>Télécharger la photo</a>
  </>
}

export default function ApplicationMediaPanel({ data }: { data: ApplicationMediaView | null }) {
  return <section style={{ marginTop: 20, padding: 18, border: '1px solid #E8DFC8', borderRadius: 12, background: 'white', color: '#1A1209' }}>
    <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Photo proposée et véhicule personnel</h3>
    <p style={{ margin: '0 0 16px', fontSize: 12, lineHeight: 1.6, color: '#7A6D5A' }}>Informations en lecture seule. L’envoi d’une photo ne la publie pas automatiquement. Seul le Superadmin peut publier le portrait. Les photos du véhicule restent privées.</p>
    {!data ? <p style={{ margin: 0, color: '#7A6D5A', fontSize: 13 }}>Aucune photo ni information de véhicule renseignée dans une candidature associée à ce profil.</p> : <>
      <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, margin: '0 0 18px', fontSize: 13 }}>
        {[
          ['Véhicule personnel', data.hasPersonalVehicle === null ? 'Non renseigné' : data.hasPersonalVehicle ? 'Oui' : 'Non'],
          ...(data.hasPersonalVehicle ? [
            ['Modèle', data.vehicleModel || 'Non renseigné'],
            ['Année', data.vehicleYear?.toString() || 'Non renseigné'],
            ['Places, hors conducteur', data.vehiclePassengerSeats?.toString() || 'Non renseigné'],
            ['Couleur', data.vehicleColor || 'Non renseigné'],
            ['Nombre de places confirmé', data.vehicleSeatsConfirmed === null ? 'Non renseigné' : data.vehicleSeatsConfirmed ? 'Oui' : 'Non'],
          ] : []),
        ].map(([label, value]) => <div key={label}><dt style={{ color: '#7A6D5A', marginBottom: 4 }}>{label}</dt><dd style={{ margin: 0, fontWeight: 600, overflowWrap: 'anywhere' }}>{value}</dd></div>)}
      </dl>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 14 }}>
        {APPLICATION_PHOTO_KINDS.filter(kind => kind === 'profile' || data.hasPersonalVehicle).map(kind => <div key={kind} style={{ minWidth: 0, border: '1px solid #E8DFC8', borderRadius: 10, padding: 12 }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 13 }}>{kind === 'profile' ? 'Portrait transmis à l’équipe' : APPLICATION_PHOTO_LABELS[kind]}</h4>
          {data.photos[kind] ? <PrivatePhoto key={data.photos[kind]} url={data.photos[kind]} kind={kind} /> : <p style={{ margin: 0, color: '#7A6D5A', fontSize: 12 }}>Non renseigné</p>}
        </div>)}
      </div>
    </>}
  </section>
}
