export type IdeaStatus =
  | "CAPTURED"
  | "UNDERSTANDING"
  | "EXPLORING"
  | "RESEARCHING"
  | "VALIDATING"
  | "BUILDING"
  | "LAUNCHED"
  | "ARCHIVED";

export type CaptureType = "TEXT" | "VOICE" | "IMPORT";

export type CaptureStatus =
  | "INBOX"
  | "PROCESSED"
  | "DISMISSED";

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  problem: string;
  solution: string;
  target: string;
  next_action: string;
  status: IdeaStatus;
  score: number | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface Capture {
  id: number;
  idea: number | null;
  content: string;
  capture_type: CaptureType;
  source: string;
  context: string;
  status: CaptureStatus;
  captured_at: string;
  created_at: string;
}

export interface CreateIdeaPayload {
  title: string;
  description?: string;
  problem?: string;
  solution?: string;
  target?: string;
  next_action?: string;
  status?: IdeaStatus;
  score?: number | null;
  tags?: number[];
}

export interface CreateCapturePayload {
  content: string;
  capture_type?: CaptureType;
  source?: string;
  context?: string;
}

export interface ProcessCaptureResult {
  idea: Idea;
  capture: Capture;
}

export interface IdeaStructure {
  problem: string;
  solution: string;
  target: string;
  hypotheses: string[];
  open_questions: string[];
  next_action: string;
}

export interface StructureIdeaResult {
  idea_id: number;
  analysis_type: string;
  provider: string;
  result: IdeaStructure;
}