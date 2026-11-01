// Official links and helplines. Links were checked on 2026-11-01: `ok: true` means the site responded from
// our server; `ok: false` means it didn't respond from outside India (often geo-blocking), not that it's dead.
export const LINKS_CHECKED = "1 November 2026";

export interface GovLink { title: string; desc: string; url: string; icon: string; ok: boolean }
export interface GovGroup { id: string; title: string; icon: string; items: GovLink[] }

export const GOV_GROUPS: GovGroup[] = [
  { id: "certificates", title: "Certificates & local government", icon: "📜", items: [
    { title: "e-District Kerala", desc: "Apply online for revenue and other government certificates through the state's e-District project.", url: "https://edistrict.kerala.gov.in", icon: "📜", ok: true },
    { title: "K-SMART", desc: "Local-body services in one place: birth, death and marriage registration, applications and complaint status, with 800+ services reported online.", url: "https://ksmart.lsgkerala.gov.in", icon: "🏛️", ok: true },
    { title: "Akshaya centres", desc: "Common service centres that help with applications and online services for people who need assistance.", url: "https://akshaya.kerala.gov.in", icon: "🧑‍💻", ok: true },
    { title: "Local Self Government Department", desc: "Panchayat, municipality and corporation portals, schemes and orders.", url: "https://lsgkerala.gov.in", icon: "🏘️", ok: true },
  ]},
  { id: "benefits", title: "Ration card, pensions & benefits", icon: "🍚", items: [
    { title: "Civil Supplies (ration card)", desc: "E-services for ration cards from the Civil Supplies Department. Aadhaar linking is required to receive ration.", url: "https://civilsupplieskerala.gov.in", icon: "🍚", ok: false },
    { title: "Welfare pensions", desc: "Social security and welfare pension information and status through the local-government pension portal.", url: "https://welfarepension.lsgkerala.gov.in", icon: "💰", ok: true },
    { title: "State Health Agency", desc: "Runs Kerala's publicly funded health-insurance schemes, including the Karunya Arogya Suraksha Padhathi.", url: "https://sha.kerala.gov.in", icon: "🏥", ok: true },
    { title: "Health Services", desc: "Directorate of Health Services: government hospitals, programmes and notices.", url: "https://dhs.kerala.gov.in", icon: "⚕️", ok: true },
  ]},
  { id: "land", title: "Land & property", icon: "🗺️", items: [
    { title: "Ente Bhoomi", desc: "The integrated land-records and digital survey portal of the Survey and Land Records Department.", url: "https://entebhoomi.kerala.gov.in", icon: "🗺️", ok: true },
    { title: "ReLIS (Revenue land information)", desc: "Revenue Department's land information system for land-tax and records.", url: "https://relis.kerala.gov.in", icon: "📑", ok: false },
    { title: "Registration Department", desc: "Property registration, encumbrance and guideline-value services.", url: "https://keralaregistration.gov.in", icon: "🏠", ok: false },
  ]},
  { id: "utilities", title: "Electricity, water & transport", icon: "💡", items: [
    { title: "KSEB self-service", desc: "Pay bills, apply for connections and register electricity complaints.", url: "https://wss.kseb.in", icon: "💡", ok: true },
    { title: "Kerala Water Authority", desc: "Water bills, new connections and complaints.", url: "https://kwa.kerala.gov.in", icon: "🚰", ok: true },
    { title: "Parivahan (transport)", desc: "Driving licence, vehicle registration and other transport services from the Ministry of Road Transport.", url: "https://parivahan.gov.in", icon: "🚗", ok: true },
    { title: "Sarathi (driving licence)", desc: "Learner's and driving licence services.", url: "https://sarathi.parivahan.gov.in/sarathiservice/", icon: "🪪", ok: true },
  ]},
  { id: "jobs", title: "Jobs & exams", icon: "🎓", items: [
    { title: "Kerala PSC", desc: "Public Service Commission notifications, applications, results and your profile.", url: "https://www.keralapsc.gov.in", icon: "📋", ok: true },
    { title: "Employment services", desc: "Employment Exchange and job-seeker registration.", url: "https://employment.kerala.gov.in", icon: "💼", ok: true },
  ]},
  { id: "safety", title: "Police, safety & disasters", icon: "🚓", items: [
    { title: "Kerala Police", desc: "Police services, notices and information.", url: "https://keralapolice.gov.in", icon: "🚓", ok: true },
    { title: "Thuna (police online services)", desc: "Citizen portal for online police services.", url: "https://thuna.keralapolice.gov.in", icon: "🛡️", ok: true },
    { title: "Kerala State Disaster Management Authority", desc: "Alerts, advisories and control-room information for floods, landslides and other hazards.", url: "https://sdma.kerala.gov.in", icon: "🌧️", ok: true },
  ]},
  { id: "grievance", title: "Grievances & right to information", icon: "📢", items: [
    { title: "Chief Minister's Office", desc: "The Chief Minister's office portal, including the public grievance route.", url: "https://cmo.kerala.gov.in", icon: "📢", ok: true },
    { title: "CPGRAMS (central grievances)", desc: "The Government of India's public grievance portal, for central departments.", url: "https://pgportal.gov.in", icon: "📨", ok: true },
    { title: "RTI Kerala", desc: "File Right to Information requests to Kerala government departments.", url: "https://rtiportal.kerala.gov.in", icon: "🔎", ok: true },
    { title: "Kerala government portal", desc: "The state's main portal with department links and orders.", url: "https://www.kerala.gov.in", icon: "🌐", ok: true },
  ]},
];

