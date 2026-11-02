import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { StoryDoc, VideoDoc } from '../types';

function mapStory(id: string, data: Record<string, unknown>): StoryDoc {
  return {
    id,
    videoUrl: String(data.videoUrl ?? ''),
    thumbnailUrl: String(data.thumbnailUrl ?? ''),
    type: (data.type as StoryDoc['type']) ?? 'moment',
    label: String(data.label ?? ''),
    matchId: String(data.matchId ?? ''),
    country: String(data.country ?? ''),
    duration: Number(data.duration ?? 0),
    views: Number(data.views ?? 0),
    isActive: Boolean(data.isActive ?? true),
    chapter: String(data.chapter ?? ''),
    postedBy: String(data.postedBy ?? ''),
  };
}

function mapVideo(id: string, data: Record<string, unknown>): VideoDoc {
  return {
    id,
    videoUrl: String(data.videoUrl ?? ''),
    thumbnailUrl: String(data.thumbnailUrl ?? ''),
    type: (data.type as VideoDoc['type']) ?? 'highlight',
    title: String(data.title ?? ''),
    matchId: String(data.matchId ?? ''),
    duration: Number(data.duration ?? 0),
    views: Number(data.views ?? 0),
    isActive: Boolean(data.isActive ?? true),
    chapter: String(data.chapter ?? ''),
    episodeNumber: typeof data.episodeNumber === 'string' ? data.episodeNumber : undefined,
    postedBy: String(data.postedBy ?? ''),
  };
}

export function ManageContent() {
  const [stories, setStories] = useState<StoryDoc[]>([]);
  const [videos, setVideos] = useState<VideoDoc[]>([]);

  useEffect(() => {
    const unsubS = onSnapshot(query(collection(db, 'content_stories'), orderBy('publishedAt', 'desc')), (snap) => {
      setStories(snap.docs.map((d) => mapStory(d.id, d.data() as Record<string, unknown>)));
    });
    const unsubV = onSnapshot(query(collection(db, 'content_videos'), orderBy('publishedAt', 'desc')), (snap) => {
      setVideos(snap.docs.map((d) => mapVideo(d.id, d.data() as Record<string, unknown>)));
    });
    return () => {
      unsubS();
      unsubV();
    };
  }, []);

  const toggle = async (collectionName: string, id: string, current: boolean) => {
    await updateDoc(doc(db, collectionName, id), { isActive: !current });
  };

  return (
    <div className="shell">
      <Link to="/">← Dashboard</Link>
      <h1>Gérer le contenu</h1>

      <div className="card">
        <h2>Stories ({stories.length})</h2>
        <table className="table">
          <thead>
            <tr>
              <th />
              <th>Label</th>
              <th>Vues</th>
              <th>Actif</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {stories.map((s) => (
              <tr key={s.id}>
                <td>{s.thumbnailUrl ? <img src={s.thumbnailUrl} alt="" className="thumb" /> : null}</td>
                <td>{s.label}</td>
                <td>{s.views}</td>
                <td>{s.isActive ? 'Oui' : 'Non'}</td>
                <td>
                  <button type="button" className="btn-danger" onClick={() => void toggle('content_stories', s.id, s.isActive)}>
                    {s.isActive ? 'Masquer' : 'Activer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Vidéos ({videos.length})</h2>
        <table className="table">
          <thead>
            <tr>
              <th />
              <th>Titre</th>
              <th>Type</th>
              <th>Vues</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id}>
                <td>{v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" className="thumb" /> : null}</td>
                <td>{v.title}</td>
                <td>{v.type}</td>
                <td>{v.views}</td>
                <td>
                  <button type="button" className="btn-danger" onClick={() => void toggle('content_videos', v.id, v.isActive)}>
                    {v.isActive ? 'Masquer' : 'Activer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
