export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="glass-card p-8 h-48" />
      <div className="glass-card p-5 h-32" />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 h-24" />
        <div className="glass-card p-5 h-24" />
      </div>
    </div>
  );
}