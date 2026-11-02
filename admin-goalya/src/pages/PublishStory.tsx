import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { formatFirebaseError } from '../lib/errors';
import { getVideoDuration, uploadFile } from '../lib/upload';
import type { StoryType } from '../types';

const CHAPTERS = [
  "Chapitre 0 · Avant le coup d'envoi",
  'Chapitre 1 · Phase de groupes',
  'Chapitre 2 · Huitièmes',
  'Chapitre 3 · Quarts',
  'Chapitre 4 · Demi-finales',
  'Chapitre 5 · Finale',
];

export function PublishStory() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [type, setType] = useState<StoryType>('goal');
  const [label, setLabel] = useState('');
  const [matchId, setMatchId] = useState('');
  const [country, setCountry] = useState('FRA');
  const [chapter, setChapter] = useState(CHAPTERS[0]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const publish = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoFile || !thumbFile) {
      setMsg('Vidéo et miniature requises');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await auth.currentUser?.getIdToken(true);
      const storyId = `story_${Date.now()}`;
      const date = new Date().toISOString().split('T')[0];
      setMsg('Envoi de la vidéo…');
      const videoUrl = await uploadFile(`stories/${date}/${storyId}.mp4`, videoFile);
      setMsg('Envoi de la miniature…');
      const thumbnailUrl = await uploadFile(`thumbnails/stories/${storyId}.jpg`, thumbFile);
      const duration = await getVideoDuration(videoFile);
      setMsg('Enregistrement Firestore…');

      await setDoc(doc(db, 'content_stories', storyId), {
        videoUrl,
        thumbnailUrl,
        type,
        label,
        matchId,
        country,
        chapter,
        duration,
        publishedAt: serverTimestamp(),
        views: 0,
        isActive: true,
        postedBy: auth.currentUser?.email ?? 'admin',
      });

      setMsg('Story publiée — visible dans l’app immédiatement.');
      setVideoFile(null);
      setThumbFile(null);
      setLabel('');
    } catch (err) {
      setMsg(formatFirebaseError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell">
      <Link to="/">← Dashboard</Link>
      <h1>Publier une Story</h1>
      <form className="card" onSubmit={publish}>
        <label>Vidéo (mp4, max ~30s)</label>
        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
        <label>Miniature (jpg/png)</label>
        <input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)} />
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as StoryType)}>
          <option value="goal">But</option>
          <option value="dribble">Dribble</option>
          <option value="moment">Moment fort</option>
          <option value="highlight">Highlight</option>
          <option value="celebration">Célébration</option>
          <option value="live_fans">Live fans</option>
        </select>
        <label>Label (affiché dans l&apos;app)</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="But rapide" required />
        <label>Match ID</label>
        <input value={matchId} onChange={(e) => setMatchId(e.target.value)} placeholder="fixture_123" />
        <label>Pays</label>
        <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="FRA" />
        <label>Chapitre</label>
        <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
          {CHAPTERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {msg ? <p className={msg.startsWith('Story') ? 'ok' : 'err'}>{msg}</p> : null}
        <button type="submit" disabled={busy} style={{ marginTop: 16 }}>
          {busy ? 'Publication…' : 'Publier la Story'}
        </button>
      </form>
    </div>
  );
}
