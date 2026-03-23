import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppStore } from '../../store/useAppStore';
import type { Restaurant, UserVisit } from '../../types';
import './VisitForm.css';

interface Props {
  restaurant: Restaurant;
  existingVisit?: UserVisit;
  onSaved: () => void;
}

export function VisitForm({ restaurant, existingVisit, onSaved }: Props) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(existingVisit?.rating ?? 3);
  const [notes, setNotes] = useState(existingVisit?.notes ?? '');
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const markVisited = useAppStore((s) => s.markVisited);
  const updateVisit = useAppStore((s) => s.updateVisit);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted].slice(0, 10));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 10,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (existingVisit) {
        await updateVisit(restaurant.placeId, { rating, notes }, files);
      } else {
        await markVisited(restaurant, { rating, notes }, files);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const displayStar = hoveredStar ?? rating;

  return (
    <form className="visit-form" onSubmit={handleSubmit}>
      <div className="visit-form-section">
        <label className="visit-label">Your Rating</label>
        <div className="star-rating" onMouseLeave={() => setHoveredStar(null)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${star <= displayStar ? 'filled' : ''}`}
              onClick={() => setRating(star as 1 | 2 | 3 | 4 | 5)}
              onMouseEnter={() => setHoveredStar(star)}
              aria-label={`Rate ${star} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="visit-form-section">
        <label className="visit-label" htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          className="visit-notes"
          placeholder="What did you think? What did you order?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
          rows={4}
        />
        <div className="notes-count">{notes.length}/1000</div>
      </div>

      <div className="visit-form-section">
        <label className="visit-label">Add Photos</label>
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
        >
          <input {...getInputProps()} />
          <span className="dropzone-icon">📷</span>
          <span>{isDragActive ? 'Drop here' : 'Drag photos or click to upload'}</span>
        </div>

        {files.length > 0 && (
          <div className="file-preview-list">
            {files.map((f, i) => (
              <div key={i} className="file-preview">
                <img src={URL.createObjectURL(f)} alt={f.name} />
                <button type="button" className="file-remove" onClick={() => removeFile(i)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="visit-submit" disabled={saving}>
        {saving ? 'Saving...' : existingVisit ? 'Update Visit' : 'Mark as Visited ✓'}
      </button>
    </form>
  );
}
