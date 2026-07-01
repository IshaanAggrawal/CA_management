"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Utility functions for calendar
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type CalendarAssignment = {
  id: string;
  deadline: string | Date;
  title: string;
  priority: string;
  status: string;
  client?: { name?: string | null } | null;
};

export default function CalendarClient({ assignments = [] }: { assignments: CalendarAssignment[] }) {
  const router = useRouter();

  // Create events based on assignments
  const currentEvents = assignments.map(a => {
    const d = new Date(a.deadline);
    let type = "other";
    if (a.title.toLowerCase().includes("gst")) type = "gst";
    if (a.title.toLowerCase().includes("tax") || a.title.toLowerCase().includes("itr")) type = "income";
    if (a.title.toLowerCase().includes("tds")) type = "tds";
    if (a.title.toLowerCase().includes("roc")) type = "roc";

    return {
      id: a.id,
      date: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      type,
      title: a.title,
      group: a.client?.name || "No Client",
      assignment: a
    };
  });

  const [currentDate, setCurrentDate] = useState(new Date()); // Starts at current month
  const [view, setView] = useState<"Day" | "Week" | "Month">("Month");
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate());
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const getEventsForDate = (date: Date) => currentEvents.filter((event) => event.date === date.getDate() && event.month === date.getMonth() && event.year === date.getFullYear());

  const selectedDateValue = useMemo(() => {
    const baseDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate || new Date().getDate());
    return baseDate;
  }, [currentDate, selectedDate]);

  const weekDates = useMemo(() => {
    const startOfWeek = new Date(selectedDateValue);
    startOfWeek.setDate(selectedDateValue.getDate() - selectedDateValue.getDay());

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
  }, [selectedDateValue]);

  const selectedDateEvents = getEventsForDate(selectedDateValue);
  const selectedWeekEvents = weekDates.flatMap((date) => getEventsForDate(date));

  const handleLoadLogs = async () => {
    setIsLoadingLogs(true);
    router.push("/dashboard/search?q=whatsapp%20logs");
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handlePrevDay = () => {
    const previousDay = new Date(selectedDateValue);
    previousDay.setDate(selectedDateValue.getDate() - 1);
    setCurrentDate(new Date(previousDay.getFullYear(), previousDay.getMonth(), 1));
    setSelectedDate(previousDay.getDate());
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDateValue);
    nextDay.setDate(selectedDateValue.getDate() + 1);
    setCurrentDate(new Date(nextDay.getFullYear(), nextDay.getMonth(), 1));
    setSelectedDate(nextDay.getDate());
  };

  const handlePrevWeek = () => {
    const previousWeek = new Date(selectedDateValue);
    previousWeek.setDate(selectedDateValue.getDate() - 7);
    setCurrentDate(new Date(previousWeek.getFullYear(), previousWeek.getMonth(), 1));
    setSelectedDate(previousWeek.getDate());
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(selectedDateValue);
    nextWeek.setDate(selectedDateValue.getDate() + 7);
    setCurrentDate(new Date(nextWeek.getFullYear(), nextWeek.getMonth(), 1));
    setSelectedDate(nextWeek.getDate());
  };

  const getEventClass = (type: string) => {
    switch (type) {
      case "gst": return "border-secondary/20 bg-secondary/5 text-secondary";
      case "income": return "border-red-500/20 bg-red-500/5 text-red-600";
      case "tds": return "border-emerald-500/20 bg-emerald-500/5 text-emerald-600";
      case "roc": return "border-blue-500/20 bg-blue-500/5 text-blue-600";
      default: return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  const renderMonthGrid = () => {
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="p-2 border-r border-b border-slate-100 bg-slate-50/50 h-24 sm:h-32">
          <span className="text-xs text-slate-400 opacity-50">{prevMonthDays - i}</span>
        </div>
      );
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const today = new Date();
      const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const isSelected = selectedDate === i;
      const dayEvents = currentEvents.filter((event) => event.date === i && event.month === month && event.year === year);
      const isSunday = new Date(year, month, i).getDay() === 0;

      days.push(
        <div
          key={`current-${i}`}
          onClick={() => {
            setSelectedDate(i);
            setView("Day");
          }}
          className={`p-2 border-r border-b border-slate-200 h-24 sm:h-32 hover:bg-slate-50 transition-colors cursor-pointer group relative overflow-hidden ${isSelected ? 'bg-teal-50/30 ring-2 ring-inset ring-[#005c53]' : ''} ${dayEvents.length > 0 ? 'bg-slate-50/30' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-bold ${isSunday ? 'text-red-500' : 'text-slate-700'}`}>{i}</span>
            {isToday && <span className="text-[9px] bg-[#005c53] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">Today</span>}
          </div>

          <div className="mt-1.5 space-y-1.5 overflow-y-auto max-h-[calc(100%-24px)] custom-scrollbar pr-1">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                onClick={(eventClick) => {
                  eventClick.stopPropagation();
                  router.push(`/dashboard/assignments?q=${encodeURIComponent(event.title)}`);
                }}
                className={`px-1.5 py-1 rounded text-[10px] font-bold truncate border ${getEventClass(event.type)} hover:brightness-95 transition-all`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    const totalCells = days.length;
    const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="p-2 border-r border-b border-slate-100 bg-slate-50/50 h-24 sm:h-32">
          <span className="text-xs text-slate-400 opacity-50">{i}</span>
        </div>
      );
    }

    return days;
  };

  const renderDayView = () => {
    const dateLabel = selectedDateValue.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{dateLabel}</h3>
            <p className="text-sm text-slate-500 mt-1">{selectedDateEvents.length} deadlines scheduled for this day</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevDay} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button onClick={handleNextDay} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {selectedDateEvents.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
              No deadlines for this day.
            </div>
          ) : (
            selectedDateEvents.map((event) => (
              <button key={event.id} onClick={() => router.push(`/dashboard/assignments?q=${encodeURIComponent(event.title)}`)} className="w-full p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{event.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{event.group}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${getEventClass(event.type)}`}>{event.assignment.status.replace("_", " ")}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekLabel = `${weekDates[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${weekDates[6].toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{weekLabel}</h3>
            <p className="text-sm text-slate-500 mt-1">{selectedWeekEvents.length} deadlines in this week</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevWeek} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button onClick={handleNextWeek} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDates.map((date) => {
            const events = getEventsForDate(date);
            return (
              <div key={date.toISOString()} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 min-h-[160px]">
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => {
                    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
                    setSelectedDate(date.getDate());
                    setView("Day");
                  }} className="text-left">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{date.toLocaleDateString("en-GB", { weekday: "short" })}</p>
                    <p className="text-sm font-bold text-slate-900">{date.getDate()}</p>
                  </button>
                  <span className="text-[10px] font-bold text-slate-500">{events.length}</span>
                </div>
                <div className="space-y-2">
                  {events.length === 0 ? (
                    <p className="text-xs text-slate-400">No items</p>
                  ) : (
                    events.slice(0, 3).map((event) => (
                      <button key={event.id} onClick={() => router.push(`/dashboard/assignments?q=${encodeURIComponent(event.title)}`)} className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold truncate border ${getEventClass(event.type)}`}>
                        {event.title}
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 leading-tight">Tax Compliance Calendar</h2>
          <p className="text-sm text-slate-500 mt-1">Reviewing compliance deadlines for <span className="font-bold text-slate-800">{MONTH_NAMES[month]} {year}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            {(["Day", "Week", "Month"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 font-semibold text-xs transition-colors border-r border-slate-200 last:border-0 cursor-pointer ${view === v ? 'bg-[#005c53] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => router.push("/dashboard/search?q=calendar")} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Section */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Calendar Controls & Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h3 className="font-bold text-lg text-slate-800 min-w-[140px] text-center">{MONTH_NAMES[month]} {year}</h3>
              <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722]"></span> GST
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Income Tax
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> TDS
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> ROC
              </span>
            </div>
          </div>

          {view === "Month" ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className={`p-3 text-center text-xs font-bold uppercase tracking-wider ${day === 'Sun' ? 'text-red-400' : 'text-slate-500'}`}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 bg-white">
                {renderMonthGrid()}
              </div>
            </div>
          ) : view === "Day" ? (
            renderDayView()
          ) : (
            renderWeekView()
          )}
        </div>

        {/* Side Panels (Right Column) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Deadline Details Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {selectedDate ? `${MONTH_NAMES[month].substring(0, 3)} ${String(selectedDate).padStart(2, '0')}, ${year}` : 'Select a Date'}
              </h3>
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 font-bold rounded-lg border border-slate-200">
                {selectedDate ? currentEvents.filter(e => e.date === selectedDate && e.month === month && e.year === year).length : 0} Filings
              </span>
            </div>

            {selectedDate && currentEvents.filter(e => e.date === selectedDate && e.month === month && e.year === year).length > 0 ? (
              <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                {currentEvents.filter(e => e.date === selectedDate && e.month === month && e.year === year).map(event => (
                  <div key={event.id}>
                    <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">{event.title}</p>
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{event.assignment.client?.name || "No Client"}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Priority: {event.assignment.priority}</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-amber-100 text-amber-700 rounded font-bold uppercase tracking-wider">{event.assignment.status.replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">event_available</span>
                <p className="text-sm text-slate-500 font-medium">No deadlines for this date.</p>
              </div>
            )}

            <button onClick={() => router.push("/dashboard/assignments")} className="w-full mt-5 py-2.5 border-2 border-[#005c53] text-[#005c53] font-bold text-sm rounded-lg hover:bg-teal-50 transition-all cursor-pointer">
              View All Filings
            </button>
          </div>

          {/* Automated Reminders Panel */}
          <div className="bg-[#005c53] text-white rounded-xl p-5 shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-300">bolt</span>
                  Active Reminders
                </h3>
                <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-white/10">Automated</span>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-black/20 rounded-lg border border-white/10 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm">
                        <svg fill="white" height="16" viewBox="0 0 24 24" width="16">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-1.779-.878-2.056-.978-.277-.1-.478-.15-.678.15s-.778.978-.954 1.177-.353.225-.653.075c-.301-.15-1.271-.468-2.42-1.494-.894-.797-1.498-1.782-1.674-2.082-.176-.3-.019-.462.131-.611.135-.134.301-.35.451-.525.15-.175.2-.299.301-.5.1-.2.05-.375-.025-.525s-.678-1.631-.928-2.231c-.244-.589-.493-.509-.678-.519-.176-.009-.377-.01-.577-.01s-.527.075-.803.375c-.277.3-1.054 1.028-1.054 2.508s1.079 2.911 1.229 3.111c.15.2 2.123 3.241 5.143 4.544.718.311 1.279.497 1.717.637.721.23 1.377.198 1.896.12.578-.087 1.779-.727 2.03-1.428.25-.7.25-1.3.175-1.428-.076-.128-.276-.2-.576-.35z"></path>
                        </svg>
                      </div>
                      <span className="text-sm font-bold">WhatsApp Batch</span>
                    </div>
                    <span className="text-[10px] text-teal-100 font-medium">10:30 AM</span>
                  </div>
                  <p className="text-xs text-teal-50 mb-3 leading-relaxed">Sent bank statement requests to 14 &quot;Pending&quot; GST clients.</p>
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-teal-200">Delivered: 14</span>
                    <button onClick={handleLoadLogs} disabled={isLoadingLogs} className="text-white underline hover:text-teal-100 cursor-pointer disabled:opacity-50 disabled:no-underline flex items-center gap-1">
                      {isLoadingLogs ? <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span> : "View Logs"}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => router.push("/dashboard/settings#integrations")} className="w-full mt-4 py-2.5 bg-white/10 rounded-lg text-white font-bold text-sm hover:bg-white/20 transition-colors border border-white/20 cursor-pointer shadow-sm">
                Configure Reminders
              </button>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <span className="material-symbols-outlined text-[150px]">notifications_active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
