import Image from "next/image";

export default function DashboardHeader() {
  return (
    <header className="h-16 sticky top-0 z-40 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex items-center justify-between px-6 w-full ml-[260px] max-w-[calc(1440px-260px)]">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input 
            className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-label-md focus:ring-2 focus:ring-secondary transition-all" 
            placeholder="Search clients, assignments, or documents..." 
            type="text" 
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-outline-variant">
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors relative">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary">history</span>
          </button>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          Create New
        </button>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-primary">Aditya Sharma</p>
            <p className="text-[10px] text-on-surface-variant">Senior Partner</p>
          </div>
          <Image 
            alt="Aditya Sharma" 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-surface-container-high" 
            src="/images/img-13.jpg"
            width={36}
            height={36}
          />
        </div>
      </div>
    </header>
  );
}
