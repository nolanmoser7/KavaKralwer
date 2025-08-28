import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home, Calendar, MapPin, Users, User } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/map", icon: MapPin, label: "Map" },
    { path: "/events", icon: Calendar, label: "Events" },
    { path: "/", icon: Home, label: "Home" },
    { path: "/activity", icon: Users, label: "Social" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-bottom">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center p-2 h-auto ${
                isActive ? 'text-coral' : 'text-gray-600'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
