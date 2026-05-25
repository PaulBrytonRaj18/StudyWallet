import { z } from "zod";
import {
  RESOURCE_TYPE_VALUES,
  RESOURCE_STATUS_VALUES,
  IMPORTANCE_VALUES,
} from "@/constants/enums";

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const RESERVED_USERNAMES = new Set([
  "admin", "root", "system", "studywallet", "api", "user", "test",
]);
const PASSWORD_UPPERCASE = /[A-Z]/;
const PASSWORD_LOWERCASE = /[a-z]/;
const PASSWORD_DIGIT = /\d/;
const PASSWORD_SPECIAL = /[!@#$%^&*(),.?":{}|<>_\-]/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const registerSchema = z.object({
  full_name: z
    .string()
    .max(255, "Full name must be at most 255 characters")
    .optional(),
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(USERNAME_REGEX, "Username can only contain letters, numbers, and underscores")
    .refine((v) => !RESERVED_USERNAMES.has(v.toLowerCase()), {
      message: "This username is reserved",
    }),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(PASSWORD_UPPERCASE, "Password must contain an uppercase letter")
    .regex(PASSWORD_LOWERCASE, "Password must contain a lowercase letter")
    .regex(PASSWORD_DIGIT, "Password must contain a digit")
    .regex(PASSWORD_SPECIAL, "Password must contain a special character"),
});

export const subjectCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  description: z
    .string()
    .optional(),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, "Color must be a valid hex color (e.g. #6366f1)"),
});

export const chapterCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  description: z
    .string()
    .optional(),
});

export const noteCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  content: z
    .string()
    .optional(),
  subject_id: z
    .string()
    .optional(),
  chapter_id: z
    .string()
    .optional(),
});

export const noteUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  content: z
    .string()
    .optional(),
});

export const resourceCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  description: z
    .string()
    .optional(),
  resource_type: z.enum(
    RESOURCE_TYPE_VALUES as [string, ...string[]],
    { message: "Please select a resource type" }
  ),
  status: z.enum(
    RESOURCE_STATUS_VALUES as [string, ...string[]],
    { message: "Please select a status" }
  ),
  importance: z.enum(
    IMPORTANCE_VALUES as [string, ...string[]],
    { message: "Please select an importance level" }
  ),
  url: z
    .string()
    .optional(),
  chapter_id: z
    .string()
    .optional(),
  tags: z
    .string()
    .optional(),
});

export const searchSchema = z.object({
  q: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  importance: z.string().optional(),
  subject_id: z.string().optional(),
  chapter_id: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type SubjectCreateInput = z.input<typeof subjectCreateSchema>;
export type ChapterCreateInput = z.input<typeof chapterCreateSchema>;
export type NoteCreateInput = z.input<typeof noteCreateSchema>;
export type NoteUpdateInput = z.input<typeof noteUpdateSchema>;
export type ResourceCreateInput = z.input<typeof resourceCreateSchema>;
