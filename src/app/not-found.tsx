import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="font-newsreader text-6xl font-bold kerala-text-gradient mb-4">404</h1>
      <p className="text-kerala-muted mb-6">This page wandered off into the backwaters.</p>
      <Link href="/" className="btn-primary inline-block">Back to Home</Link>
    </div>
  );
}