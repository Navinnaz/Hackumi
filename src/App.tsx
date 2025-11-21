import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import HackathonsList from "./pages/HackathonsList";
import CreateHackathon from "./pages/CreateHackathon";
import EditHackathon from "./pages/EditHackathon";  
import ManageTeams from "./pages/ManageTeams";
import HackathonInsights from "./pages/HackathonInsights";

import { AuthProvider } from "./contexts/authContext";
import ProfilePage from "./pages/ProfilePage";

import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ Import this

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Auth provider wraps everything */}
      <AuthProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* ✅ Protected Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route path="/hackathons" element={<HackathonsList />} />
            <Route path="/hackathons/create" element={<CreateHackathon />} />
            <Route path="/hackathons/:id/edit" element={<EditHackathon />} />
            <Route path="/hackathons/:id/insights" element={<HackathonInsights />} />
            <Route path="/teams" element={<ManageTeams />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
