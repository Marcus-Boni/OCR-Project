"use client";

import type { User } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, FileImage, Loader2, Upload as UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/browser";

type UploadStep = "idle" | "uploading" | "ocr" | "analyzing" | "success";

interface UploadResponse {
  success: boolean;
  data: {
    documentId: string;
    imageUrl: string;
  };
}

interface OcrResponse {
  success: boolean;
  data: {
    text: string;
  };
}

interface AnalyzeResponse {
  success: boolean;
  data: {
    tasks: Array<{
      title: string;
      description?: string;
      priority?: "low" | "medium" | "high";
      dueDate?: string;
    }>;
    notes: Array<{
      title: string;
      content: string;
    }>;
    summary?: string;
  };
}

export default function UploadPage() {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<UploadStep>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
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

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return response.json() as Promise<UploadResponse>;
    },
  });

  const ocrMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "OCR failed");
      }

      return response.json() as Promise<OcrResponse>;
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: { text: string; documentId: string }) => {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      return response.json() as Promise<AnalyzeResponse>;
    },
  });

  const processFile = useCallback(
    async (file: File) => {
      if (!user) {
        toast.error(t("errors.unauthorized"));
        return;
      }

      try {
        setCurrentStep("uploading");
        const uploadResult = await uploadMutation.mutateAsync(file);

        if (!uploadResult.success) {
          throw new Error("Upload failed");
        }

        const { documentId, imageUrl } = uploadResult.data;

        setCurrentStep("ocr");
        const ocrResult = await ocrMutation.mutateAsync(imageUrl);

        if (!ocrResult.success || !ocrResult.data.text) {
          throw new Error(t("ocr.noText"));
        }

        const extractedText = ocrResult.data.text;
        setExtractedText(extractedText);

        await supabase
          .from("documents")
          .update({ extracted_text: extractedText })
          .eq("id", documentId);

        setCurrentStep("analyzing");
        const analysisResult = await analyzeMutation.mutateAsync({
          text: extractedText,
          documentId,
        });

        if (!analysisResult.success) {
          throw new Error("Analysis failed");
        }

        const { tasks, notes } = analysisResult.data;

        if (tasks && tasks.length > 0) {
          const tasksToInsert = tasks.map((task) => ({
            document_id: documentId,
            user_id: user.id,
            title: task.title,
            description: task.description || null,
            priority: task.priority || null,
            due_date: task.dueDate || null,
            status: "pending" as const,
          }));

          const { error: tasksError } = await supabase.from("tasks").insert(tasksToInsert);
          if (tasksError) {
            console.error("Error saving tasks:", tasksError);
          }
        }

        if (notes && notes.length > 0) {
          const notesToInsert = notes.map((note) => ({
            document_id: documentId,
            user_id: user.id,
            title: note.title,
            content: note.content,
          }));

          const { error: notesError } = await supabase.from("notes").insert(notesToInsert);
          if (notesError) {
            console.error("Error saving notes:", notesError);
          }
        }

        await supabase
          .from("documents")
          .update({ analysis: analysisResult.data })
          .eq("id", documentId);

        setCurrentStep("success");
        toast.success(t("upload.success"));

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (error) {
        console.error("Processing error:", error);
        toast.error(error instanceof Error ? error.message : t("upload.error"));
        setCurrentStep("idle");
        setPreviewUrl(null);
      }
    },
    [user, t, uploadMutation, ocrMutation, analyzeMutation, supabase, router]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(t("validation.file.type"));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("validation.file.size"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      processFile(file);
    },
    [processFile, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled: currentStep !== "idle",
  });

  const getStepMessage = () => {
    switch (currentStep) {
      case "uploading":
        return t("upload.uploading");
      case "ocr":
        return t("ocr.extracting");
      case "analyzing":
        return t("ocr.analyzing");
      case "success":
        return t("upload.success");
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} loading={loading} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{t("upload.title")}</h2>
            <p className="text-muted-foreground">{t("upload.description")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("upload.selectFile")}</CardTitle>
              <CardDescription>
                {t("upload.maxSize")} • {t("upload.acceptedFormats")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                  transition-colors duration-200
                  ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                  ${
                    currentStep !== "idle"
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-primary hover:bg-primary/5"
                  }
                `}
              >
                <input {...getInputProps()} />

                {previewUrl ? (
                  <div className="space-y-4">
                    {/** biome-ignore lint/performance/noImgElement: <Supressed because using native img for preview only> */}
                    <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    {currentStep !== "idle" && (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="font-medium">{getStepMessage()}</span>
                      </div>
                    )}
                    {currentStep === "success" && (
                      <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">{getStepMessage()}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      {currentStep === "idle" ? (
                        <FileImage className="h-16 w-16 text-muted-foreground" />
                      ) : (
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        {isDragActive ? t("upload.dragDrop") : t("upload.dragDrop")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t("upload.maxSize")} • {t("upload.acceptedFormats")}
                      </p>
                    </div>
                    {currentStep === "idle" && (
                      <Button variant="outline" size="lg" className="mt-4">
                        <UploadIcon className="h-5 w-5 mr-2" />
                        {t("upload.selectFile")}
                      </Button>
                    )}
                    {currentStep !== "idle" && currentStep !== "success" && (
                      <p className="text-primary font-medium">{getStepMessage()}</p>
                    )}
                  </div>
                )}
              </div>

              {extractedText && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">{t("ocr.extracted")}</h3>
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{extractedText}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
