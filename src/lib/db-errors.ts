/** Postgres "undefined_table": the places/events tables just haven't been created yet. */
export function isMissingTable(e: unknown): boolean {
  const err = e as { code?: string; message?: string; cause?: { code?: string; message?: string } };
  return (
    err?.code === "42P01" ||
    err?.cause?.code === "42P01" ||
    /relation "?(places|events)"? does not exist/i.test(`${err?.message ?? ""} ${err?.cause?.message ?? ""}`)
  );
}
