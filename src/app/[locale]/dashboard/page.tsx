"use client";

import { ListTodo, StickyNote, Upload } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">{t("common.appName")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("nav.dashboard")}</h2>
          <p className="text-muted-foreground">
            Transforme suas anotações manuscritas em tarefas e notas organizadas
          </p>
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
                  <CardTitle>{t("nav.upload")}</CardTitle>
                </div>
                <CardDescription>{t("upload.description")}</CardDescription>
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
                  <CardTitle>{t("nav.tasks")}</CardTitle>
                </div>
                <CardDescription>Gerencie suas tarefas extraídas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Visualize e organize suas tarefas
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
                  <CardTitle>{t("nav.notes")}</CardTitle>
                </div>
                <CardDescription>Acesse suas anotações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Consulte e edite suas notas</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-4">Atividade Recente</h3>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhuma atividade recente. Faça upload de uma imagem para começar!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
