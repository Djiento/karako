export type ResearchType =
  | "NOTE"
  | "URL"
  | "ARTICLE"
  | "VIDEO"
  | "DOCUMENT"
  | "INTERVIEW"
  | "OTHER";

export interface ResearchItem {
  id: number;
  idea: number;
  title: string;
  research_type: ResearchType;
  url: string;
  content: string;
  notes: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface CreateResearchItemPayload {
  idea: number;
  title: string;
  research_type: ResearchType;
  url?: string;
  content?: string;
  notes?: string;
  source?: string;
}

export interface UpdateResearchItemPayload {
  title?: string;
  research_type?: ResearchType;
  url?: string;
  content?: string;
  notes?: string;
  source?: string;
}