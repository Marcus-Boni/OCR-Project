"use client";

import type { User } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { CheckCircle2, Circle, Clock, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export default function TasksPage() {
  const t = useTranslations();
  const locale = useLocale();
  const dateLocale = locale === "pt-BR" ? ptBR : enUS;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const queryClient = useQueryClient();

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

  // Fetch tasks
  const {
    data: tasks,
    isLoading: tasksLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  // Toggle task status mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      // @ts-expect-error - Supabase types need regeneration
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", task.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(t("common.success"));
    },
    onError: (error) => {
      console.error("Error toggling task:", error);
      toast.error(t("errors.generic"));
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(t("common.success"));
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast.error(t("errors.generic"));
    },
  });

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-500";
      case "medium":
        return "text-orange-600 dark:text-orange-500";
      case "low":
        return "text-green-600 dark:text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getPriorityLabel = (priority: string | null) => {
    if (!priority) return "-";
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "PPP", { locale: dateLocale });
    } catch {
      return dateString;
    }
  };

  const pendingTasks = tasks?.filter((task) => task.status === "pending") || [];
  const completedTasks =
    tasks?.filter((task) => task.status === "completed") || [];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} loading={loading} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("tasks.title")}</h2>
          <p className="text-muted-foreground">
            {pendingTasks.length} {t("tasks.pending")} • {completedTasks.length}{" "}
            {t("tasks.completed")}
          </p>
        </div>

        {tasksLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-destructive">
                {t("errors.generic")}
              </p>
            </CardContent>
          </Card>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-8">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Circle className="h-5 w-5 text-primary" />
                  {t("tasks.pending")} ({pendingTasks.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {task.title}
                            </CardTitle>
                            {task.description && (
                              <CardDescription className="mt-2">
                                {task.description}
                              </CardDescription>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleTaskMutation.mutate(task)}
                            disabled={toggleTaskMutation.isPending}
                          >
                            <Circle className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-muted-foreground">
                                {t("tasks.priority")}:{" "}
                              </span>
                              <span className={getPriorityColor(task.priority)}>
                                {getPriorityLabel(task.priority)}
                              </span>
                            </div>
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {formatDate(task.due_date)}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            disabled={deleteTaskMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                  {t("tasks.completed")} ({completedTasks.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {completedTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="hover:shadow-md transition-shadow opacity-75"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-through text-muted-foreground">
                              {task.title}
                            </CardTitle>
                            {task.description && (
                              <CardDescription className="mt-2">
                                {task.description}
                              </CardDescription>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleTaskMutation.mutate(task)}
                            disabled={toggleTaskMutation.isPending}
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-muted-foreground">
                                {t("tasks.priority")}:{" "}
                              </span>
                              <span className={getPriorityColor(task.priority)}>
                                {getPriorityLabel(task.priority)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            disabled={deleteTaskMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Circle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">{t("tasks.noTasks")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.recentActivity.empty")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
