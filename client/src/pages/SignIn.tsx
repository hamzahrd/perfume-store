import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      if (data.accessToken) {
        setToken(data.accessToken, data.refreshToken);
        // Invalidate the me query cache to force a refetch with the new token
        await utils.auth.me.invalidate();
      }
      toast.success("Logged in successfully!");
      
      // Redirect based on role
      const role = data.user.role;
      if (role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/account");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Login failed. Please try again.");
    },
  });

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      // Error is already handled by mutation
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
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-foreground/60">
              Sign in to your account to continue shopping
            </p>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || loginMutation.isPending}
              className="w-full py-3 px-4 btn-primary disabled:opacity-50"
            >
              {isLoading || loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-foreground/60">
              Don't have an account?{" "}
              <Link href="/register">
                <a className="text-accent hover:underline font-medium">
                  Create one
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