export interface Helpline { label: string; number: string; note?: string }
export const HELPLINES: Helpline[] = [
  { label: "Emergency (police, fire, ambulance)", number: "112", note: "Dialling 112 in Kerala also connects to the free 108 ambulance service." },
  { label: "Police", number: "100" },
  { label: "Fire and rescue", number: "101" },
  { label: "Ambulance", number: "108" },
  { label: "Women's helpline (Mitra)", number: "181" },
  { label: "Child helpline", number: "1098" },
  { label: "KSEB (electricity), 24x7", number: "1912" },
  { label: "Kerala Water Authority", number: "1916", note: "Reported on a local-body page; confirm on the KWA site." },
  { label: "Citizen call centre", number: "155300" },
  { label: "Disaster helpline (district)", number: "1077", note: "District control rooms. The state toll-free line is 1070." },
];

export interface NriLink { title: string; desc: string; url: string; icon: string; ok: boolean }
export const NRI_LINKS: NriLink[] = [
  { title: "NORKA Roots", desc: "Kerala's agency for non-resident Keralites: the Pravasi ID card, insurance, migration support and welfare services.", url: "https://norkaroots.org", icon: "🌍", ok: true },
  { title: "NORKA ID card & insurance", desc: "The Pravasi ID card is valid for 3 years and includes accident cover. Fees and cover amounts have changed over time, so check the portal for the current figures.", url: "https://norkaroots.org/nrk-id-card", icon: "🪪", ok: true },
  { title: "Kerala Pravasi Welfare Board", desc: "Membership and the Pravasi pension scheme for non-resident Keralites aged roughly 18 to 60, under the NRK Welfare Act, 2008. Pension amounts differ by category, so confirm on the Board's site.", url: "https://pravasikerala.org/eng", icon: "💰", ok: true },
  { title: "eMigrate (Government of India)", desc: "The Ministry of External Affairs' system for emigration clearance and recruiting-agent checks, relevant before taking a job overseas.", url: "https://emigrate.gov.in", icon: "✈️", ok: true },
  { title: "MADAD (consular grievances)", desc: "The Ministry of External Affairs' portal for consular help and grievances from Indians abroad.", url: "https://madad.gov.in", icon: "🤝", ok: false },
];
export const NRI_HELPLINES: Helpline[] = [
  { label: "NORKA global contact centre (toll-free, India)", number: "1800 425 3939" },
  { label: "NORKA, calling from abroad (missed-call service)", number: "+91 880 20 12345", note: "Reported by news and aggregator sources. Confirm on norkaroots.org." },
  { label: "NORKA ID card helpdesk", number: "0471 2770543 / 0471 2770528", note: "Listed on the NORKA ID card page." },
];

export interface Authority { id: string; issue: string; icon: string; who: string; how: string; url?: string; number?: string; ok?: boolean }
export const CIVIC_AUTHORITIES: Authority[] = [
  { id: "roads", issue: "Potholes, roads & bridges", icon: "🚧", who: "Your panchayat, municipality or corporation for local roads. The Public Works Department for state roads and bridges.", how: "Use K-SMART's complaint option for local-body roads, or contact the PWD office for state roads.", url: "https://www.pwd.kerala.gov.in", ok: true },
  { id: "water", issue: "Drinking water & pipelines", icon: "💧", who: "Kerala Water Authority.", how: "Call the helpline or use the KWA site to register a complaint.", url: "https://kwa.kerala.gov.in", number: "1916", ok: true },
  { id: "electricity", issue: "Power cuts & street lights", icon: "⚡", who: "KSEB for power supply. The local body for street lights.", how: "Call 1912 (24x7) or use KSEB's self-service site.", url: "https://wss.kseb.in", number: "1912", ok: true },
  { id: "sanitation", issue: "Waste, sanitation & drains", icon: "🗑️", who: "Your local body, with the Haritha Keralam Mission supporting waste management.", how: "Register the complaint on K-SMART or with your ward member or health inspector.", url: "https://ksmart.lsgkerala.gov.in", ok: true },
  { id: "safety", issue: "Safety, crime & women's safety", icon: "🚨", who: "Kerala Police.", how: "Dial 112 in an emergency. For women, 181. Non-urgent services are on the Thuna portal.", url: "https://thuna.keralapolice.gov.in", number: "112", ok: true },
  { id: "disaster", issue: "Floods, landslides & disasters", icon: "🌧️", who: "District disaster control rooms and the State Disaster Management Authority.", how: "Call 1077 (district) or 1070 (state) and check SDMA alerts.", url: "https://sdma.kerala.gov.in", number: "1077", ok: true },
  { id: "general", issue: "Anything else, or no response yet", icon: "📢", who: "The Chief Minister's Office portal, the citizen call centre, or the central CPGRAMS portal.", how: "Escalate to the CM's portal, call 155300, or file on CPGRAMS if the issue involves a central department.", url: "https://cmo.kerala.gov.in", number: "155300", ok: true },
];
