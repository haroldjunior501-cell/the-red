export interface Avatar {
  skin: string;
  face: string;
  hair: string;
  body: string;
  beard?: string;
  accessory?: string;
  celebration: string;
  country: string;
  /**
   * `placeholder` : parcours sans SDK (en attendant l’abonnement) — pas de GLB, l’UI utilise la silhouette / couleurs.
   * `metaperson` : GLB MetaPerson enregistré dans `metaPersonModelUrl`.
   */
  representation?: 'placeholder' | 'metaperson';
  /** URL du modèle GLB après export MetaPerson (`model_exported`). */
  metaPersonModelUrl?: string;
}
