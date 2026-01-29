export function buildGoogleMapsSearchUrl(query: string) {
  const q = query.trim();
  if (!q) return "https://www.google.com/maps";
  const params = new URLSearchParams({ api: "1", query: q });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
