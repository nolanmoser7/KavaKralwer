import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Home from "@/pages/home";
import Map from "@/pages/map";
import Activity from "@/pages/activity";
import Profile from "@/pages/profile";
import BarProfile from "@/pages/bar-profile";
import SubmitBar from "@/pages/submit-bar";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-sunset">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="font-display text-4xl font-bold mb-2">Kava Krawler</h1>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/map" component={Map} />
            <Route path="/activity" component={Activity} />
            <Route path="/profile" component={Profile} />
            <Route path="/bar/:id" component={BarProfile} />
            <Route path="/submit-bar" component={SubmitBar} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      
      {isAuthenticated && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
