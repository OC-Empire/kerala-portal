import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NRI Corner — Kerala Portal",
  description: "Resources for Non-Resident Keralites.",
};

export default function NRIPage() {
  return (
    <div className="space-y-6">
      <h1 className="section-heading">NRI / Pravasi Corner</h1>
      <p className="text-kerala-muted">Resources for Non-Resident Keralites.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "NORKA", desc: "Non-Resident Keralites Affairs department", icon: "🏢" },
          { title: "Pravasi Welfare Fund", desc: "Welfare schemes for Gulf returnees", icon: "💰" },
          { title: "Remittance Info", desc: "Exchange rates & transfer guides", icon: "💱" },
          { title: "Returnee Support", desc: "Job & skill programs for returnees", icon: "🤝" },
        ].map((s) => (
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