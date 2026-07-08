"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingHeader() {
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setActiveHash(window.location.hash || "");
    const handleHashChange = () => setActiveHash(window.location.hash || "");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const getLinkClass = (hash: string) => {
    const isActive = activeHash === hash || (!activeHash && hash === "");
    return `text-sm font-medium transition-colors cursor-pointer ${
      isActive
        ? "text-[#A03B1E] border-b-2 border-[#A03B1E] pb-1 font-semibold"
        : "text-slate-500 hover:text-[#A03B1E]"
    }`;
  };

  return (
    <header className="w-full top-0 sticky z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-12 py-4">
        <Link href="/" className="font-headline-lg text-2xl font-bold text-[#A03B1E] flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">assured_workload</span>
          ProAudit
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link className={getLinkClass("")} href="/" onClick={() => setActiveHash("")}>
            Home
          </Link>
          <Link className={getLinkClass("#features")} href="#features" onClick={() => setActiveHash("#features")}>
            Features
          </Link>
          <Link className={getLinkClass("#pricing")} href="#pricing" onClick={() => setActiveHash("#pricing")}>
            Pricing
          </Link>
          <Link className={getLinkClass("#about")} href="#about" onClick={() => setActiveHash("#about")}>
            About
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#A03B1E] hover:text-[#8a2f15] transition-colors"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="bg-[#FF5722] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#e64a19] shadow-md shadow-[#FF5722]/20 transition-all transform hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
