import { z } from "zod";

/**
 * Schema for image upload validation
 */
export const uploadImageSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size must be less than 10MB",
    })
    .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), {
      message: "File must be a JPEG, PNG, or WEBP image",
    }),
});

/**
 * Schema for OCR request
 */
export const ocrRequestSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
});

/**
 * Schema for OCR response from Google Vision API
 */
export const ocrResponseSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1).optional(),
});

export type OcrRequest = z.infer<typeof ocrRequestSchema>;
export type OcrResponse = z.infer<typeof ocrResponseSchema>;

/**
 * Schema for AI analysis request
 */
export const aiAnalysisRequestSchema = z.object({
  text: z.string().min(1, "Text cannot be empty"),
  documentId: z.string().uuid("Invalid document ID"),
});

/**
 * Schema for a task item
 */
export const taskItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().datetime().optional(),
});

/**
 * Schema for a note item
 */
export const noteItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

/**
 * Schema for AI analysis response from Gemini
 */
export const aiAnalysisResponseSchema = z.object({
  tasks: z.array(taskItemSchema),
  notes: z.array(noteItemSchema),
  summary: z.string().optional(),
});

export type AiAnalysisRequest = z.infer<typeof aiAnalysisRequestSchema>;
export type AiAnalysisResponse = z.infer<typeof aiAnalysisResponseSchema>;
export type TaskItem = z.infer<typeof taskItemSchema>;
export type NoteItem = z.infer<typeof noteItemSchema>;

/**
 * Schema for creating a task
 */
export const createTaskSchema = z.object({
  documentId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  status: z.enum(["pending", "completed"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().datetime().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Schema for updating a task
 */
export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * Schema for creating a note
 */
export const createNoteSchema = z.object({
  documentId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/**
 * Schema for updating a note
 */
export const updateNoteSchema = createNoteSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/**
 * Schema for authentication
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
