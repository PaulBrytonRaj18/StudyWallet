/**
 * Centralized enum constants — SINGLE SOURCE OF TRUTH for the frontend.
 *
 * These MUST stay synchronized with backend/app/constants/enums.py.
 * If you add/remove/rename a value, change it in BOTH places.
 *
 * Backend source: backend/app/constants/enums.py
 */

export const RESOURCE_TYPES = {
  PDF: "pdf",
  CHATGPT_LINK: "chatgpt_link",
  YOUTUBE_LINK: "youtube_link",
  NOTE: "note",
} as const;
export type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];
export const RESOURCE_TYPE_VALUES: ResourceType[] = Object.values(RESOURCE_TYPES);

export const RESOURCE_STATUSES = {
  NOT_STARTED: "not_started",
  STUDYING: "studying",
  COMPLETED: "completed",
  REVISION_PENDING: "revision_pending",
} as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[keyof typeof RESOURCE_STATUSES];
export const RESOURCE_STATUS_VALUES: ResourceStatus[] = Object.values(RESOURCE_STATUSES);

export const IMPORTANCE_LEVELS = {
  NORMAL: "normal",
  IMPORTANT: "important",
  VERY_IMPORTANT: "very_important",
} as const;
export type Importance = (typeof IMPORTANCE_LEVELS)[keyof typeof IMPORTANCE_LEVELS];
export const IMPORTANCE_VALUES: Importance[] = Object.values(IMPORTANCE_LEVELS);
