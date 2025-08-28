import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Filter, MapPin } from "lucide-react";
import { loadGoogleMaps, createAutocomplete, panToPlace } from "@/lib/maps";
import { searchKavaPlaces } from "@/lib/kavaSearch";
import { renderPlaces, debounce } from "@/lib/markers";
import ShellRating from "@/components/shell-rating";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedBar, setSelectedBar] = useState<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);

  const { data: bars = [] } = useQuery({
    queryKey: ["/api/bars"],
    retry: false,
  });

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to San Diego
          setUserLocation({ lat: 32.7157, lng: -117.1611 });
        }
      );
    } else {
      // Default to San Diego
      setUserLocation({ lat: 32.7157, lng: -117.1611 });
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && userLocation && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [userLocation]);

  // Separate effect for updating bar markers when bars data changes
  useEffect(() => {
    if (mapInstanceRef.current && bars.length > 0) {
      updateBarMarkers();
    }
  }, [bars]);

  const initializeMap = async () => {
    if (!mapRef.current || !userLocation) return;

    try {
      await loadGoogleMaps();
      
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 10,
        styles: [
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
        ],
      });

      mapInstanceRef.current = map;

      // Initialize Places Autocomplete
      setTimeout(() => {
        if (searchInputRef.current && (window as any).google?.maps?.places) {
          try {
            const autocomplete = new (window as any).google.maps.places.Autocomplete(searchInputRef.current, {
              fields: [
                "place_id", "name", "formatted_address", "types", "geometry", 
                "rating", "user_ratings_total", "price_level", "opening_hours",
                "formatted_phone_number", "website", "photos", "address_components"
              ],
              types: ["establishment"],
            });
            
            autocomplete.bindTo("bounds", map);

            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();
              if (!place || !place.geometry) {
                console.warn("No geometry returned for place:", place);
                return;
              }

              // Optional: ignore non-kava picks
              const nm = (place.name ?? "").toLowerCase();
              const ty = (place.types ?? []).map(t => t.toLowerCase());
              const looksVenue = ty.some(t => ["bar", "cafe"].includes(t));
              if (!(nm.includes("kava") || (nm.includes("lounge") && looksVenue))) {
                // Not obviously kava; do nothing (or show a toast)
                return;
              }

              // Recommended pattern for proper zoom handling
              if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
                const once = map.addListener("idle", () => {
                  once.remove();
                  map.setZoom(19); // max zoom
                });
              } else if (place.geometry.location) {
                map.setCenter(place.geometry.location);
                map.setZoom(19);
              }

              // Optionally drop a marker for the selected place
              if (place.geometry.location) {
                new (window as any).google.maps.Marker({ 
                  map, 
                  position: place.geometry.location, 
                  title: place.name 
                });
              }

              // Set the selected place to show the card (don't update userLocation to prevent map reset)
              setSelectedPlace(place);
              setSelectedBar(null); // Clear any selected bar
              
              // Update the search input with place name
              if (searchInputRef.current) {
                searchInputRef.current.value = place.name || place.formatted_address || '';
              }
            });
            
            setAutocomplete(autocomplete);
          } catch (error) {
            console.error('Error initializing autocomplete:', error);
          }
        }
      }, 100);

      // Add user location marker
      new (window as any).google.maps.Marker({
        position: userLocation,
        map,
        title: "Your Location",
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#2B6CB0">
              <circle cx="12" cy="12" r="8" fill="#2B6CB0" stroke="#fff" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#fff"/>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(24, 24),
        },
      });

      // Initial bar markers will be added by updateBarMarkers
      updateBarMarkers();

      // Initial kava place search
      searchKavaPlaces(map, 20000, true).then(results => renderPlaces(map, results));

      // Refresh kava places when user pans/zooms, but debounce to save quota
      map.addListener("idle", debounce(() => {
        searchKavaPlaces(map, 20000, true).then(results => renderPlaces(map, results));
      }, 600));
    } catch (error) {
      console.error("Error loading Google Maps:", error);
    }
  };

  const updateBarMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Add bar markers
    (bars as any[]).forEach((bar: any) => {
      const lat = parseFloat(bar.latitude);
      const lng = parseFloat(bar.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = new (window as any).google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: bar.name,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#FF6B35">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FF6B35"/>
              <circle cx="12" cy="9" r="2" fill="#fff"/>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(32, 32),
          anchor: new (window as any).google.maps.Point(16, 32),
        },
      });

      marker.addListener("click", () => {
        setSelectedBar(bar);
      });
    });
  };

  const centerOnUser = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(14);
    }
  };

  return (
    <div className="pb-20 relative" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full bg-gradient-to-br from-ocean to-teal"
        style={{ minHeight: '400px' }}
        data-testid="map-container"
      >
        {!userLocation && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Loading Map...</p>
              <p className="text-sm opacity-75">Getting your location</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-14 left-4 right-4 z-20">
        <div className="backdrop-blur-glass rounded-2xl p-4 shadow-lg">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search places..." 
              className="w-full p-3 pl-10 rounded-xl border-0 focus:ring-2 focus:ring-coral bg-white text-gray-900"
              data-testid="input-search-area"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Current Location */}
      <div className="absolute z-20 top-1/2 transform -translate-y-1/2" style={{ right: '10px' }}>
        <Button 
          size="icon"
          onClick={centerOnUser}
          className="backdrop-blur-glass p-3 rounded-xl shadow-lg bg-white/90 hover:bg-white text-ocean border-0"
          data-testid="button-current-location"
        >
          <MapPin className="h-5 w-5" />
        </Button>
      </div>

      {/* Bar Info Card */}
      {selectedBar && (
        <Card className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 transform transition-transform duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-coral to-sunset rounded-xl flex items-center justify-center text-white text-xl font-bold">
              {selectedBar.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800" data-testid="text-selected-bar-name">
                {selectedBar.name}
              </h3>
              <ShellRating rating={parseFloat(selectedBar.averageRating)} />
              <span className="text-tropical text-sm font-medium" data-testid="text-selected-bar-status">
                {selectedBar.offersKava && selectedBar.offersKratom ? 'Kava & Kratom' : 
                 selectedBar.offersKava ? 'Kava Bar' : 'Kratom Café'}
              </span>
            </div>
            <Button 
              size="icon" 
              variant="ghost"
              className="text-coral"
              onClick={() => window.location.href = `/bar/${selectedBar.id}`}
              data-testid="button-view-bar-details"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </Card>
      )}

      {/* Place Info Card */}
      {selectedPlace && (
        <Card className="absolute bottom-6 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 transform transition-transform duration-300">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-ocean to-teal rounded-xl flex items-center justify-center text-white text-xl font-bold">
                📍
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-lg truncate" data-testid="text-selected-place-name">
                  {selectedPlace.name || 'Unknown Place'}
                </h3>
                <p className="text-gray-500 text-sm" data-testid="text-selected-place-address">
                  {selectedPlace.formatted_address}
                </p>
                <span className="text-ocean text-xs font-medium uppercase" data-testid="text-selected-place-type">
                  {selectedPlace.types ? selectedPlace.types[0].replace(/_/g, ' ') : 'Location'}
                </span>
              </div>
              <Button 
                size="icon" 
                variant="ghost"
                className="text-ocean flex-shrink-0"
                onClick={() => setSelectedPlace(null)}
                data-testid="button-close-place-card"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* Details */}
            <div className="space-y-2">
              {/* Rating */}
              {selectedPlace.rating && (
                <div className="flex items-center space-x-2">
                  <ShellRating rating={selectedPlace.rating} />
                  {selectedPlace.user_ratings_total && (
                    <span className="text-sm text-gray-500" data-testid="text-place-reviews">
                      ({selectedPlace.user_ratings_total} reviews)
                    </span>
                  )}
                </div>
              )}

              {/* Price Level */}
              {selectedPlace.price_level && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-sm font-medium text-green-600" data-testid="text-place-price">
                    {'$'.repeat(selectedPlace.price_level)}
                  </span>
                </div>
              )}

              {/* Hours */}
              {selectedPlace.opening_hours && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Hours:</span>
                  <span 
                    className={`text-sm font-medium ${
                      selectedPlace.opening_hours.open_now ? 'text-green-600' : 'text-red-600'
                    }`}
                    data-testid="text-place-hours"
                  >
                    {selectedPlace.opening_hours.open_now ? 'Open now' : 'Closed'}
                  </span>
                </div>
              )}

              {/* Contact Info */}
              <div className="flex items-center space-x-4">
                {selectedPlace.formatted_phone_number && (
                  <a 
                    href={`tel:${selectedPlace.formatted_phone_number}`}
                    className="text-sm text-ocean hover:underline"
                    data-testid="link-place-phone"
                  >
                    📞 {selectedPlace.formatted_phone_number}
                  </a>
                )}
                {selectedPlace.website && (
                  <a 
                    href={selectedPlace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ocean hover:underline"
                    data-testid="link-place-website"
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
