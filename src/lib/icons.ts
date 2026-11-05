import {
  School, GraduationCap, BookOpen, TreePine, Squirrel, Landmark, Trophy,
  UtensilsCrossed, Utensils, Palette, Waves, Gem, MapPin, Sparkles, Users,
  Calendar, Circle, Target, Ship, Timer, Medal, ScrollText, Building2,
  MonitorSmartphone, Home, Wheat, Coins, Hospital, Stethoscope, Map, FileText,
  Lightbulb, Droplets, Car, CreditCard, ClipboardList, Briefcase, Shield,
  CloudRain, Megaphone, Mail, Search, Globe, Plane, Handshake,
  Construction, Zap, Trash2, ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  School, GraduationCap, BookOpen, TreePine, Squirrel, Landmark, Trophy,
  UtensilsCrossed, Utensils, Palette, Waves, Gem, MapPin, Sparkles, Users,
  Calendar, Circle, Target, Ship, Timer, Medal, ScrollText, Building2,
  MonitorSmartphone, Home, Wheat, Coins, Hospital, Stethoscope, Map, FileText,
  Lightbulb, Droplets, Car, CreditCard, ClipboardList, Briefcase, Shield,
  CloudRain, Megaphone, Mail, Search, Globe, Plane, Handshake,
  Construction, Zap, Trash2, ShieldAlert,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? MapPin;
}
