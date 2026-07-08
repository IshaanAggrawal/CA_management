"use client";

import { useEffect } from "react";
import Link from "next/link";
import LandingHeader from "@/components/layout/LandingHeader";
import LandingFooter from "@/components/layout/LandingFooter";

export default function LandingPage() {
  useEffect(() => {
    // Micro-interactions and subtle effects
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".glass-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };
    
    document.addEventListener("mousemove", handleMouseMove);

    // Simple scroll reveal for sections
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, observerOptions);

    document.querySelectorAll("section").forEach((section) => {
      section.classList.add("transition-all", "duration-1000", "opacity-0", "translate-y-10");
      observer.observe(section);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFEBE5] text-[#FF5722] text-[13px] font-bold uppercase tracking-[0.1em]">
                PROAUDIT CA PLATFORM LIVE
              </span>
              <h1 className="text-[44px] md:text-[56px] font-bold leading-[1.1] tracking-[-0.02em] text-[#0f172a]">
                Automate Your CA Practice.<br/><span className="text-[#FF5722]">Simplify Compliance.</span>
              </h1>
              <p className="text-[#64748b] text-[17px] md:text-[18px] leading-[1.6] max-w-[620px] font-medium">
                The all-in-one management suite for Chartered Accountants. Track assignments, manage tax deadlines, and automate billing in one unified platform.
              </p>
              <div className="flex gap-4 pt-4">
                <Link href="/login" className="bg-[#FF5722] text-white px-8 py-4 rounded-[12px] text-[18px] font-semibold hover:bg-[#e64a19] shadow-sm transition-all flex items-center gap-2">
                  Get Started Free
                  <span className="material-symbols-outlined font-light text-[22px]">arrow_forward</span>
                </Link>
                <button onClick={() => alert('Opening interactive booking calendar...')} className="bg-white border border-[#e2e8f0] px-8 py-4 rounded-[12px] text-[18px] font-semibold text-[#0f172a] hover:bg-slate-50 transition-all cursor-pointer">
                  Book Demo
                </button>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-3">
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    alt="Professional headshot"
                    src="/images/img-1.jpg"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    alt="Financial advisor"
                    src="/images/img-2.jpg"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    alt="Professional woman"
                    src="/images/img-3.jpg"
                  />
                </div>
                <p className="font-body-sm text-body-sm text-slate-500 font-medium">
                  Trusted by <span className="font-bold text-slate-900">2,500+</span> CA Firms globally
                </p>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="glass-card p-6 rounded-2xl shadow-2xl transform md:rotate-3">
                <img
                  className="w-full h-auto rounded-lg shadow-sm border border-outline-variant"
                  alt="Dashboard interface"
                  src="/images/img-4.jpg"
                />
              </div>
              {/* Decorative accents */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container opacity-10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary-fixed-dim opacity-20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>
        
        {/* Features Bento Grid */}
        <section id="features" className="bg-surface-container-low py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-black">Everything Your Practice Needs</h2>
              <p className="text-secondary text-lg max-w-2xl mx-auto">
                Focus on high-value advisory while we handle the operational heavy lifting.
              </p>
            </div>
            <div className="grid grid-cols-12 gap-6">
              {/* Feature 1: Assignment Tracking */}
              <div className="col-span-12 md:col-span-8 bg-white p-6 rounded-2xl border border-outline-variant flex flex-col md:flex-row gap-8 items-center overflow-hidden">
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      assignment
                    </span>
                  </div>
                  <h3 className="font-headline-lg text-headline-lg text-black">Real-time Assignment Tracking</h3>
                  <p className="text-secondary">
                    Monitor every audit, return, and consultation. Assign tasks to team members and track progress with granular status updates and automated reminders.
                  </p>
                </div>
                <div className="flex-1">
                  <img
                    className="w-full rounded-lg"
                    alt="Task board"
                    src="/images/img-5.jpg"
                  />
                </div>
              </div>
              
              {/* Feature 2: Tax Compliance */}
              <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl border border-outline-variant flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary-fixed-dim rounded-xl flex items-center justify-center text-on-primary-container">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      calendar_today
                    </span>
                  </div>
                  <h3 className="font-headline-lg text-headline-lg text-black">Compliance Calendar</h3>
                  <p className="text-secondary">
                    Never miss a filing deadline again with our synchronized tax calendar across all client portfolios.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-outline-variant flex justify-between items-center">
                  <span className="font-data-mono text-data-mono text-primary">12 DEADLINES THIS WEEK</span>
                  <span className="material-symbols-outlined text-primary">chevron_right</span>
                </div>
              </div>
              
              {/* Feature 3: Billing */}
              <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl border border-outline-variant flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      payments
                    </span>
                  </div>
                  <h3 className="font-headline-lg text-headline-lg text-black">Automated Billing</h3>
                  <p className="text-secondary">
                    Generate professional invoices and track payments effortlessly. Integrated with major payment gateways.
                  </p>
                </div>
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-on-surface">$14,250</span>
                  <span className="text-green-700 text-body-sm font-bold bg-green-100 px-2 rounded">
                    +12% this month
                  </span>
                </div>
              </div>
              
              {/* Feature 4: Client Portal */}
              <div className="col-span-12 md:col-span-8 bg-black text-white p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-center overflow-hidden">
                <div className="flex-1 space-y-4">
                  <h3 className="font-headline-lg text-headline-lg">Secure Client Portal</h3>
                  <p className="text-gray-300">
                    Share documents, get e-signatures, and communicate securely with your clients in a dedicated white-labeled environment.
                  </p>
                  <button className="text-orange-400 font-title-md flex items-center gap-2 hover:underline">
                    Learn about security
                    <span className="material-symbols-outlined">security</span>
                  </button>
                </div>
                <div className="flex-1 opacity-80">
                  <img
                    className="w-full"
                    alt="Data vault"
                    src="/images/img-6.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section id="about" className="py-24 px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold text-black">What Practicing CAs are Saying</h2>
                <p className="text-secondary text-lg mt-4">
                  Join thousands of firms who have transformed their workflow with ProAudit CA.
                </p>
              </div>
              <div className="flex gap-4">
                <button className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-surface-container transition-all text-black">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-surface-container transition-all text-black">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="p-8 bg-gray-50 border border-outline-variant rounded-2xl flex flex-col h-full text-black">
                <div className="flex text-primary mb-6 text-orange-600">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="font-title-md italic flex-grow">
                  "ProAudit has reduced our tax season stress by 60%. The compliance calendar is a lifesaver for our multi-state practice."
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    alt="Rajesh Mehta"
                    src="/images/img-7.jpg"
                  />
                  <div>
                    <p className="font-bold text-on-surface">Rajesh Mehta</p>
                    <p className="text-body-sm text-secondary">Founder, Mehta & Associates</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="p-8 bg-white border-2 border-primary-container rounded-2xl flex flex-col h-full relative text-black">
                <div className="absolute -top-4 right-8 bg-primary-container text-white px-4 py-1 rounded-full text-label-caps uppercase bg-orange-600">
                  Recommended
                </div>
                <div className="flex text-primary mb-6 text-orange-600">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="font-title-md italic flex-grow">
                  "The billing automation alone paid for the software in the first two months. We're capturing 20% more billable hours now."
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    alt="Sarah Collins"
                    src="/images/img-8.jpg"
                  />
                  <div>
                    <p className="font-bold text-on-surface">Sarah Collins</p>
                    <p className="text-body-sm text-secondary">Partner, Sterling CPA Group</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="p-8 bg-gray-50 border border-outline-variant rounded-2xl flex flex-col h-full text-black">
                <div className="flex text-primary mb-6 text-orange-600">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="font-title-md italic flex-grow">
                  "Transitioning from legacy software was effortless. Their support team actually understands CA practice workflows."
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    alt="Ananya Iyer"
                    src="/images/img-9.jpg"
                  />
                  <div>
                    <p className="font-bold text-on-surface">Ananya Iyer</p>
                    <p className="text-body-sm text-secondary">Managing Partner, AI & Co</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-8 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-black">Simple, Transparent Pricing</h2>
              <p className="text-secondary text-lg max-w-2xl mx-auto">
                Start for free, upgrade when you need more capacity.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="p-8 bg-white border border-outline-variant rounded-2xl flex flex-col hover:shadow-lg transition-shadow">
                <h3 className="font-headline-md text-primary mb-2">Free</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-black">₹0</span>
                  <span className="text-secondary font-label-md">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                    Up to 5 Clients
                  </li>
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                    1 Staff Member
                  </li>
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                    Basic Task Tracking
                  </li>
                </ul>
                <Link href="/login" className="block w-full py-3 px-4 border-2 border-primary text-primary font-bold rounded-xl text-center hover:bg-primary-container transition-colors">
                  Get Started Free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="p-8 bg-[#FF5722] text-white border border-outline-variant rounded-2xl flex flex-col relative transform md:-translate-y-4 shadow-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="font-headline-md text-white mb-2">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹1,999</span>
                  <span className="text-white/80 font-label-md">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-xl">check_circle</span>
                    Up to 50 Clients
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-xl">check_circle</span>
                    3 Staff Members
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-xl">check_circle</span>
                    Automated Reminders
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-xl">check_circle</span>
                    Document Management
                  </li>
                </ul>
                <Link href="/login" className="block w-full py-3 px-4 bg-white text-[#FF5722] font-bold rounded-xl text-center hover:bg-gray-100 transition-colors">
                  Start 14-Day Trial
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="p-8 bg-white border border-outline-variant rounded-2xl flex flex-col hover:shadow-lg transition-shadow">
                <h3 className="font-headline-md text-primary mb-2">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-black">₹4,999</span>
                  <span className="text-secondary font-label-md">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                    Unlimited Clients
                  </li>
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                    Unlimited Staff
                  </li>
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                    Custom Branding
                  </li>
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                    Priority Support
                  </li>
                </ul>
                <button onClick={() => alert('Opening contact form...')} className="block w-full py-3 px-4 border-2 border-outline text-on-surface font-bold rounded-xl text-center hover:bg-surface-container transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-8 bg-black relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Scale Your Practice?</h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto mb-10">
              Start your 14-day free trial. No credit card required. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="bg-[#FF5722] text-white px-10 py-5 rounded-xl font-headline-lg text-headline-lg hover:bg-[#e64a19] transition-colors flex items-center justify-center">
                Get Started Free
              </Link>
              <button onClick={() => alert('Opening schedule calendar...')} className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-xl font-headline-lg text-headline-lg hover:bg-white/20 transition-all cursor-pointer">
                Schedule a Call
              </button>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
