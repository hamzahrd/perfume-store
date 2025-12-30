import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Register() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async (data) => {
      if (data.accessToken) {
        setToken(data.accessToken);
        // Invalidate the me query cache to force a refetch with the new token
        await utils.auth.me.invalidate();
      }
      toast.success("Account created successfully!");
      setLocation("/account");
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /[0-9]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error("Password must contain uppercase, lowercase, and numbers");
      return;
    }

    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
    } catch (error) {
      // Error is already handled by mutation
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-foreground/60">
              Join us to start shopping for premium perfumes
            </p>
          </div>

          {/* Email Sign Up Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-foreground/20 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                required
                disabled={isLoading || registerMutation.isPending}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-foreground/20 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                required
                disabled={isLoading || registerMutation.isPending}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-foreground/20 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                required
                disabled={isLoading || registerMutation.isPending}
              />
              <p className="text-xs text-foreground/60 mt-1">
                At least 8 characters, with uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-foreground/20 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                required
                disabled={isLoading || registerMutation.isPending}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || registerMutation.isPending}
              className="w-full py-3 px-4 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading || registerMutation.isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-foreground/60">
              Already have an account?{" "}
              <Link href="/login">
                <a className="text-accent hover:underline font-medium">
                  Sign in
                </a>
              </Link>
            </p>
          </div>

          {/* Terms */}
          <div className="text-center mt-4 text-xs text-foreground/60">
            <p>
              By creating an account, you agree to our{" "}
              <a href="#" className="text-accent hover:underline">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
