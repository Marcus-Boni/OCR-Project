"use client";

import type { User } from "@supabase/supabase-js";
import { ListTodo, StickyNote, Upload } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/browser";

export default function DashboardPage() {
  const t = useTranslations();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} loading={loading} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("dashboard.title")}</h2>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Upload Card */}
          <Link href="/upload">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t("dashboard.uploadCard.title")}</CardTitle>
                </div>
                <CardDescription>
                  {t("dashboard.uploadCard.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">{t("upload.selectFile")}</Button>
              </CardContent>
            </Card>
          </Link>

          {/* Tasks Card */}
          <Link href="/tasks">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ListTodo className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t("dashboard.tasksCard.title")}</CardTitle>
                </div>
                <CardDescription>
                  {t("dashboard.tasksCard.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {t("dashboard.tasksCard.content")}
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Notes Card */}
          <Link href="/notes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <StickyNote className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t("dashboard.notesCard.title")}</CardTitle>
                </div>
                <CardDescription>
                  {t("dashboard.notesCard.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {t("dashboard.notesCard.content")}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-4">
            {t("dashboard.recentActivity.title")}
          </h3>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                {t("dashboard.recentActivity.empty")}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
