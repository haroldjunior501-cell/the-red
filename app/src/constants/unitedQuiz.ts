export type UnitedQuizKind = 'quiz' | 'poll';

export type UnitedQuizOption = {
  id: string;
  label: string;
  /** Pour les quiz : bonne réponse. */
  correct?: boolean;
};

export type UnitedQuizItem = {
  id: string;
  kind: UnitedQuizKind;
  title: string;
  subtitle?: string;
  points: number;
  options: UnitedQuizOption[];
};

/** Contenu seed — quiz / sondages hors jours de match. */
export const UNITED_QUIZ_BANK: readonly UnitedQuizItem[] = [
  {
    id: 'quiz_ot_titles',
    kind: 'quiz',
    title: 'Combien de titres de Premier League Manchester United a-t-il remportés ?',
    subtitle: 'Histoire du club',
    points: 10,
    options: [
      { id: 'a', label: '13', correct: true },
      { id: 'b', label: '11' },
      { id: 'c', label: '15' },
      { id: 'd', label: '20' },
    ],
  },
  {
    id: 'quiz_theatre',
    kind: 'quiz',
    title: 'Quel est le surnom d’Old Trafford ?',
    subtitle: 'Histoire du club',
    points: 10,
    options: [
      { id: 'a', label: 'The Theatre of Dreams', correct: true },
      { id: 'b', label: 'The Red Fortress' },
      { id: 'c', label: 'The Cathedral' },
      { id: 'd', label: 'Stretford End Arena' },
    ],
  },
  {
    id: 'quiz_busby',
    kind: 'quiz',
    title: 'En quelle année Sir Matt Busby a-t-il remporté la Coupe d’Europe avec United ?',
    points: 10,
    options: [
      { id: 'a', label: '1968', correct: true },
      { id: 'b', label: '1958' },
      { id: 'c', label: '1974' },
      { id: 'd', label: '1982' },
    ],
  },
  {
    id: 'poll_starter_weekend',
    kind: 'poll',
    title: 'Qui doit être titulaire ce week-end ?',
    subtitle: 'Sondage fans',
    points: 5,
    options: [
      { id: 'mainoo', label: 'Kobbie Mainoo' },
      { id: 'ugarte', label: 'Manuel Ugarte' },
      { id: 'casemiro', label: 'Casemiro' },
      { id: 'mount', label: 'Mason Mount' },
    ],
  },
  {
    id: 'poll_potm_season',
    kind: 'poll',
    title: 'Meilleur joueur de la saison jusqu’ici ?',
    subtitle: 'Sondage fans',
    points: 5,
    options: [
      { id: 'bruno', label: 'Bruno Fernandes' },
      { id: 'mbeumo', label: 'Bryan Mbeumo' },
      { id: 'cunha', label: 'Matheus Cunha' },
      { id: 'amass', label: 'Autre' },
    ],
  },
] as const;
