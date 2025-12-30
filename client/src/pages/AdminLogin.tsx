import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [adminKey, setAdminKey] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthLogin = () => {
    try {
      const loginUrl = "/login";
      // Store admin flag in session/state
      sessionStorage.setItem("adminLoginAttempt", "true");
      window.location.href = loginUrl;
    } catch (error) {
      toast.error("Failed to initiate admin login. Please try again.");
    }
  };

  const handleAdminKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // For now, show a message - OAuth + role-based access is the primary auth method
      toast.info("Admin login is handled through OAuth. Please ensure your account has admin privileges.");
    } catch (error) {
      toast.error("Admin login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-foreground/10">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold tracking-tight font-serif">
              PERFUME
            </a>
          </Link>
          <Link href="/">
            <a className="text-sm hover:text-accent transition-colors">
              Back Home
            </a>
          </Link>
        </div>
      </header>

      <div className="container py-12 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
              Admin Panel
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
            <p className="text-foreground/60">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-accent/10 border border-accent/20 rounded p-4 mb-6">
            <p className="text-sm text-foreground/80">
              ⚠️ This area is restricted to authorized administrators only. Unauthorized access attempts are logged.
            </p>
          </div>

          {/* OAuth Login */}
          <div className="space-y-4 mb-6">
            <button
              onClick={handleOAuthLogin}
              className="w-full py-3 px-4 border border-foreground/20 rounded hover:bg-foreground/5 transition-colors font-medium"
            >
              Sign in with OAuth (Admin)
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-foreground/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-foreground/60">Or</span>
            </div>
          </div>

          {/* Admin Key Login Form */}
          <form onSubmit={handleAdminKeyLogin} className="space-y-4">
            <div>
              <label htmlFor="adminKey" className="block text-sm font-medium mb-2">
                Admin Key / ID
              </label>
              <input
                id="adminKey"
                type="text"
                placeholder="Enter admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Master Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Admin Sign In"}
            </button>
          </form>

          {/* Back to User Login */}
          <div className="text-center mt-6">
            <p className="text-foreground/60 text-sm">
              Not an admin?{" "}
              <Link href="/login">
                <a className="text-accent hover:underline font-medium">
                  User login
                </a>
              </Link>
            </p>
          </div>

          {/* Support */}
          <div className="text-center mt-4 text-xs text-foreground/60">
            <p>
              Need admin access?{" "}
              <a href="mailto:admin@perfume-store.com" className="text-accent hover:underline">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
