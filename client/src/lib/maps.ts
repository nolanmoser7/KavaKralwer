declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

let isLoading = false;
let isLoaded = false;

export function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded && window.google?.maps) {
      resolve();
      return;
    }

    // If currently loading, wait for it to finish
    if (isLoading) {
      const checkLoaded = () => {
        if (isLoaded && window.google?.maps) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    isLoading = true;

    // Get API key from environment
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      reject(new Error('Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY environment variable.'));
      return;
    }

    // Create callback function
    const callbackName = 'initGoogleMaps_' + Date.now();
    window[callbackName as keyof Window] = () => {
      isLoaded = true;
      isLoading = false;
      delete window[callbackName as keyof Window];
      resolve();
    };

    // Create and append script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
}

export interface MarkerOptions {
  position: google.maps.LatLngLiteral;
  map: google.maps.Map;
  title?: string;
  icon?: google.maps.Icon | google.maps.Symbol | string;
  onClick?: () => void;
}

export function createMarker(options: MarkerOptions): google.maps.Marker {
  const marker = new google.maps.Marker({
    position: options.position,
    map: options.map,
    title: options.title,
    icon: options.icon,
  });

  if (options.onClick) {
    marker.addListener('click', options.onClick);
  }

  return marker;
}

export function createKavaBarMarker(options: Omit<MarkerOptions, 'icon'>): google.maps.Marker {
  const icon = {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#FF6B35">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FF6B35"/>
        <circle cx="12" cy="9" r="2" fill="#fff"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 32),
  };

  return createMarker({
    ...options,
    icon,
  });
}

export function createUserLocationMarker(options: Omit<MarkerOptions, 'icon' | 'title'>): google.maps.Marker {
  const icon = {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#2B6CB0">
        <circle cx="12" cy="12" r="8" fill="#2B6CB0" stroke="#fff" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="#fff"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(24, 24),
    anchor: new google.maps.Point(12, 12),
  };

  return createMarker({
    ...options,
    title: "Your Location",
    icon,
  });
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

export const defaultMapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#2C7A7B" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#FFF8DC" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#D4A574" }],
  },
];
