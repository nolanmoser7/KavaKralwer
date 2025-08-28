
// src/lib/kavaSearch.ts
export type Place = google.maps.places.PlaceResult;

function uniqBy<T, K>(arr: T[], key: (x: T) => K) {
  const m = new Map<K, T>();
  for (const item of arr) m.set(key(item), item);
  return Array.from(m.values());
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
      console.log(`Searching for keyword: "${keyword}", type: "${type}"`);
      svc.nearbySearch(
        { location: center, radius: radiusMeters, keyword, type },
        (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
          console.log(`Search "${keyword}" + "${type}" returned:`, status, results?.length || 0, 'results');
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
  console.log('Raw search results before filtering:', results.length);
  const unique = uniqBy(results, p => p.place_id!);
  console.log('Unique results after deduplication:', unique.length);

  // Final guard: keep obvious kava venues or lounges
  const filtered = unique.filter((p) => {
    const name = (p.name ?? "").toLowerCase();
    const types = (p.types ?? []).map((t: string) => t.toLowerCase());
    
    console.log(`Filtering "${p.name}": types=[${types.join(', ')}]`);
    
    const looksLikeVenue = types.some((t: string) => ["bar", "cafe"].includes(t));
    const hasKava = name.includes("kava");
    const hasLounge = name.includes("lounge");
    
    const passes = hasKava || (hasLounge && looksLikeVenue);
    console.log(`  -> ${passes ? 'KEEP' : 'REJECT'}: hasKava=${hasKava}, hasLounge=${hasLounge}, looksLikeVenue=${looksLikeVenue}`);
    return passes;
  });

  console.log('Final filtered results:', filtered.length);
  
  // Get detailed information for each place (phone, website, etc.)
  console.log('Fetching detailed information for places...');
  const detailedPlaces = await Promise.all(
    filtered.map(place => 
      new Promise<Place>((resolve) => {
        if (!place.place_id) {
          resolve(place);
          return;
        }
        
        svc.getDetails(
          {
            placeId: place.place_id,
            fields: [
              'place_id', 'name', 'formatted_address', 'geometry', 'types',
              'rating', 'user_ratings_total', 'price_level', 'opening_hours',
              'formatted_phone_number', 'website', 'photos'
            ]
          },
          (result, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && result) {
              console.log(`Got details for ${result.name}: phone=${!!result.formatted_phone_number}, website=${!!result.website}`);
              resolve(result);
            } else {
              console.log(`Failed to get details for ${place.name}:`, status);
              resolve(place); // Fall back to basic info
            }
          }
        );
      })
    )
  );
  
  console.log('Final results with details:', detailedPlaces.length);
  return detailedPlaces;
}
