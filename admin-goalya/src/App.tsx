import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from './config/firebase';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PublishStory } from './pages/PublishStory';
import { PublishVideo } from './pages/PublishVideo';
import { ManageContent } from './pages/ManageContent';

function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <>
      <div className="shell" style={{ paddingBottom: 0 }}>
        <button type="button" className="btn-danger" onClick={() => void signOut(auth)} style={{ float: 'right' }}>
          Déconnexion ({user.email})
        </button>
      </div>
      {children}
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setReady(true);
        return;
      }
      const token = await u.getIdTokenResult();
      if (!token.claims.admin) {
        await signOut(auth);
        setUser(null);
      } else {
        setUser(u);
      }
      setReady(true);
    });
  }, []);

  if (!ready) return <p className="shell">Chargement…</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login onSuccess={() => undefined} />}
        />
        <Route path="/" element={user ? <Shell user={user}><Dashboard /></Shell> : <Navigate to="/login" replace />} />
        <Route
          path="/publish-story"
          element={user ? <Shell user={user}><PublishStory /></Shell> : <Navigate to="/login" replace />}
        />
        <Route
          path="/publish-video"
          element={user ? <Shell user={user}><PublishVideo /></Shell> : <Navigate to="/login" replace />}
        />
        <Route
          path="/manage"
          element={user ? <Shell user={user}><ManageContent /></Shell> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
