import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Star } from "lucide-react";
import { useLocation } from "wouter";

export default function Events() {
  const [, setLocation] = useLocation();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="pb-20 animate-pulse">
        <div className="p-4">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 bg-gray-200 mb-4"></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 screen">
      <div className="p-4">
        <h1 className="font-display text-2xl font-bold text-gray-800 mb-6" data-testid="heading-events">
          Kava Events
        </h1>
        
        {/* Event Categories */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <Button variant="default" size="sm" className="bg-coral hover:bg-coral/90 text-white" data-testid="filter-all-events">
            All Events
          </Button>
          <Button variant="outline" size="sm" data-testid="filter-happy-hour">
            Happy Hour
          </Button>
          <Button variant="outline" size="sm" data-testid="filter-live-music">
            Live Music
          </Button>
          <Button variant="outline" size="sm" data-testid="filter-trivia">
            Trivia Night
          </Button>
        </div>

        {/* Featured Event */}
        <Card className="bg-gradient-to-r from-teal to-tropical text-white p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 mr-2 fill-current" />
                <span className="text-sm font-medium">FEATURED EVENT</span>
              </div>
              <h2 className="font-display text-xl font-bold mb-2" data-testid="text-featured-event-title">
                Kava & Live Music Night
              </h2>
              <p className="text-white/90 mb-3" data-testid="text-featured-event-description">
                Join us for an evening of authentic kava and live acoustic performances
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Tonight, 7 PM</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>Island Kava Bar</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-gray-800" data-testid="heading-upcoming-events">
            Upcoming Events
          </h2>
          
          {events.length === 0 ? (
            <>
              {/* Mock Events for Demo */}
              <Card className="p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex space-x-4">
                  <div className="bg-coral/10 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-coral" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1" data-testid="text-event-title-1">
                      Happy Hour Special
                    </h3>
                    <p className="text-sm text-gray-600 mb-2" data-testid="text-event-description-1">
                      50% off all kava shells from 5-7 PM
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Tomorrow, 5:00 PM</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>Pacific Kava Lounge</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>12 attending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex space-x-4">
                  <div className="bg-teal/10 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-teal" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1" data-testid="text-event-title-2">
                      Kava Trivia Night
                    </h3>
                    <p className="text-sm text-gray-600 mb-2" data-testid="text-event-description-2">
                      Test your knowledge while enjoying traditional kava
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Friday, 8:00 PM</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>Roots Kava Bar</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>8 attending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex space-x-4">
                  <div className="bg-sunset/10 p-3 rounded-lg">
                    <Star className="w-6 h-6 text-sunset" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1" data-testid="text-event-title-3">
                      Kava Culture Workshop
                    </h3>
                    <p className="text-sm text-gray-600 mb-2" data-testid="text-event-description-3">
                      Learn about the traditions and preparation of kava
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Saturday, 2:00 PM</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>Tropical Vibes Kava</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>15 attending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="space-y-4">
              {events.map((event: any) => (
                <Card key={event.id} className="p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex space-x-4">
                    <div className="bg-coral/10 p-3 rounded-lg">
                      <Calendar className="w-6 h-6 text-coral" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2" data-testid={`text-event-description-${event.id}`}>
                        {event.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          <span>{event.attendees || 0} attending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Create Event Button */}
        <div className="mt-8 text-center">
          <Button 
            className="bg-gradient-to-r from-coral to-sunset hover:from-coral/90 hover:to-sunset/90 text-white px-8"
            data-testid="button-create-event"
          >
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
}