"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login and redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen w-full bg-background text-on-background font-body-md">
      {/* Left Side: Visual Anchor */}
      <section className="hidden md:block md:w-1/2 lg:w-3/5 relative overflow-hidden bg-surface-container">
        {/* Full Height Image Asset */}
        <img
          alt="Minimalist desk setup with a steaming cup of tea"
          className="absolute inset-0 w-full h-full object-cover"
          src="/images/img-10.jpg"
        />
        {/* Atmospheric Overlay for Identity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex flex-col justify-end p-8">
          <div className="space-y-2 max-w-md">
            <h1 className="font-display-lg text-display-lg text-white mb-2">Proactive Control.</h1>
            <p className="font-body-md text-white/90 leading-relaxed">
              Experience the next generation of practice management. Sleek, fast, and built for high-growth modern firms.
            </p>
          </div>
        </div>
        {/* Floating Brand Badge */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 bg-white/95 shadow-md px-5 py-2.5 rounded-full border border-slate-100 hover:bg-white transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <span className="text-2xl font-bold text-[#A03B1E]">CAPractice</span>
        </Link>
      </section>

      {/* Right Side: Interaction Canvas */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 bg-surface">
        <div className="max-w-[420px] w-full space-y-6">
          {/* Header */}
          <header className="space-y-2">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Sign In</h2>
            <p className="font-body-md text-secondary">Welcome back. Enter your credentials to manage your practice.</p>
          </header>

          {/* Social Authentication */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-outline-variant bg-surface hover:bg-surface-container-low transition-colors rounded-lg font-body-md text-on-surface-variant cursor-pointer active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-outline-variant bg-surface hover:bg-surface-container-low transition-colors rounded-lg font-body-md text-on-surface-variant cursor-pointer active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path d="M0 0h23v23H0z" fill="#f3f3f3"></path>
                <path d="M1 1h10v10H1z" fill="#f35325"></path>
                <path d="M12 1h10v10H12z" fill="#80bb00"></path>
                <path d="M1 12h10v10H1z" fill="#00a1f1"></path>
                <path d="M12 12h10v10H12z" fill="#ffba00"></path>
              </svg>
              Microsoft
            </button>
          </div>

          {/* Separator */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink mx-4 font-label-caps text-label-caps text-secondary text-xs uppercase tracking-widest font-bold">OR CONTINUE WITH EMAIL</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1 text-xs font-bold uppercase tracking-widest" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <input
                className="w-full px-4 py-3 border border-outline bg-surface rounded-lg font-body-md focus:border-[#A03B1E] focus:outline-none transition-all"
                id="email"
                placeholder="name@company.com"
                type="email"
                required
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1 text-xs font-bold uppercase tracking-widest" htmlFor="password">
                  PASSWORD
                </label>
                <button type="button" onClick={() => alert("Simulating password reset email flow...")} className="text-[#A03B1E] text-sm hover:underline hover:text-[#8a2f15] cursor-pointer">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 border border-outline bg-surface rounded-lg font-body-md focus:border-[#A03B1E] focus:outline-none transition-all"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-[#A03B1E] transition-colors cursor-pointer"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <button
              className="w-full bg-[#FF5722] text-white font-semibold text-lg py-4 rounded-lg shadow-md shadow-[#FF5722]/20 hover:bg-[#e64a19] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              type="submit"
            >
              Login
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          {/* Footer Links */}
          <footer className="text-center pt-4">
            <p className="font-body-md text-secondary">
              Don't have an account?{" "}
              <button type="button" onClick={() => alert("Simulating account creation flow...")} className="text-[#A03B1E] font-semibold hover:underline hover:text-[#8a2f15] cursor-pointer">
                Get Started
              </button>
            </p>
          </footer>

          {/* Compliance / Secondary Footer */}
          <div className="pt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-60">
            <Link className="font-body-sm text-secondary hover:text-primary transition-colors" href="#">Privacy Policy</Link>
            <Link className="font-body-sm text-secondary hover:text-primary transition-colors" href="#">Terms of Service</Link>
            <Link className="font-body-sm text-secondary hover:text-primary transition-colors" href="#">Security</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
