import { Button } from "@/components/ui/button";
import tropicalBg from "@assets/App homescreem_1756142355434.png";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundImage: `url(${tropicalBg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'hsl(180, 48%, 32%)'
      }}
    >
      <div className="text-center text-white">
        <div className="mb-6">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-2 drop-shadow-lg" data-testid="title-kava-krawler">
            Kava Krawler
          </h1>
          <div className="flex justify-center mb-4">
            <span className="text-4xl mx-2">🌱</span>
            <span className="text-4xl mx-2">🥥</span>
            <span className="text-4xl mx-2">🌊</span>
          </div>
          <p className="text-lg sm:text-xl font-medium opacity-90" data-testid="text-subtitle">
            Discover Tropical Vibes
          </p>
        </div>
        <div className="space-y-4">
          <Button
            onClick={handleGetStarted}
            className="w-56 sm:w-64 bg-coral hover:bg-coral/90 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
            data-testid="button-get-started"
          >
            GET STARTED
          </Button>
          <button
            onClick={handleLogin}
            className="block w-56 sm:w-64 mx-auto text-white/80 hover:text-white font-medium underline"
            data-testid="button-log-in"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
