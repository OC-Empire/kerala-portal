import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Government Services — Kerala Portal",
  description: "Quick access to Kerala government services.",
};

const services = [
  { title: "Aadhaar Services", desc: "Update, download, and link Aadhaar", icon: "🪪" },
  { title: "Ration Card", desc: "Apply / renew ration cards", icon: "🍚" },
  { title: "Revenue Certificates", desc: "Income, caste, nativity certificates", icon: "📜" },
  { title: "Pension Schemes", desc: "Welfare & pension portals", icon: "💰" },
  { title: "Land Records", desc: "View & download land records", icon: "🗺️" },
  { title: "Health Services", desc: "Govt hospitals & schemes", icon: "🏥" },
];

export default function GovernmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="section-heading">Government Services</h1>
      <p className="text-kerala-muted">Quick access to Kerala government services.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.title} className="glass-card-hover p-5">
            <div className="text-3xl mb-3">{s.icon}</div>
            <h3 className="font-semibold text-kerala-white">{s.title}</h3>
            <p className="text-sm text-kerala-muted mt-1">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}