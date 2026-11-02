import { Linking } from 'react-native';

export async function openExternalLink(url: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) return { ok: false, reason: 'URL non supportée' };
    await Linking.openURL(url);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'Ouverture impossible' };
  }
}

export const links = {
  tickets: () => openExternalLink('https://www.fifa.com/tickets'),
  hotels: (name: string, lat: number, lng: number) =>
    openExternalLink(
      `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(name)}&latitude=${String(lat)}&longitude=${String(lng)}`
    ),
  googleMaps: (lat: number, lng: number) => openExternalLink(`https://www.google.com/maps/dir/?api=1&destination=${String(lat)},${String(lng)}`),
  uber: (lat: number, lng: number, name: string) =>
    openExternalLink(
      `uber://?action=setPickup&dropoff[latitude]=${String(lat)}&dropoff[longitude]=${String(lng)}&dropoff[nickname]=${encodeURIComponent(name)}`
    ),
  youtube: (q: string) =>
    openExternalLink(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} FIFA World Cup 2026`)}`),
  tiktok: (q: string) => openExternalLink(`https://www.tiktok.com/search?q=${encodeURIComponent(q)}`),
  twitch: () => openExternalLink('https://www.twitch.tv/directory/game/FIFA%2023'),
  shop: () => openExternalLink('https://store.fifa.com'),
  fanZone: (city: string) =>
    openExternalLink(`https://www.google.com/maps/search/fan+zone+world+cup+${encodeURIComponent(city)}`),
  restaurants: (lat: number, lng: number) =>
    openExternalLink(`https://www.google.com/maps/search/restaurants/@${String(lat)},${String(lng)},15z`),
};
