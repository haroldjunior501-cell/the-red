import { FormEvent, useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

type LoginProps = {
  onSuccess: () => void;
};

export function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await user.getIdTokenResult();
      if (!token.claims.admin) {
        await signOut(auth);
        throw new Error('Accès refusé — compte non admin');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell">
      <div className="card" style={{ maxWidth: 420, margin: '80px auto' }}>
        <h1>GOALYA Admin</h1>
        <p style={{ color: '#8a96a8', marginTop: 0 }}>Stories & vidéos · Coupe du Monde 2026</p>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error ? <p className="err">{error}</p> : null}
          <button type="submit" disabled={loading} style={{ marginTop: 16, width: '100%' }}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
