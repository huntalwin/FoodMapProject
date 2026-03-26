import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useUserLocation } from '../../hooks/useUserLocation';
import { PhotoGallery } from './PhotoGallery';
import { VisitForm } from '../VisitForm/VisitForm';
import './DetailPanel.css';

const PRICE_LABELS: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };

export function DetailPanel() {
  const selectedRestaurant = useAppStore((s) => s.selectedRestaurant);
  const isDetailPanelOpen = useAppStore((s) => s.isDetailPanelOpen);
  const closeDetailPanel = useAppStore((s) => s.closeDetailPanel);
  const userVisits = useAppStore((s) => s.userVisits);
  const removeVisit = useAppStore((s) => s.removeVisit);
  const userLocation = useUserLocation();

  const [showForm, setShowForm] = useState(false);
  const [photoRefreshKey, setPhotoRefreshKey] = useState(0);

  if (!selectedRestaurant) return null;
  const r = selectedRestaurant;

  const visit = userVisits[r.placeId];
  const isVisited = !!visit;

  function handleDirections() {
    const dest = `${r.lat},${r.lng}`;
    let url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=transit`;
    if (userLocation) {
      url += `&origin=${userLocation.lat},${userLocation.lng}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleSaved() {
    setShowForm(false);
    setPhotoRefreshKey((k) => k + 1);
  }

  return (
    <div className={`detail-panel ${isDetailPanelOpen ? 'open' : ''}`}>
      <div className="detail-header">
        <button className="detail-close" onClick={closeDetailPanel} aria-label="Close">✕</button>
        {isVisited && <span className="visited-tag">✓ Visited</span>}
      </div>

      <div className="detail-body">
        <h2 className="detail-name">{r.name}</h2>

        <div className="detail-meta">
          {r.priceLevel && <span className="meta-chip price">{PRICE_LABELS[r.priceLevel]}</span>}
          {r.cuisineTypes.slice(0, 3).map((t) => (
            <span key={t} className="meta-chip cuisine">{t.replace(/_/g, ' ')}</span>
          ))}
        </div>

        <div className="detail-info-list">
          <div className="detail-info-row">
            <span className="info-icon">📍</span>
            <span>{r.address}</span>
          </div>
          {r.phoneNumber && (
            <div className="detail-info-row">
              <span className="info-icon">📞</span>
              <a href={`tel:${r.phoneNumber}`} className="info-link">{r.phoneNumber}</a>
            </div>
          )}
          {r.websiteUri && (
            <div className="detail-info-row">
              <span className="info-icon">🌐</span>
              <a href={r.websiteUri} target="_blank" rel="noopener noreferrer" className="info-link website-link">
                {r.websiteUri.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </div>
          )}
        </div>

        {r.openNow !== undefined && (
          <div className="opening-hours-section">
            <span className={`open-status ${r.openNow ? 'open' : 'closed'}`}>
              {r.openNow ? '● Open now' : '● Closed now'}
            </span>
            {r.weekdayHours && (
              <div className="hours-list">
                {r.weekdayHours.map((line, i) => {
                  const [day, ...rest] = line.split(': ');
                  return (
                    <div key={i} className="hours-row">
                      <span className="hours-day">{day}</span>
                      <span className="hours-time">{rest.join(': ')}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="detail-actions">
          <button className="btn-directions" onClick={handleDirections}>
            🧭 Show Directions
          </button>
          <button
            className={`btn-visit ${isVisited ? 'btn-edit' : ''}`}
            onClick={() => setShowForm((v) => !v)}
          >
            {isVisited
              ? showForm ? 'Cancel' : '✏️ Edit Visit'
              : showForm ? 'Cancel' : '+ Mark as Visited'}
          </button>
        </div>

        {isVisited && !showForm && (
          <button
            className="btn-unvisit"
            onClick={() => removeVisit(r.placeId)}
          >
            Remove Pin
          </button>
        )}

        {isVisited && !showForm && (
          <div className="visit-summary">
            <div className="summary-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={`summary-star ${s <= visit.rating ? 'filled' : ''}`}>★</span>
              ))}
            </div>
            {visit.notes && <p className="summary-notes">{visit.notes}</p>}
          </div>
        )}

        {showForm && (
          <div className="visit-form-wrapper">
            <VisitForm
              restaurant={r}
              existingVisit={visit}
              onSaved={handleSaved}
            />
          </div>
        )}

        <PhotoGallery
          placeId={r.placeId}
          googlePhotoRefs={r.googlePhotoRefs}
          refreshKey={photoRefreshKey}
        />
      </div>
    </div>
  );
}
