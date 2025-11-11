"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/routing";
import { useUiStore } from "@/lib/store/ui-store";

export function LanguageToggle() {
  const t = useTranslations("settings");
  const pathname = usePathname();
  const router = useRouter();
  const { preferredLocale, setPreferredLocale } = useUiStore();

  const toggleLanguage = () => {
    const newLocale = preferredLocale === "pt-BR" ? "en-US" : "pt-BR";
    setPreferredLocale(newLocale);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} title={t("language")}>
      <Languages className="h-5 w-5" />
      <span className="sr-only">{t("language")}</span>
    </Button>
  );
}
