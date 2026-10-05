export interface StructureResult {
  problem: string;
  solution: string;
  target: string;
  hypotheses: string[];
  open_questions: string[];
  next_action: string;
}

export interface ChallengeResult {
  hypotheses: string[];
  risks: string[];
  critical_questions: string[];
  missing_information: string[];
  next_action: string;
}

export interface SummaryResult {
  summary?: string;
  title?: string;
  key_points?: string[];
  next_action?: string;
  [key: string]: unknown;
}

export interface AIAnalysis {
  id: number;
  idea: number;
  user: number;
  analysis_type: "STRUCTURE" | "CHALLENGE" | "SUMMARY";
  input_context: string;
  result: Record<string, unknown>;
  provider: string;
  created_at: string;
}

export interface AIChatSession {
  id: number;
  idea: number;
  user: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIChatMessage {
  id: number;
  session: number;
  role: "USER" | "ASSISTANT";
  content: string;
  created_at: string;
}

export interface AIChatHistory {
  session: AIChatSession;
  messages: AIChatMessage[];
}

export interface AIChatResponse {
  session_id: number;
  message: AIChatMessage;
}

export interface ApplyAIActionResponse {
  action: AIAction;
  result: {
    id: number;
  };
}

export interface StructureResponse {
  idea_id: number;
  analysis_type: "STRUCTURE";
  provider: string;
  result: StructureResult;
}

export interface ChallengeResponse {
  idea_id: number;
  analysis_type: "CHALLENGE";
  provider: string;
  result: ChallengeResult;
}

export type AIActionType =
  | "CREATE_TASK"
  | "CREATE_HYPOTHESIS"
  | "ADD_RESEARCH"
  | "UPDATE_IDEA"
  | "NEXT_STEP";

export type AIActionStatus =
  | "PENDING"
  | "APPLIED"
  | "DISMISSED";

export interface AIAction {
  id: number;
  idea: number;
  user: number;
  action_type: AIActionType;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  status: AIActionStatus;
  created_at: string;
  applied_at: string | null;
}