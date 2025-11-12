"use client";

import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { CheckCircle2, Circle, FileText, ListTodo, StickyNote, Upload } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/browser";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high" | null;
  created_at: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface Document {
  id: string;
  image_url: string;
  extracted_text: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const t = useTranslations();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<"pt-BR" | "en-US">("pt-BR");
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

    // Detect locale from URL
    const pathname = window.location.pathname;
    if (pathname.startsWith("/en-US")) {
      setLocale("en-US");
    } else {
      setLocale("pt-BR");
    }
  }, [supabase]);

  // Fetch recent tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  // Fetch recent notes
  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["notes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });

  // Fetch recent documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user,
  });

  const dateLocale = locale === "pt-BR" ? ptBR : enUS;
  const isLoadingActivity = tasksLoading || notesLoading || documentsLoading;
  const hasActivity = tasks.length > 0 || notes.length > 0 || documents.length > 0;

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
                <CardDescription>{t("dashboard.uploadCard.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {t("dashboard.uploadCard.content")}
                </div>
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
                <CardDescription>{t("dashboard.tasksCard.description")}</CardDescription>
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
                <CardDescription>{t("dashboard.notesCard.description")}</CardDescription>
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
          <h3 className="text-2xl font-bold mb-4">{t("dashboard.recentActivity.title")}</h3>
          
          {isLoadingActivity ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : hasActivity ? (
            <div className="space-y-6">
              {/* Recent Documents */}
              {documents.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t("dashboard.recentActivity.recentDocuments")}
                  </h4>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {doc.extracted_text || t("dashboard.recentActivity.noTextExtracted")}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(doc.created_at), "PPp", { locale: dateLocale })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Tasks */}
              {tasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <ListTodo className="h-5 w-5 text-primary" />
                      {t("dashboard.recentActivity.recentTasks")}
                    </h4>
                    <Link href="/tasks">
                      <Button variant="outline" size="sm">
                        {t("dashboard.recentActivity.viewAll")}
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {task.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(task.created_at), "PPp", { locale: dateLocale })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Notes */}
              {notes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <StickyNote className="h-5 w-5 text-primary" />
                      {t("dashboard.recentActivity.recentNotes")}
                    </h4>
                    <Link href="/notes">
                      <Button variant="outline" size="sm">
                        {t("dashboard.recentActivity.viewAll")}
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <Card key={note.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <p className="text-sm whitespace-pre-wrap line-clamp-3">
                            {note.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(note.created_at), "PPp", { locale: dateLocale })}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  {t("dashboard.recentActivity.empty")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
