"use client";

import { Menu, ScanText } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { UserNav } from "@/components/user-nav";

interface AppHeaderProps {
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  loading?: boolean;
}

export function AppHeader({ user, loading = false }: AppHeaderProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ScanText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden font-bold text-xl sm:inline-block">
              {t("common.appName")}
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-primary text-foreground/60"
            >
              {t("nav.dashboard")}
            </Link>
            <Link
              href="/upload"
              className="transition-colors hover:text-primary text-foreground/60"
            >
              {t("nav.upload")}
            </Link>
            <Link
              href="/tasks"
              className="transition-colors hover:text-primary text-foreground/60"
            >
              {t("nav.tasks")}
            </Link>
            <Link
              href="/notes"
              className="transition-colors hover:text-primary text-foreground/60"
            >
              {t("nav.notes")}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />

            {/* User Avatar or Skeleton */}
            {loading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : (
              user && <UserNav user={user} />
            )}

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>{t("common.appName")}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6 ml-4">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <Separator />
                  <Link
                    href="/upload"
                    onClick={() => setOpen(false)}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    {t("nav.upload")}
                  </Link>
                  <Separator />
                  <Link
                    href="/tasks"
                    onClick={() => setOpen(false)}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    {t("nav.tasks")}
                  </Link>
                  <Separator />
                  <Link
                    href="/notes"
                    onClick={() => setOpen(false)}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    {t("nav.notes")}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
