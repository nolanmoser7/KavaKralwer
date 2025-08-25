import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import ShellRating from "@/components/shell-rating";
import { Calendar, MapPin, Heart } from "lucide-react";
import { useLocation } from "wouter";

export default function Activity() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    retry: false,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["/api/user/checkins"],
    retry: false,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/user/favorites"],
    retry: false,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/user/achievements"],
    retry: false,
  });

  return (
    <div className="pb-20 screen">
      <div className="p-4">
        <h1 className="font-display text-2xl font-bold text-gray-800 mb-6" data-testid="heading-your-activity">
          Your Activity
        </h1>
        
        {/* Activity Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-coral to-sunset p-4 text-white">
            <div className="text-2xl font-bold" data-testid="stat-total-checkins">
              {userStats?.totalCheckIns || 0}
            </div>
            <div className="text-white/80">Check-ins</div>
            <div className="text-xs text-white/60 mt-1">This month</div>
          </Card>
          <Card className="bg-gradient-to-br from-teal to-tropical p-4 text-white">
            <div className="text-2xl font-bold" data-testid="stat-total-favorites">
              {favorites.length}
            </div>
            <div className="text-white/80">Favorites</div>
            <div className="text-xs text-white/60 mt-1">All time</div>
          </Card>
        </div>

        {/* Recent Check-ins */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold mb-3" data-testid="heading-recent-checkins">
            Recent Check-ins
          </h2>
          
          {checkIns.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No check-ins yet</p>
              <p className="text-sm text-gray-400">Start exploring kava bars to earn points!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {checkIns.slice(0, 5).map((checkIn: any) => (
                <Card key={checkIn.id} className="flex items-center space-x-3 p-4 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-coral to-sunset rounded-lg flex items-center justify-center text-white font-bold">
                    🏝️
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800" data-testid={`text-checkin-bar-${checkIn.id}`}>
                      {checkIn.barName || 'Bar Name'}
                    </h3>
                    {checkIn.note && (
                      <p className="text-gray-600 text-sm" data-testid={`text-checkin-note-${checkIn.id}`}>
                        "{checkIn.note}"
                      </p>
                    )}
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span data-testid={`text-checkin-date-${checkIn.id}`}>
                        {new Date(checkIn.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-coral">
                    <MapPin className="w-5 h-5" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Bars */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold mb-3" data-testid="heading-your-favorites">
            Your Favorites
          </h2>
          
          {favorites.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <Heart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No favorites yet</p>
              <p className="text-sm text-gray-400">Heart bars you love to save them here!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {favorites.slice(0, 5).map((favorite: any) => (
                <Card 
                  key={favorite.id} 
                  className="flex items-center space-x-3 p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => setLocation(`/bar/${favorite.barId}`)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-teal to-tropical rounded-lg flex items-center justify-center text-white font-bold">
                    🌴
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800" data-testid={`text-favorite-bar-${favorite.id}`}>
                      {favorite.barName || 'Favorite Bar'}
                    </h3>
                    <ShellRating rating={4.5} size="sm" />
                    <span className="text-xs text-gray-500" data-testid={`text-favorite-distance-${favorite.id}`}>
                      Distance info
                    </span>
                  </div>
                  <div className="text-coral">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Badges/Achievements */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold mb-3" data-testid="heading-achievements">
            Achievements
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center p-3 bg-gradient-to-b from-sunset to-coral text-white">
              <div className="text-2xl mb-1">🏝️</div>
              <div className="text-xs font-medium">Island Explorer</div>
            </Card>
            <Card className="text-center p-3 bg-gradient-to-b from-teal to-tropical text-white">
              <div className="text-2xl mb-1">🐚</div>
              <div className="text-xs font-medium">Shell Collector</div>
            </Card>
            <Card className="text-center p-3 bg-gray-100 text-gray-400">
              <div className="text-2xl mb-1">🌴</div>
              <div className="text-xs">Coming Soon</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
