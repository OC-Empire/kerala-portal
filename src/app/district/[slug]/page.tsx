import { DISTRICT_BY_SLUG } from "@/lib/districts";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function DistrictPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = DISTRICT_BY_SLUG[slug];
  if (!d) notFound();

  return (
    <div className="space-y-10">
      {/* District Hero */}
      <div className={`glass-card p-6 md:p-10 relative overflow-hidden bg-gradient-to-br ${d.accentBg}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <Link href="/districts" className="text-kerala-muted text-sm hover:text-kerala-white transition-colors">
            ← All 14 Districts
          </Link>
          <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-kerala-gold font-semibold">
            {d.region.toUpperCase()} KERALA REGION
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mt-2">
          <h1 className="font-newsreader text-4xl md:text-6xl font-bold text-kerala-white">
            {d.name}
          </h1>
          <span className="font-malayalam text-2xl md:text-3xl text-kerala-gold font-semibold">
            {d.malayalamName}
          </span>
        </div>
        <p className="text-kerala-muted text-lg mt-2 max-w-2xl">{d.tagline}</p>

        {/* Quick District Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {[
            { label: "District Capital", value: d.capital, icon: "🏛️" },
            { label: "Population", value: d.population, icon: "👥" },
            { label: "Land Area", value: d.area, icon: "🗺️" },
            { label: "Prime Sub-Hubs", value: `${d.subLocations.length} Key Centers`, icon: "📍" },
          ].map((s) => (
            <div key={s.label} className="bg-kerala-card/80 border border-kerala-border/60 rounded-xl p-4">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-xs text-kerala-muted">{s.label}</div>
              <div className="text-base font-semibold text-kerala-white mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Locations & Localities Deep Dive (Hyperlocal section) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-heading">Prime Hubs & Localities in {d.name}</h2>
            <p className="text-xs md:text-sm text-kerala-muted">
              Hyperlocal breakdown of major IT corridors, coastal ports, hill towns & cultural centers.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-kerala-green/20 text-emerald-400 font-medium">
            Granular Ward & Hub Layer
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {d.subLocations.map((sub) => (
            <div
              key={sub.id}
              className="glass-card-hover p-5 border-kerala-border hover:border-kerala-gold/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-kerala-gold">
                    {sub.type.replace("_", " ")}
                  </span>
                  <span className="text-xs text-rose-400">
                    ⚠️ {sub.activeIssuesCount} issues
                  </span>
                </div>
                <h3 className="font-newsreader text-xl font-bold text-kerala-white mt-2">
                  {sub.name}
                </h3>
                <div className="text-xs text-kerala-muted font-malayalam">{sub.malayalamName}</div>
                <p className="text-xs text-kerala-muted mt-2 italic">{sub.tagline}</p>

                <div className="mt-4 space-y-1">
                  <span className="text-[11px] font-semibold text-kerala-light uppercase">Key Centers:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sub.highlights.map((h) => (
                      <span key={h} className="text-[11px] px-2 py-0.5 rounded bg-kerala-dark/80 text-kerala-muted">
                        • {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-kerala-border/40 flex items-center justify-between">
                <Link
                  href={`/civic?district=${d.slug}`}
                  className="text-xs text-kerala-gold hover:underline"
                >
                  View Local Issues →
                </Link>
                <Link
                  href={`/tourism`}
                  className="text-xs text-kerala-light hover:underline"
                >
                  Explore Spots →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Famous For & Badges */}
      <section className="glass-card p-6">
        <h2 className="section-heading text-xl mb-3">District Identity & GI Hallmarks</h2>
        <div className="flex flex-wrap gap-2">
          {d.famousFor.map((f) => (
            <span key={f} className="px-3.5 py-1.5 rounded-full bg-kerala-green/20 border border-kerala-green/40 text-kerala-light text-sm font-medium">
              ★ {f}
            </span>
          ))}
        </div>
      </section>

      {/* Tourist Attractions */}
      <section className="space-y-4">
        <h2 className="section-heading">Must-Visit Destinations in {d.name}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {d.touristSpots.map((t) => (
            <div key={t.name} className="glass-card-hover p-6">
              <div className="text-3xl mb-3">{t.emoji}</div>
              <h3 className="font-newsreader text-xl font-semibold text-kerala-white">{t.name}</h3>
              <p className="text-sm text-kerala-muted mt-2 leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Food & Cultural Heritage */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍲</span>
            <h2 className="section-heading text-xl">Signature Cuisine</h2>
          </div>
          <p className="text-xs text-kerala-muted">Authentic flavors indigenous to {d.name} kitchens & street stalls.</p>
          <ul className="space-y-2.5">
            {d.signatureFood.map((f) => (
              <li key={f} className="bg-kerala-dark/60 border border-kerala-border/60 rounded-xl p-3 text-sm text-kerala-white flex items-center gap-2">
                <span className="text-kerala-gold">✦</span> {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <h2 className="section-heading text-xl">Cultural Icons & Heritage</h2>
          </div>
          <p className="text-xs text-kerala-muted">Ritual arts, folklore, and historical movements born in this soil.</p>
          <ul className="space-y-2.5">
            {d.culturalIcons.map((c) => (
              <li key={c} className="bg-kerala-dark/60 border border-kerala-border/60 rounded-xl p-3 text-sm text-kerala-white flex items-center gap-2">
                <span className="text-kerala-light">✦</span> {c}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
