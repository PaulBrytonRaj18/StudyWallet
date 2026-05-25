import type {
  LoginInput,
  RegisterInput,
  SubjectCreateInput,
  ChapterCreateInput,
  NoteCreateInput,
  NoteUpdateInput,
  ResourceCreateInput,
} from "@/lib/validation";

export type LoginRequest = LoginInput;
export type RegisterRequest = RegisterInput;
export type SubjectCreateRequest = SubjectCreateInput;
export type ChapterCreateRequest = ChapterCreateInput;
export type NoteCreateRequest = NoteCreateInput;
export type NoteUpdateRequest = NoteUpdateInput;

export interface ResourceCreateRequest extends Omit<ResourceCreateInput, "tags"> {
  subject_id: string;
  tags?: string[];
}
