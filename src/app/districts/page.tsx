import type { Metadata } from "next";
import { DISTRICTS } from "@/lib/districts";
import DistrictsOverviewGraph from "@/components/districts-overview-graph";

export const metadata: Metadata = {
  title: "Districts — Kerala Portal",
  description: "Explore all 14 districts of Kerala with tourist spots, food, and culture.",
};

export default function DistrictsPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="section-heading">All 14 Districts of Kerala</h1>
        <p className="text-sm text-kerala-muted max-w-lg mx-auto">
          An interactive constellation of Kerala&apos;s districts — grouped by region. Tap any district to explore.
        </p>
      </div>
      <DistrictsOverviewGraph districts={DISTRICTS} />
    </div>
  );
}
