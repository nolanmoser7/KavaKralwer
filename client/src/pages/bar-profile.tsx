import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ShellRating from "@/components/shell-rating";
import CheckInModal from "@/components/check-in-modal";
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Phone, 
  Navigation, 
  Clock,
  Camera
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function BarProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: bar, isLoading } = useQuery({
    queryKey: ["/api/bars", id],
    retry: false,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/bars", id, "reviews"],
    retry: false,
    enabled: !!id,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["/api/bars", id, "photos"],
    retry: false,
    enabled: !!id,
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/bars/${id}/favorite`);
    },
    onSuccess: (response: any) => {
      const data = response.json();
      setIsFavorited(data.favorited);
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

  useEffect(() => {
    // Check if bar is favorited (you would normally get this from the API)
    // For now, we'll set it to false initially
    setIsFavorited(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="screen animate-pulse">
        <div className="h-64 bg-gray-200"></div>
        <div className="p-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!bar) {
    return (
      <div className="screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Bar not found</h2>
          <p className="text-gray-600 mb-4">The bar you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const handleFavorite = () => {
    favoriteMutation.mutate();
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
  if (bar.amenities) tags.push(...bar.amenities);

  return (
    <div className="screen pb-20">
      {/* Header Image */}
      <div className="relative h-64 bg-gradient-to-br from-coral to-sunset">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Back Button */}
        <Button 
          size="icon"
          variant="ghost"
          className="absolute top-6 left-4 backdrop-blur-glass bg-white/20 hover:bg-white/30 text-white border-0"
          onClick={() => setLocation('/')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Heart Button */}
        <Button 
          size="icon"
          variant="ghost"
          className={`absolute top-6 right-4 backdrop-blur-glass border-0 ${
            isFavorited 
              ? 'bg-coral/20 hover:bg-coral/30 text-coral' 
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
          onClick={handleFavorite}
          disabled={favoriteMutation.isPending}
          data-testid="button-favorite"
        >
          <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>

        {/* Check-in Button */}
        <Button 
          className="absolute bottom-4 right-4 bg-coral hover:bg-coral/90 text-white px-6 py-3 rounded-full shadow-lg font-medium"
          onClick={() => setShowCheckIn(true)}
          data-testid="button-check-in"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Check In
        </Button>
      </div>

      <div className="p-4">
        {/* Bar Info */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-2" data-testid="text-bar-name">
            {bar.name}
          </h1>
          <div className="flex items-center mb-3">
            <ShellRating rating={parseFloat(bar.averageRating)} />
            <span className="ml-2 text-gray-600" data-testid="text-bar-rating">
              {bar.averageRating} ({bar.reviewCount} reviews)
            </span>
          </div>
          <p className="text-gray-600 mb-2" data-testid="text-bar-address">
            {bar.address}, {bar.city}, {bar.state} {bar.zipCode}
          </p>
          <div className="flex items-center text-tropical font-medium">
            <Clock className="w-4 h-4 mr-2" />
            <span data-testid="text-bar-hours">
              Open Now • Closes 11:00 PM
            </span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                className={`tag ${getTagColor(tag)}`}
                data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        {bar.description && (
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed" data-testid="text-bar-description">
              {bar.description}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {bar.phone && (
            <Button 
              variant="outline" 
              className="flex items-center justify-center p-4 rounded-xl"
              onClick={() => window.open(`tel:${bar.phone}`)}
              data-testid="button-call-now"
            >
              <Phone className="w-4 h-4 mr-3" />
              <span>Call Now</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            className="flex items-center justify-center p-4 rounded-xl"
            onClick={() => window.open(`https://maps.google.com/?q=${bar.latitude},${bar.longitude}`)}
            data-testid="button-directions"
          >
            <Navigation className="w-4 h-4 mr-3" />
            <span>Directions</span>
          </Button>
        </div>

        {/* Hours */}
        {bar.hours && (
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold mb-3">Hours</h2>
            <Card className="p-4">
              {Object.entries(bar.hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between py-1">
                  <span className="font-medium text-gray-700 capitalize">{day}</span>
                  <span className="text-gray-600">
                    {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold mb-3">Photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 6).map((photo: any) => (
                <div 
                  key={photo.id} 
                  className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
                >
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.caption || 'Bar photo'} 
                    className="w-full h-full object-cover"
                    data-testid={`img-bar-photo-${photo.id}`}
                  />
                </div>
              ))}
            </div>
            {photos.length > 6 && (
              <Button variant="ghost" className="mt-3 text-coral font-medium">
                View All Photos
              </Button>
            )}
          </div>
        )}

        {/* Recent Reviews */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold mb-3">Recent Reviews</h2>
          
          {reviews.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm text-gray-400">Be the first to review this bar!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review: any) => (
                <Card key={review.id} className="p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-sunset flex items-center justify-center text-white font-bold">
                      U
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">Anonymous User</span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <ShellRating rating={review.rating} size="sm" />
                      {review.comment && (
                        <p className="text-gray-600 text-sm leading-relaxed mt-2">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {reviews.length > 3 && (
                <Button variant="ghost" className="w-full text-coral font-medium py-2">
                  View All Reviews
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      <CheckInModal 
        isOpen={showCheckIn} 
        onClose={() => setShowCheckIn(false)} 
        barId={id!}
        barName={bar.name}
      />
    </div>
  );
}
