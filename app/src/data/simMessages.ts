export type SimMessagePool = {
  country: string;
  texts: string[];
};

export const SIM_MESSAGES_POOL: SimMessagePool[] = [
  { country: 'FRA', texts: ['ALLEZ LA FRANCE 🔥', 'ON Y CROOOIT 💙', 'INCROYABLE!!', 'QUE MATCH 😭', 'MBAPPÉ EST UN MONSTRE 🐐', 'GOALYA EST INCROYABLE 🌍'] },
  { country: 'BRA', texts: ['VAMOS BRASIL 💚', 'É NOSSO 🇧🇷', 'VAMO VAMO!!', 'QUE GOLAZO 😱', 'BRASIL CAMPEÃO 🏆'] },
  { country: 'ARG', texts: ['VAMOS ARGENTINA 🙌', 'QUE PARTIDO!!', 'EL MEJOR 🐐', 'DALE DALE 🔥'] },
  { country: 'JPN', texts: ['Amazing!! 🔥', 'Unbelievable match!', 'JAPAN IS WATCHING 👀', 'Best WC game 😭'] },
  { country: 'ALL', texts: ['GOALYA 🌍🔥', 'THIS IS INSANE 💀', 'BEST APP EVER ⚽', '500K PEOPLE HERE 🤯'] },
];

export function getSimMessage(country: string): string {
  const pool =
    SIM_MESSAGES_POOL.find((entry) => entry.country === country.toUpperCase()) ??
    SIM_MESSAGES_POOL.find((entry) => entry.country === 'ALL');
  const texts = pool?.texts ?? ['GOALYA 🌍'];
  return texts[Math.floor(Math.random() * texts.length)];
}
