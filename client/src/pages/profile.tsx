import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { 
  MapPin, 
  Star, 
  Trophy, 
  Plus, 
  Settings, 
  ChevronRight 
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    retry: false,
  });

  const handleSignOut = async () => {
    try {
      // Clear all cached data
      queryClient.clear();
      // Redirect to logout endpoint, which will redirect to landing page
      window.location.href = "/api/logout";
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback - force redirect to home which will show landing page
      setLocation("/");
    }
  };

  return (
    <div className="pb-20 screen">
      {/* Profile Header */}
      <div className="gradient-tropical p-6 text-white mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
                data-testid="img-user-avatar"
              />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-user-initials">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold" data-testid="text-user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || 'Kava Explorer'
              }
            </h1>
            <p className="text-white/80" data-testid="text-user-title">
              Kava Explorer
            </p>
            <div className="flex items-center mt-1">
              <span className="text-sm" data-testid="text-user-points">
                {userStats?.totalPoints || 0} points
              </span>
              <span className="ml-2 text-xs px-2 py-1 bg-white/20 rounded-full" data-testid="text-user-level">
                Level {Math.floor((userStats?.totalPoints || 0) / 100) + 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center p-4 shadow-sm">
            <div className="text-2xl font-bold text-coral" data-testid="stat-bars-visited">
              {userStats?.visitedBars || 0}
            </div>
            <div className="text-sm text-gray-600">Bars Visited</div>
          </Card>
          <Card className="text-center p-4 shadow-sm">
            <div className="text-2xl font-bold text-teal" data-testid="stat-reviews-written">
              {userStats?.totalReviews || 0}
            </div>
            <div className="text-sm text-gray-600">Reviews</div>
          </Card>
          <Card className="text-center p-4 shadow-sm">
            <div className="text-2xl font-bold text-tropical" data-testid="stat-total-checkins">
              {userStats?.totalCheckIns || 0}
            </div>
            <div className="text-sm text-gray-600">Check-ins</div>
          </Card>
        </div>

        {/* Menu Options */}
        <div className="space-y-3">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 h-auto"
            onClick={() => setLocation('/activity')}
            data-testid="button-my-krawls"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-coral/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-coral" />
              </div>
              <span className="font-medium text-gray-800">My Krawls</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 h-auto"
            onClick={() => setLocation('/activity')}
            data-testid="button-my-reviews"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal/10 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-teal" />
              </div>
              <span className="font-medium text-gray-800">My Reviews</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 h-auto"
            onClick={() => setLocation('/activity')}
            data-testid="button-achievements"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-tropical/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-tropical" />
              </div>
              <span className="font-medium text-gray-800">Achievements</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 h-auto"
            onClick={() => setLocation('/submit-bar')}
            data-testid="button-submit-new-bar"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sunset/10 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-sunset" />
              </div>
              <span className="font-medium text-gray-800">Submit New Bar</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 h-auto"
            data-testid="button-settings"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-gray-500" />
              </div>
              <span className="font-medium text-gray-800">Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>
        </div>

        {/* Sign Out */}
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="w-full mt-6 p-4 text-coral font-medium hover:bg-coral/10"
          data-testid="button-sign-out"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
