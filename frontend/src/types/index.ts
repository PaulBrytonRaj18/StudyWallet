import type { ResourceType, ResourceStatus, Importance } from "@/constants/enums";

export type { ResourceType, ResourceStatus, Importance };
export type { LoginInput, RegisterInput, SubjectCreateInput, ChapterCreateInput, NoteCreateInput, NoteUpdateInput, ResourceCreateInput } from "@/lib/validation";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  chapter_count?: number;
  resource_count?: number;
}

export interface Chapter {
  id: string;
  name: string;
  description: string | null;
  order: number;
  subject_id: string;
  created_at: string;
  updated_at: string;
  resource_count?: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  status: ResourceStatus;
  importance: Importance;
  url: string | null;
  pdf_url: string | null;
  file_name: string | null;
  file_size: number | null;
  user_id: string;
  subject_id: string;
  chapter_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string | null;
  is_markdown: boolean;
  user_id: string;
  subject_id: string | null;
  chapter_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  status: ResourceStatus;
  importance: Importance;
  url: string | null;
  pdf_url: string | null;
  subject_name: string | null;
  chapter_name: string | null;
  tags: string[];
  created_at: string;
}

export interface DashboardStats {
  total_subjects: number;
  total_resources: number;
  completed_resources: number;
  revision_pending: number;
  studying_resources: number;
  not_started_resources: number;
  pdf_count: number;
  total_notes: number;
  study_progress_percentage: number;
}

export interface RecentUpload {
  id: string;
  title: string;
  resource_type: ResourceType;
  subject_name: string | null;
  created_at: string;
}

export interface SubjectProgress {
  subject_id: string;
  subject_name: string;
  color: string;
  total: number;
  completed: number;
  percentage: number;
}

export interface ProgressByStatus {
  status: ResourceStatus;
  count: number;
}

export interface AnalyticsData {
  stats: DashboardStats;
  recent_uploads: RecentUpload[];
  subject_progress: SubjectProgress[];
  progress_by_status: ProgressByStatus[];
}
