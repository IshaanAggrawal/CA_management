import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left space-y-2">
          <div className="font-headline-lg text-xl font-bold text-[#A03B1E] flex items-center gap-2">
            <span className="material-symbols-outlined">assured_workload</span>
            ProAudit
          </div>
          <p className="text-sm text-slate-400 font-medium">The gold standard in CA practice management.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          <Link className="text-sm text-slate-500 hover:text-[#A03B1E] hover:underline transition-all font-medium" href="#">Privacy Policy</Link>
          <Link className="text-sm text-slate-500 hover:text-[#A03B1E] hover:underline transition-all font-medium" href="#">Terms of Service</Link>
          <Link className="text-sm text-slate-500 hover:text-[#A03B1E] hover:underline transition-all font-medium" href="#">Contact Support</Link>
          <Link className="text-sm text-slate-500 hover:text-[#A03B1E] hover:underline transition-all font-medium" href="#">Security</Link>
        </div>
        
        <div className="text-center md:text-right space-y-3">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 CA Practice Management System. All rights reserved.
          </p>
          <div className="flex justify-center md:justify-end gap-5 text-slate-400">
            <span className="material-symbols-outlined cursor-pointer hover:text-[#A03B1E] text-xl transition-all">language</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-[#A03B1E] text-xl transition-all">share</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-[#A03B1E] text-xl transition-all">help</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
