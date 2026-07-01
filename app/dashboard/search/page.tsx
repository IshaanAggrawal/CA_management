import { prisma } from "@/lib/db";
import Link from "next/link";

type SearchParams = Promise<{ q?: string }>;

const toText = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase();
};

export default async function DashboardSearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = (q || "").trim().toLowerCase();

  const [clients, assignments, invoices, users] = await Promise.all([
    prisma.client.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.assignment.findMany({ include: { client: true, user: true }, orderBy: { deadline: "asc" } }),
    prisma.invoice.findMany({ include: { client: true }, orderBy: { dueDate: "desc" } }),
    prisma.user.findMany({ include: { assignments: true }, orderBy: { name: "asc" } }),
  ]);

  const clientResults = clients.filter((client) =>
    [client.name, client.entityType, client.partnerName, client.contactPerson, client.city, client.email, client.phone, client.pan, client.gstin, client.status]
      .some((value) => toText(value).includes(query))
  );

  const assignmentResults = assignments.filter((assignment) =>
    [assignment.title, assignment.description, assignment.status, assignment.priority, assignment.client.name, assignment.user?.name]
      .some((value) => toText(value).includes(query))
  );

  const invoiceResults = invoices.filter((invoice) =>
    [invoice.id, invoice.status, invoice.client.name, invoice.dueDate.toISOString()]
      .some((value) => toText(value).includes(query))
  );

  const staffResults = users.filter((user) =>
    [user.name, user.email, user.role]
      .some((value) => toText(value).includes(query))
  );

  const sections = [
    {
      title: "Clients",
      href: "/dashboard/clients",
      items: clientResults.map((client) => ({
        title: client.name,
        subtitle: [client.entityType, client.city, client.partnerName].filter(Boolean).join(" • "),
      })),
    },
    {
      title: "Assignments",
      href: "/dashboard/assignments",
      items: assignmentResults.map((assignment) => ({
        title: assignment.title,
        subtitle: [assignment.client.name, assignment.user?.name || "Unassigned", assignment.status.replace("_", " ")].join(" • "),
      })),
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      items: invoiceResults.map((invoice) => ({
        title: `INV-${invoice.id.substring(0, 6).toUpperCase()}`,
        subtitle: [invoice.client.name, invoice.status, `Due ${invoice.dueDate.toLocaleDateString()}`].join(" • "),
      })),
    },
    {
      title: "Staff",
      href: "/dashboard/staff",
      items: staffResults.map((user) => ({
        title: user.name,
        subtitle: [user.role, `${user.assignments.length} assignments`].join(" • "),
      })),
    },
  ];

  const totalResults = sections.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight">Global Search</h1>
        <p className="text-slate-500 text-sm mt-1">Search across clients, assignments, billing, and staff.</p>
      </div>

      <form action="/dashboard/search" method="get" className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex gap-3">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Search clients, tasks, invoices, staff..."
          className="flex-1 px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-[#005c53]"
        />
        <button type="submit" className="px-5 py-3 bg-[#005c53] text-white rounded-lg font-semibold hover:bg-[#004841] transition-colors">
          Search
        </button>
      </form>

      {!query ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-slate-500">
          Enter a search term to see results.
        </div>
      ) : totalResults === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-slate-500">
          No results found for “{q}”.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">{section.title}</h2>
                <Link href={section.href} className="text-sm text-[#005c53] font-semibold hover:underline">
                  Open
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {section.items.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">No matches.</div>
                ) : section.items.map((item) => (
                  <div key={`${section.title}-${item.title}`} className="p-4 hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}