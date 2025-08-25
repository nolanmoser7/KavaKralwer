import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BarCard from "@/components/bar-card";
import FilterChips from "@/components/filter-chips";
import { Search, Bell, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: bars = [], isLoading } = useQuery({
    queryKey: ["/api/bars"],
    retry: false,
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="pb-20 animate-pulse">
        <div className="gradient-tropical p-6 text-white">
          <div className="h-8 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded mb-4 w-32"></div>
          <div className="h-12 bg-white/20 rounded-2xl"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 bg-gray-200"></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 screen">
      {/* Header */}
      <div className="gradient-tropical p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-bold" data-testid="text-app-name">
              Kava Krawler
            </h1>
            <p className="text-white/80" data-testid="text-user-location">
              {user?.email ? `Welcome, ${user.firstName || 'Explorer'}` : 'San Diego, CA'}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              size="icon" 
              variant="ghost" 
              className="p-2 bg-white/20 rounded-full backdrop-blur-sm text-white hover:bg-white/30"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="p-2 bg-white/20 rounded-full backdrop-blur-sm text-white hover:bg-white/30"
              onClick={() => setLocation('/submit-bar')}
              data-testid="button-add-bar"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Input 
            placeholder="Search bars, cities..." 
            className="w-full p-4 pl-12 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white"
            data-testid="input-search"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-4 py-3 bg-white">
        <FilterChips />
      </div>

      {/* Quick Stats */}
      {userStats && (
        <div className="px-4 py-3 bg-gradient-to-r from-teal/10 to-tropical/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-bold text-lg text-teal" data-testid="stat-visited">
                {userStats.visitedBars}
              </div>
              <div className="text-xs text-gray-600">Visited</div>
            </div>
            <div>
              <div className="font-bold text-lg text-coral" data-testid="stat-checkins">
                {userStats.totalCheckIns}
              </div>
              <div className="text-xs text-gray-600">Check-ins</div>
            </div>
            <div>
              <div className="font-bold text-lg text-sunset" data-testid="stat-points">
                {userStats.totalPoints}
              </div>
              <div className="text-xs text-gray-600">Points</div>
            </div>
          </div>
        </div>
      )}

      {/* Featured/Nearby Bars */}
      <div className="p-4">
        <h2 className="font-display text-xl font-semibold mb-4 text-gray-800" data-testid="heading-nearby-bars">
          Nearby Kava Spots
        </h2>
        
        {bars.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🏝️</div>
            <h3 className="font-semibold mb-2">No bars found</h3>
            <p className="text-sm">Be the first to add a kava bar in your area!</p>
            <Button 
              className="mt-4 bg-coral hover:bg-coral/90"
              onClick={() => setLocation('/submit-bar')}
              data-testid="button-submit-first-bar"
            >
              Submit a Bar
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bars.map((bar: any) => (
              <BarCard key={bar.id} bar={bar} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
