/**
 * Effectif club FotMob — porté depuis FootballIntelligence `lib/fotmob/squad.ts`.
 */
import { fotmobGet, num, playerPhoto, rec, str } from './fotmobHttp';

export type SquadMember = {
  id: number;
  name: string;
  shirtNumber: number | null;
  roleKey: string;
  rating: number | null;
  goals: number | null;
  photo?: string;
  injury?: { expectedReturn?: string } | null;
};

function mapRole(title: string, roleKey: string): string {
  const t = `${title} ${roleKey}`.toLowerCase();
  if (t.includes('keeper')) return 'keeper';
  if (t.includes('defender')) return 'defender';
  if (t.includes('midfield')) return 'midfielder';
  if (t.includes('attack') || t.includes('forward')) return 'attacker';
  return roleKey || title;
}

export async function fetchFotmobSquad(teamId: number): Promise<SquadMember[]> {
  const payload = await fotmobGet(`/teams?id=${teamId}&tab=squad`, { ttlMs: 1000 * 60 * 15 });
  const cats = rec(rec(payload)?.squad)?.squad;
  const out: SquadMember[] = [];
  if (!Array.isArray(cats)) return out;
  for (const cat of cats) {
    const c = rec(cat);
    if (!c || str(c.title) === 'coach') continue;
    const title = str(c.title);
    for (const m of Array.isArray(c.members) ? c.members : []) {
      const o = rec(m);
      if (!o) continue;
      const id = num(o.id);
      const name = str(o.name);
      if (!id || !name) continue;
      const inj = rec(o.injury);
      out.push({
        id,
        name,
        shirtNumber: num(o.shirtNumber),
        roleKey: mapRole(title, str(rec(o.role)?.key)),
        rating: num(o.rating),
        goals: num(o.goals),
        photo: playerPhoto(id),
        injury: inj
          ? { expectedReturn: str(inj.expectedReturn) || undefined }
          : null,
      });
    }
  }
  return out;
}
