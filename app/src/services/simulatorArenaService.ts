import { fetchWithFirebaseAuth, isApiConfigured, parseApiJson } from './apiClient';

export type SimulatorRegisterResponse = {
  ok: boolean;
  teamComplete: boolean;
  reason?: string;
};

/** Inscrit le joueur au classement Simulator (équipe Fantasy cloud requise). */
export async function registerSimulatorArena(opts?: {
  displayName?: string;
  country?: string;
}): Promise<SimulatorRegisterResponse> {
  if (!isApiConfigured()) {
    return { ok: false, teamComplete: false, reason: 'api_not_configured' };
  }
  const res = await fetchWithFirebaseAuth('/simulator/register', {
    method: 'POST',
    body: JSON.stringify(opts ?? {}),
  });
  return parseApiJson<SimulatorRegisterResponse>(res);
}
