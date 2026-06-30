"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {

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
        <div className="max-w-[420px] w-full flex justify-center">
          <SignIn routing="hash" forceRedirectUrl="/dashboard" />
        </div>
      </section>
    </main>
  );
}
