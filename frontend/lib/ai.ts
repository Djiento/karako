
import { apiGet, apiPost } from "@/lib/api";

import type {
  AIAction,
  AIAnalysis,
  AIChatHistory,
  AIChatResponse,
  AIChatSession,
  ApplyAIActionResponse,
  ChallengeResponse,
  StructureResponse,
  SummaryResult,
} from "@/types/ai";

export async function structureIdea(
  ideaId: number,
): Promise<StructureResponse> {
  return apiPost<StructureResponse>(
    `/ai/ideas/${ideaId}/structure/`,
  );
}

export async function applyStructure(
  ideaId: number,
  data: {
    problem: string;
    solution: string;
    target: string;
    next_action: string;
  },
): Promise<{ idea: Record<string, unknown> }> {
  return apiPost<{ idea: Record<string, unknown> }>(
    `/ai/ideas/${ideaId}/structure/apply/`,
    data,
  );
}

export async function challengeIdea(
  ideaId: number,
): Promise<ChallengeResponse> {
  return apiPost<ChallengeResponse>(
    `/ai/ideas/${ideaId}/challenge/`,
  );
}

export async function summarizeIdea(
  ideaId: number,
): Promise<SummaryResult> {
  return apiPost<SummaryResult>(
    `/ai/ideas/${ideaId}/summary/`,
  );
}

export async function getAIAnalyses(
  ideaId: number,
): Promise<AIAnalysis[]> {
  return apiGet<AIAnalysis[]>(
    `/ai/ideas/${ideaId}/analyses/`,
  );
}

export async function sendAIMessage(
  ideaId: number,
  message: string,
  sessionId?: number,
): Promise<AIChatResponse> {
  return apiPost<AIChatResponse>(
    `/ai/ideas/${ideaId}/chat/`,
    {
      message,
      ...(sessionId ? { session_id: sessionId } : {}),
    },
  );
}

export async function getAIChatSessions(
  ideaId: number,
): Promise<AIChatSession[]> {
  return apiGet<AIChatSession[]>(
    `/ai/ideas/${ideaId}/chat/sessions/`,
  );
}

export async function getAIChatHistory(
  ideaId: number,
  sessionId: number,
): Promise<AIChatHistory> {
  return apiGet<AIChatHistory>(
    `/ai/ideas/${ideaId}/chat/sessions/${sessionId}/`,
  );
}

export async function getAIActions(
  ideaId: number,
): Promise<AIAction[]> {
  return apiGet<AIAction[]>(
    `/ai/ideas/${ideaId}/actions/`,
  );
}

export async function applyAIAction(
  ideaId: number,
  actionId: number,
): Promise<ApplyAIActionResponse> {
  return apiPost<ApplyAIActionResponse>(
    `/ai/ideas/${ideaId}/actions/${actionId}/apply/`,
  );
}

export async function generateAIActions(
  ideaId: number,
): Promise<AIAction[]> {
  return apiPost<AIAction[]>(
    `/ai/ideas/${ideaId}/actions/generate/`,
  );
}