
// src/lib/markers.ts
import type { Place } from "./kavaSearch";

let markers: google.maps.Marker[] = [];

export function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

export function renderPlaces(
  map: google.maps.Map,
  places: Place[],
  onClick?: (p: Place) => void
) {
  clearMarkers();
  for (const p of places) {
    const pos = p.geometry?.location;
    if (!pos) continue;
    const m = new google.maps.Marker({
      position: pos,
      map,
      title: p.name,
    });
    markers.push(m);
    if (onClick) {
      m.addListener("click", () => onClick(p));
    }
  }
}

export function debounce<T extends (...a: any[]) => void>(fn: T, ms = 500): T {
  let t: number | undefined;
  return function(this: any, ...args: any[]) {
    clearTimeout(t);
    t = window.setTimeout(() => fn.apply(this, args), ms);
  } as T;
}
