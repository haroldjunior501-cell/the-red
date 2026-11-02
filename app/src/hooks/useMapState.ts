import { useMapStore } from '../store/mapStore';

/** Accès typé au store carte (Zustand) — pas de useState global pour ces données. */
export function useMapState() {
  return useMapStore();
}
