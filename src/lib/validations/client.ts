import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { z } from "zod";

/**
 * Client-side hook for validation schemas with translations
 */
export function useValidationSchemas() {
  const locale = useLocale();
  const t = useTranslations("validation");

  // biome-ignore lint/correctness/useExhaustiveDependencies: <A supression because of the nature of this hook>
  return useMemo(() => {
    const uploadImageSchema = z.object({
      file: z
        .instanceof(File)
        .refine((file) => file.size <= 10 * 1024 * 1024, {
          message: t("file.size"),
        })
        .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), {
          message: t("file.type"),
        }),
    });

    const ocrRequestSchema = z.object({
      imageUrl: z.string().url(t("url.invalid")),
    });

    const ocrResponseSchema = z.object({
      text: z.string(),
      confidence: z.number().min(0).max(1).optional(),
    });

    const aiAnalysisRequestSchema = z.object({
      text: z.string().min(1, t("text.empty")),
      documentId: z.string().uuid(t("uuid.invalid")),
    });

    const taskItemSchema = z.object({
      title: z.string().min(1, t("title.required")),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      dueDate: z.string().datetime().optional(),
    });

    const noteItemSchema = z.object({
      title: z.string().min(1, t("title.required")),
      content: z.string().min(1, t("content.required")),
    });

    const aiAnalysisResponseSchema = z.object({
      tasks: z.array(taskItemSchema),
      notes: z.array(noteItemSchema),
      summary: z.string().optional(),
    });

    const createTaskSchema = z.object({
      documentId: z.string().uuid(t("uuid.invalid")),
      title: z.string().min(1, t("title.required")).max(255, t("title.max")),
      description: z.string().optional(),
      status: z.enum(["pending", "completed"]).default("pending"),
      priority: z.enum(["low", "medium", "high"]).optional(),
      dueDate: z.string().datetime().optional(),
    });

    const updateTaskSchema = createTaskSchema.partial().extend({
      id: z.string().uuid(t("uuid.invalid")),
    });

    const createNoteSchema = z.object({
      documentId: z.string().uuid(t("uuid.invalid")),
      title: z.string().min(1, t("title.required")).max(255, t("title.max")),
      content: z.string().min(1, t("content.required")),
    });

    const updateNoteSchema = createNoteSchema.partial().extend({
      id: z.string().uuid(t("uuid.invalid")),
    });

    const loginSchema = z.object({
      email: z.string().email(t("email.invalid")),
      password: z.string().min(6, t("password.min")),
    });

    const registerSchema = loginSchema
      .extend({
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: t("confirmPassword.match"),
        path: ["confirmPassword"],
      });

    return {
      uploadImageSchema,
      ocrRequestSchema,
      ocrResponseSchema,
      aiAnalysisRequestSchema,
      taskItemSchema,
      noteItemSchema,
      aiAnalysisResponseSchema,
      createTaskSchema,
      updateTaskSchema,
      createNoteSchema,
      updateNoteSchema,
      loginSchema,
      registerSchema,
    };
  }, [locale, t]);
}

// Export types
export type { LoginInput, RegisterInput } from "./index";
