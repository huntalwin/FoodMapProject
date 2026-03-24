import { useState, useEffect } from 'react';
import type { UserPhoto } from '../../types';
import { getUserPhotosByPlaceId, deleteUserPhoto } from '../../db';
import { getPhotoUrl } from '../../api/places';
import { useAppStore } from '../../store/useAppStore';
import './PhotoGallery.css';

interface Props {
  placeId: string;
  googlePhotoRefs: string[];
  refreshKey?: number;
}

export function PhotoGallery({ placeId, googlePhotoRefs, refreshKey }: Props) {
  const [tab, setTab] = useState<'google' | 'mine'>('google');
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const userVisits = useAppStore((s) => s.userVisits);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const photos = await getUserPhotosByPlaceId(placeId);
      if (cancelled) return;
      const urls: Record<string, string> = {};
      for (const p of photos) {
        urls[p.id] = URL.createObjectURL(p.blob);
      }
      setUserPhotos(photos);
      setObjectUrls(urls);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [placeId, refreshKey, userVisits]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(objectUrls).forEach(URL.revokeObjectURL);
    };
  }, [objectUrls]);

  async function handleDelete(photo: UserPhoto) {
    URL.revokeObjectURL(objectUrls[photo.id]);
    await deleteUserPhoto(photo.id);
    setUserPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    setObjectUrls((prev) => {
      const next = { ...prev };
      delete next[photo.id];
      return next;
    });
  }

  const googleUrls = googlePhotoRefs.map((ref) => getPhotoUrl(ref));
  const myUrls = userPhotos.map((p) => objectUrls[p.id]).filter(Boolean);
  const activeUrls = tab === 'google' ? googleUrls : myUrls;

  return (
    <div className="photo-gallery">
      <div className="gallery-tabs">
        <button
          className={`gallery-tab ${tab === 'google' ? 'active' : ''}`}
          onClick={() => setTab('google')}
        >
          Google Photos {googlePhotoRefs.length > 0 && `(${googlePhotoRefs.length})`}
        </button>
        <button
          className={`gallery-tab ${tab === 'mine' ? 'active' : ''}`}
          onClick={() => setTab('mine')}
        >
          My Photos {userPhotos.length > 0 && `(${userPhotos.length})`}
        </button>
      </div>

      {activeUrls.length === 0 ? (
        <div className="gallery-empty">
          {tab === 'google' ? 'No photos available' : 'No photos added yet'}
        </div>
      ) : (
        <div className="gallery-grid">
          {tab === 'google'
            ? googleUrls.map((url, i) => (
                <div key={i} className="gallery-thumb-wrapper" onClick={() => setLightboxIndex(i)}>
                  <img src={url} alt="" className="gallery-thumb" loading="lazy" />
                </div>
              ))
            : userPhotos.map((photo, i) => (
                <div key={photo.id} className="gallery-thumb-wrapper">
                  <img
                    src={objectUrls[photo.id]}
                    alt=""
                    className="gallery-thumb"
                    onClick={() => setLightboxIndex(i)}
                  />
                  <button
                    className="gallery-delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(photo); }}
                    title="Delete photo"
                  >✕</button>
                </div>
              ))}
        </div>
      )}

      {lightboxIndex !== null && activeUrls[lightboxIndex] && (
        <div className="lightbox" onClick={() => setLightboxIndex(null)}>
          <button className="lightbox-close">✕</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-img-wrapper">
              {lightboxIndex > 0 && (
                <button className="lightbox-prev" onClick={() => setLightboxIndex(lightboxIndex - 1)}>‹</button>
              )}
              <img src={activeUrls[lightboxIndex]} alt="" className="lightbox-img" />
              {lightboxIndex < activeUrls.length - 1 && (
                <button className="lightbox-next" onClick={() => setLightboxIndex(lightboxIndex + 1)}>›</button>
              )}
            </div>
            <p className="lightbox-caption">
              {tab === 'mine' && userPhotos[lightboxIndex]
                ? `Uploaded ${new Date(userPhotos[lightboxIndex].uploadedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Photo via Google'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
