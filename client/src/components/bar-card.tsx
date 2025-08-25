import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ShellRating from "./shell-rating";
import CheckInModal from "./check-in-modal";
import { Heart, MapPin } from "lucide-react";
import { useLocation } from "wouter";

interface BarCardProps {
  bar: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    averageRating: string;
    reviewCount: number;
    offersKava: boolean;
    offersKratom: boolean;
    amenities?: string[];
    vibe?: string;
  };
}

export default function BarCard({ bar }: BarCardProps) {
  const [, setLocation] = useLocation();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/bars/${bar.id}/favorite`);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setIsFavorited(data.favorited);
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      toast({
        title: data.favorited ? "Added to favorites" : "Removed from favorites",
        description: data.favorited ? "You can find this bar in your activity tab" : "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    favoriteMutation.mutate();
  };

  const handleCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCheckIn(true);
  };

  const handleCardClick = () => {
    setLocation(`/bar/${bar.id}`);
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'kava': return 'bg-teal/10 text-teal';
      case 'kratom': return 'bg-tropical/10 text-tropical';
      case 'live music': return 'bg-sunset/10 text-sunset';
      case 'outdoor seating': return 'bg-bamboo/10 text-wood';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const tags = [];
  if (bar.offersKava) tags.push('Kava');
  if (bar.offersKratom) tags.push('Kratom');
  if (bar.amenities) tags.push(...bar.amenities.slice(0, 2)); // Show max 2 amenities
  if (bar.vibe && tags.length < 3) tags.push(bar.vibe);

  return (
    <>
      <Card 
        className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
        onClick={handleCardClick}
        data-testid={`card-bar-${bar.id}`}
      >
        {/* Mock image - in real app this would come from bar photos */}
        <div className="w-full h-48 bg-gradient-to-br from-coral to-sunset flex items-center justify-center">
          <div className="text-white text-6xl font-bold opacity-20">
            {bar.name.charAt(0)}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-800" data-testid="text-bar-name">
                {bar.name}
              </h3>
              <p className="text-gray-600 text-sm" data-testid="text-bar-address">
                {bar.address}, {bar.city}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className={`p-2 transition-colors ${
                isFavorited 
                  ? 'text-coral hover:text-coral/80' 
                  : 'text-gray-400 hover:text-coral'
              }`}
              onClick={handleFavorite}
              disabled={favoriteMutation.isPending}
              data-testid="button-favorite"
            >
              <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center">
              <ShellRating rating={parseFloat(bar.averageRating)} />
              <span className="ml-2 text-sm text-gray-600" data-testid="text-bar-rating">
                {bar.averageRating} ({bar.reviewCount})
              </span>
            </div>
            <span className="text-tropical text-sm font-medium" data-testid="text-bar-status">
              Open Now
            </span>
          </div>
          
          {tags.length > 0 && (
            <div className="flex space-x-2 mb-3 overflow-x-auto">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  className={`tag ${getTagColor(tag)} whitespace-nowrap`}
                  data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500" data-testid="text-bar-distance">
              0.5 mi away
            </span>
            <Button 
              size="sm"
              className="bg-coral hover:bg-coral/90 text-white rounded-full"
              onClick={handleCheckIn}
              data-testid="button-check-in"
            >
              <MapPin className="w-3 h-3 mr-1" />
              Check In
            </Button>
          </div>
        </div>
      </Card>

      <CheckInModal 
        isOpen={showCheckIn} 
        onClose={() => setShowCheckIn(false)} 
        barId={bar.id}
        barName={bar.name}
      />
    </>
  );
}
