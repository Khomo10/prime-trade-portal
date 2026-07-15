import { Show } from "@clerk/react";
import { Redirect, Link } from "wouter";
import { ArrowRight, BarChart2, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <img src={`${basePath}/logo.svg`} alt="PrimeTrade" className="h-8" />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Log in</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </header>

          {/* Hero */}
          <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-generation trading portal
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-balance">
              Professional Grade Tools for <span className="text-primary">Serious Traders</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl text-balance">
              Join the premier network for South African retail and professional traders. Execute with precision, track with clarity, and elevate your edge.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-14 px-8 text-lg group">
                  Open an Account
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border hover:bg-white/5">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24 text-left">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Deep Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time equity curves, win rates, and PnL tracking down to the tick. Know exactly where your edge lies.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Elite Academy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Structured progression from market mechanics to advanced quantitative strategies. Learn to trade like a pro.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Verified</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bank-grade security protecting your data and your capital. Regulated, audited, and built for trust.
                </p>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border">
            <p>© {new Date().getFullYear()} PrimeTrade Markets (Pty) Ltd. All rights reserved.</p>
          </footer>
        </div>
      </Show>
    </>
  );
}
