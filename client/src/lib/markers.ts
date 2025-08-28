
// src/lib/markers.ts
import type { Place } from "./kavaSearch";

let kavaMarkers: google.maps.Marker[] = [];
let barMarkers: google.maps.Marker[] = [];

export function clearKavaMarkers() {
  kavaMarkers.forEach(m => m.setMap(null));
  kavaMarkers = [];
}

export function clearBarMarkers() {
  barMarkers.forEach(m => m.setMap(null));
  barMarkers = [];
}

export function clearAllMarkers() {
  clearKavaMarkers();
  clearBarMarkers();
}

export function renderPlaces(
  map: google.maps.Map,
  places: Place[],
  onClick?: (p: Place) => void
) {
  console.log('renderPlaces called with', places.length, 'places');
  clearKavaMarkers();
  for (const p of places) {
    const pos = p.geometry?.location;
    if (!pos) {
      console.log('Skipping place without geometry:', p.name);
      continue;
    }
    console.log('Creating marker for:', p.name, pos);
    const m = new google.maps.Marker({
      position: pos,
      map,
      title: p.name,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#10B981">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10B981"/>
            <circle cx="12" cy="9" r="2" fill="#fff"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(28, 28),
        anchor: new google.maps.Point(14, 28),
      },
    });
    kavaMarkers.push(m);
    if (onClick) {
      m.addListener("click", () => onClick(p));
    }
  }
  console.log('Total kava markers created:', kavaMarkers.length);
}

export function renderBars(
  map: google.maps.Map,
  bars: any[],
  onClick?: (bar: any) => void
) {
  clearBarMarkers();
  bars.forEach((bar: any) => {
    const lat = parseFloat(bar.latitude);
    const lng = parseFloat(bar.longitude);
    
    if (isNaN(lat) || isNaN(lng)) return;

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: bar.name,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#FF6B35">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FF6B35"/>
            <circle cx="12" cy="9" r="2" fill="#fff"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32),
      },
    });

    barMarkers.push(marker);
    if (onClick) {
      marker.addListener("click", () => onClick(bar));
    }
  });
}

export function debounce<T extends (...a: any[]) => void>(fn: T, ms = 500): T {
  let t: number | undefined;
  return function(this: any, ...args: any[]) {
    clearTimeout(t);
    t = window.setTimeout(() => fn.apply(this, args), ms);
  } as T;
}
