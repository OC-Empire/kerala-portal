export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  district: string;
  source: string;
  publishedAt: Date;
  imageUrl?: string;
  url: string;
  isBreaking?: boolean;
}

export type NewsCategory =
  | "all"
  | "infrastructure"
  | "politics"
  | "tech"
  | "culture"
  | "health"
  | "crime"
  | "weather"
  | "tourism"
  | "sports"
  | "nri";

export const CATEGORY_META: Record<
  NewsCategory,
  { label: string; color: string; bg: string }
> = {
  all:            { label: "All",            color: "text-kerala-white",   bg: "bg-kerala-border"   },
  infrastructure: { label: "Infrastructure", color: "text-orange-300",     bg: "bg-orange-900/40"   },
  politics:       { label: "Politics",       color: "text-red-300",        bg: "bg-red-900/40"      },
  tech:           { label: "Tech",           color: "text-cyan-300",       bg: "bg-cyan-900/40"     },
  culture:        { label: "Culture",        color: "text-purple-300",     bg: "bg-purple-900/40"   },
  health:         { label: "Health",         color: "text-green-300",      bg: "bg-green-900/40"    },
  crime:          { label: "Crime",          color: "text-rose-300",       bg: "bg-rose-900/40"     },
  weather:        { label: "Weather",        color: "text-sky-300",        bg: "bg-sky-900/40"      },
  tourism:        { label: "Tourism",        color: "text-teal-300",       bg: "bg-teal-900/40"     },
  sports:         { label: "Sports",         color: "text-yellow-300",     bg: "bg-yellow-900/40"   },
  nri:            { label: "NRI / Pravasi",  color: "text-indigo-300",     bg: "bg-indigo-900/40"   },
};

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Kochi Metro Phase 3 Extension Gets Cabinet Approval",
    summary: "The Kerala Cabinet approved the ₹3,200 crore Phase 3 extension of Kochi Metro connecting Kakkanad IT corridor to Infopark, expected to ease tech hub traffic.",
    category: "infrastructure",
    district: "Ernakulam",
    source: "The Hindu",
    publishedAt: new Date(Date.now() - 25 * 60_000),
    url: "#",
    isBreaking: true,
  },
  {
    id: "2",
    title: "Munnar Tea Estates See Record Tourist Footfall This Season",
    summary: "Over 4.2 lakh tourists visited Munnar in October 2026 alone, breaking all previous records as the new Idukki Eco-Tourism circuit attracts global travellers.",
    category: "tourism",
    district: "Idukki",
    source: "Mathrubhumi",
    publishedAt: new Date(Date.now() - 2 * 3600_000),
    url: "#",
  },
  {
    id: "3",
    title: "Thrissur Pooram 2027 to Feature Augmented Reality Experience",
    summary: "The Thrissur District Tourism Promotion Council announced an AR-enabled festival experience allowing global viewers to virtually attend the world's greatest festival.",
    category: "culture",
    district: "Thrissur",
    source: "Onmanorama",
    publishedAt: new Date(Date.now() - 4 * 3600_000),
    url: "#",
  },
  {
    id: "4",
    title: "Thiruvananthapuram Smart City — 1,200 CCTV Cameras Installed",
    summary: "The Thiruvananthapuram Corporation completed installation of 1,200 AI-enabled CCTV cameras across the city as part of the ₹480 crore Smart City Mission.",
    category: "tech",
    district: "Thiruvananthapuram",
    source: "New Indian Express",
    publishedAt: new Date(Date.now() - 6 * 3600_000),
    url: "#",
  },
  {
    id: "5",
    title: "Kannur Theyyam Season 2026-27 Calendar Released",
    summary: "The Malabar Devaswom Board released the official Theyyam schedule featuring 450+ rituals across Kannur and Kasaragod districts from November to May.",
    category: "culture",
    district: "Kannur",
    source: "Kerala Kaumudi",
    publishedAt: new Date(Date.now() - 8 * 3600_000),
    url: "#",
  },
  {
    id: "6",
    title: "Wayanad Eco-Tourism Zone Expansion Approved by Forest Department",
    summary: "Three new eco-tourism circuits in Wayanad — Kurichiat, Thrissilery, and Meppadi — receive clearance, creating 2,000 tribal community jobs.",
    category: "tourism",
    district: "Wayanad",
    source: "Deshabhimani",
    publishedAt: new Date(Date.now() - 10 * 3600_000),
    url: "#",
  },
  {
    id: "7",
    title: "Kerala NRI Forum Launches ₹200 Crore Startup Fund",
    summary: "Gulf-based Keralites have pooled ₹200 crore into a new startup acceleration fund targeting 100 tech startups based in Kerala's IT corridors.",
    category: "nri",
    district: "Ernakulam",
    source: "Gulf News Kerala",
    publishedAt: new Date(Date.now() - 12 * 3600_000),
    url: "#",
  },
  {
    id: "8",
    title: "NH-66 Widening: Kazhakootam-Attingal Stretch Opens to Traffic",
    summary: "The long-pending 28km stretch of NH-66 widening project between Kazhakootam and Attingal is finally open, reducing commute times by 40 minutes.",
    category: "infrastructure",
    district: "Thiruvananthapuram",
    source: "Times of India",
    publishedAt: new Date(Date.now() - 14 * 3600_000),
    url: "#",
  },
  {
    id: "9",
    title: "Alappuzha Receives UNESCO Recognition for Backwater Ecosystem",
    summary: "The Alappuzha backwater ecosystem has been shortlisted for UNESCO's List of World Heritage Sites, a landmark recognition for Kerala's unique geography.",
    category: "tourism",
    district: "Alappuzha",
    source: "The Hindu",
    publishedAt: new Date(Date.now() - 18 * 3600_000),
    url: "#",
  },
  {
    id: "10",
    title: "Kozhikode Startup Village Records 500 Active Startups",
    summary: "Kozhikode's startup ecosystem crosses 500 active companies, making it Kerala's second-largest startup hub after Kochi, with combined valuation exceeding ₹3,000 crore.",
    category: "tech",
    district: "Kozhikode",
    source: "Economic Times Kerala",
    publishedAt: new Date(Date.now() - 20 * 3600_000),
    url: "#",
  },
];
