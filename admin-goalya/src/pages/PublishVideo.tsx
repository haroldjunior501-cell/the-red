import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { formatFirebaseError } from '../lib/errors';
import { getVideoDurationLong, uploadFile } from '../lib/upload';
import type { VideoType } from '../types';

const CHAPTERS = [
  "Chapitre 0 · Avant le coup d'envoi",
  'Chapitre 1 · Phase de groupes',
  'Chapitre 2 · Huitièmes',
  'Chapitre 3 · Quarts',
  'Chapitre 4 · Demi-finales',
  'Chapitre 5 · Finale',
];

export function PublishVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [type, setType] = useState<VideoType>('highlight');
  const [title, setTitle] = useState('');
  const [matchId, setMatchId] = useState('');
  const [chapter, setChapter] = useState(CHAPTERS[0]);
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
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
      const videoId = `video_${Date.now()}`;
      const folder =
        type === 'immanquable'
          ? 'immanquable'
          : type === 'summary'
            ? 'summaries'
            : type === 'documentary'
              ? 'documentaries'
              : 'highlights';
      setMsg('Envoi de la vidéo…');
      const videoUrl = await uploadFile(`videos/${folder}/${videoId}.mp4`, videoFile);
      setMsg('Envoi de la miniature…');
      const thumbnailUrl = await uploadFile(`thumbnails/videos/${videoId}.jpg`, thumbFile);
      const duration = await getVideoDurationLong(videoFile);
      setMsg('Enregistrement Firestore…');

      await setDoc(doc(db, 'content_videos', videoId), {
        videoUrl,
        thumbnailUrl,
        type,
        title,
        matchId,
        duration,
        publishedAt: serverTimestamp(),
        views: 0,
        isActive: true,
        chapter,
        episodeNumber: episodeNumber || undefined,
        ctaLabel: ctaLabel.trim() || undefined,
        likes: 0,
        shares: 0,
        postedBy: auth.currentUser?.email ?? 'admin',
      });

      setMsg(
        type === 'immanquable'
          ? 'Vidéo publiée — section Immanquable (feed vertical).'
          : 'Vidéo publiée — section Moments Forts.'
      );
      setVideoFile(null);
      setThumbFile(null);
      setTitle('');
    } catch (err) {
      setMsg(formatFirebaseError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell">
      <Link to="/">← Dashboard</Link>
      <h1>Publier une Vidéo</h1>
      <form className="card" onSubmit={publish}>
        <label>Vidéo</label>
        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
        <label>Miniature</label>
        <input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)} />
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as VideoType)}>
          <option value="highlight">Highlight</option>
          <option value="summary">Résumé</option>
          <option value="documentary">Documentaire</option>
          <option value="goalya_tv">GOALYA TV</option>
          <option value="match_complet">Match complet</option>
          <option value="immanquable">Immanquable (feed TikTok)</option>
        </select>
        <label>Accroche Immanquable (pastille cyan)</label>
        <input
          value={ctaLabel}
          onChange={(e) => setCtaLabel(e.target.value)}
          placeholder="Ex: Le plus de buts en phase de groupes"
        />
        <label>Titre</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Match ID</label>
        <input value={matchId} onChange={(e) => setMatchId(e.target.value)} />
        <label>Chapitre</label>
        <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
          {CHAPTERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label>Épisode (ex: 6/6)</label>
        <input value={episodeNumber} onChange={(e) => setEpisodeNumber(e.target.value)} placeholder="6/6" />
        {msg ? <p className={msg.startsWith('Vidéo') ? 'ok' : 'err'}>{msg}</p> : null}
        <button type="submit" disabled={busy} style={{ marginTop: 16 }}>
          {busy ? 'Publication…' : 'Publier la Vidéo'}
        </button>
      </form>
    </div>
  );
}
