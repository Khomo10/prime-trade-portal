import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { 
  BarChart2, 
  GraduationCap, 
  Trophy, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
    { href: "/academy", label: "Academy", icon: GraduationCap },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const handleSignOut = () => {
    signOut({ redirectUrl: basePath || "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src={`${basePath}/logo.svg`} alt="PrimeTrade" className="h-6" />
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="h-6 w-6 text-foreground" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex md:flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3">
          <img src={`${basePath}/logo.svg`} alt="PrimeTrade" className="h-8" />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-9 w-9 bg-primary/20 text-primary border border-primary/30">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.fullName || "Trader"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Link 
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location === "/settings" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}