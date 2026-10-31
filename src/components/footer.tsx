import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="border-t border-kerala-border mt-16 py-8 text-center text-kerala-muted text-sm">
      <p>{t("copyright")}</p>
    </footer>
  );
}
