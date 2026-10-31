"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-24">
      <h1 className="font-newsreader text-4xl font-bold text-red-300 mb-4">Something went wrong</h1>
      <p className="text-kerala-muted mb-6">{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset} className="btn-primary">Try again</button>
    </div>
  );
}