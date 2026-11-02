import { Link } from 'react-router-dom';

export function Dashboard() {
  return (
    <div className="shell">
      <h1>Dashboard</h1>
      <p style={{ color: '#8a96a8' }}>Publie du contenu — il apparaît en temps réel dans l&apos;app mobile.</p>
      <div className="nav">
        <Link className="btn" to="/publish-story">
          + Publier Story
        </Link>
        <Link className="btn" to="/publish-video">
          + Publier Vidéo
        </Link>
        <Link className="btn" to="/manage">
          Gérer le contenu
        </Link>
      </div>
      <div className="card">
        <h2>Collections Firestore</h2>
        <ul>
          <li>
            <strong>content_stories</strong> — bulles stories (max ~30s)
          </li>
          <li>
            <strong>content_videos</strong> — Moments Forts (cinéma) · Immanquable (feed vertical)
          </li>
        </ul>
      </div>
    </div>
  );
}
