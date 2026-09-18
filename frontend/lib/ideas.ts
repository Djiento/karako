import { apiGet, apiPost, apiPatch } from "@/lib/api";
import type {
  Capture,
  CreateCapturePayload,
  CreateIdeaPayload,
  IdeaStatus,
  IdeaStructure,
  Idea,
  ProcessCaptureResult,
  StructureIdeaResult,
} from "@/types/idea";



export async function getIdeas(): Promise<Idea[]> {
  return apiGet<Idea[]>("/ideas/");
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

export async function processCapture(
  id: number,
): Promise<ProcessCaptureResult> {
  return apiPost<ProcessCaptureResult>(
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

