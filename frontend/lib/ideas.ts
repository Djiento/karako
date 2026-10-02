import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type {
  Capture,
  CreateCapturePayload,
  CreateIdeaPayload,
  IdeaStatus,
  IdeaStructure,
  Idea,
  ProcessCaptureResult,
  StructureIdeaResult,
  ChallengeIdeaResult,
  IdeaChallenge,
  AIAnalysis,
  CreateResearchPayload,
  ResearchItem,
} from "@/types/idea";



export async function challengeIdea(
  id: number,
): Promise<ChallengeIdeaResult> {
  return apiPost<ChallengeIdeaResult>(
    `/ai/ideas/${id}/challenge/`,
  );
}

export async function getIdeas(): Promise<Idea[]> {
  return apiGet<Idea[]>("/ideas/");
}

export async function getIdeaAIAnalyses(
  id: number,
): Promise<AIAnalysis[]> {
  return apiGet<AIAnalysis[]>(
    `/ai/ideas/${id}/analyses/`,
  );
}

export async function getResearch(
  ideaId?: number,
): Promise<ResearchItem[]> {
  const query = ideaId
    ? `?idea=${ideaId}`
    : "";

  return apiGet<ResearchItem[]>(
    `/research/${query}`,
  );
}

export async function createResearch(
  payload: CreateResearchPayload,
): Promise<ResearchItem> {
  return apiPost<ResearchItem>(
    "/research/",
    payload,
  );
}

export async function updateResearch(
  id: number,
  payload: Partial<CreateResearchPayload>,
): Promise<ResearchItem> {
  return apiPatch<ResearchItem>(
    `/research/${id}/`,
    payload,
  );
}

export async function deleteResearch(
  id: number,
): Promise<void> {
  await apiDelete(
    `/research/${id}/`,
  );
}

export async function getIdea(id: number): Promise<Idea> {
  return apiGet<Idea>(`/ideas/${id}/`);
}

export async function createIdea(payload: CreateIdeaPayload): Promise<Idea> {
  return apiPost<Idea>("/ideas/", payload);
}

export async function updateIdea(
  id: number,
  payload: Partial<CreateIdeaPayload>,
): Promise<Idea> {
  return apiPatch<Idea>(`/ideas/${id}/`, payload);
}

/**
 * Captures
 *
 * L'API Django expose /api/captures/
 * et non /api/ideas/captures/
 */
export async function getCaptures(): Promise<Capture[]> {
  return apiGet<Capture[]>("/captures/");
}

export async function createCapture(
  payload: CreateCapturePayload,
): Promise<Capture> {
  return apiPost<Capture>("/captures/", payload);
}

export interface ProcessCaptureResponse {
  idea: Idea;
  capture: Capture;
}

export async function processCapture(
  id: number,
): Promise<ProcessCaptureResponse> {
  return apiPost<ProcessCaptureResponse>(
    `/captures/${id}/process/`,
  );
}

export async function dismissCapture(id: number): Promise<Capture> {
  return apiPost<Capture>(`/captures/${id}/dismiss/`);
}

export async function structureIdea(
  id: number,
): Promise<StructureIdeaResult> {
  return apiPost<StructureIdeaResult>(
    `/ai/ideas/${id}/structure/`,
  );
}

export async function applyIdeaStructure(
  id: number,
  structure: StructureIdeaResult["result"],
): Promise<Idea> {
  const response = await apiPost<{ idea: Idea; applied: boolean }>(
    `/ai/ideas/${id}/structure/apply/`,
    structure,
  );

  return response.idea;
}

export async function applyStructure(
  id: number,
  structure: IdeaStructure,
): Promise<{ idea: Idea }> {
  return apiPost<{ idea: Idea }>(
    `/ai/ideas/${id}/structure/apply/`,
    structure,
  );
}

