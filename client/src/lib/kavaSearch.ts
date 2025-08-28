
// src/lib/kavaSearch.ts
export type Place = google.maps.places.PlaceResult;

function uniqBy<T, K>(arr: T[], key: (x: T) => K) {
  const m = new Map<K, T>();
  for (const item of arr) m.set(key(item), item);
  return [...m.values()];
}

export async function searchKavaPlaces(
  map: google.maps.Map,
  radiusMeters = 20000,                // ~12.4 miles; tune as needed
  includeKratom = true                 // toggle kratom
): Promise<Place[]> {
  const center = map.getCenter();
  if (!center) return [];

  const svc = new google.maps.places.PlacesService(map);

  const run = (keyword: string, type: "bar" | "cafe") =>
    new Promise<Place[]>((resolve) => {
      svc.nearbySearch(
        { location: center, radius: radiusMeters, keyword, type },
        (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
            resolve([]);
          } else {
            resolve(results);
          }
        }
      );
    });

  const calls: Promise<Place[]>[] = [
    run("kava", "bar"),
    run("kava bar", "bar"),
    run("kava", "cafe"),
    run("lounge", "cafe"),
  ];

  if (includeKratom) calls.push(run("kratom", "bar"));

  const results = (await Promise.all(calls)).flat();
  const unique = uniqBy(results, p => p.place_id!);

  // Final guard: keep obvious kava venues or lounges (exclude night_club)
  const filtered = unique.filter((p) => {
    const name = (p.name ?? "").toLowerCase();
    const types = (p.types ?? []).map(t => t.toLowerCase());
    
    // Exclude night clubs explicitly
    if (types.includes("night_club")) return false;
    
    const looksLikeVenue = types.some(t => ["bar", "cafe"].includes(t));
    return name.includes("kava") || (name.includes("lounge") && looksLikeVenue);
  });

  return filtered;
}
