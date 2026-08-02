import { BottomNav, type TabKey } from "@/components/BottomNav";
import { SosButton } from "@/components/SosButton";
import { Spinner } from "@/components/ui";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AuthScreen } from "@/screens/AuthScreen";
import { CompanionScreen } from "@/screens/CompanionScreen";
import { FoodScreen } from "@/screens/FoodScreen";
import { MapScreen } from "@/screens/MapScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { ScamsScreen } from "@/screens/ScamsScreen";
import { Shield } from "lucide-react";
import { useState } from "react";

function AppShell() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<TabKey>("map");

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-brand-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-brand-600 rounded-2xl p-4 mb-3 shadow-glow-brand">
            <Shield className="text-white" size={28} />
          </div>
          <p className="font-semibold text-brand-800">SafeTrail AI</p>
          <Spinner className="mt-3" />
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <>
      <main className="min-h-[100dvh] bg-slate-50">
        {tab === "map" && <MapScreen />}
        {tab === "scams" && <ScamsScreen />}
        {tab === "companion" && <CompanionScreen />}
        {tab === "food" && <FoodScreen />}
        {tab === "profile" && <ProfileScreen />}
      </main>
      <SosButton />
      <BottomNav active={tab} onChange={setTab} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
