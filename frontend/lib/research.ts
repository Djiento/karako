import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

import type {
  CreateResearchItemPayload,
  ResearchItem,
  UpdateResearchItemPayload,
} from "@/types/research";

export async function getResearchItems(
  ideaId?: number,
): Promise<ResearchItem[]> {
  const query = ideaId
    ? `?idea=${ideaId}`
    : "";

  return apiGet<ResearchItem[]>(
    `/research/items/${query}`,
  );
}

export async function getResearchItem(
  id: number,
): Promise<ResearchItem> {
  return apiGet<ResearchItem>(
    `/research/items/${id}/`,
  );
}

export async function createResearchItem(
  payload: CreateResearchItemPayload,
): Promise<ResearchItem> {
  return apiPost<ResearchItem>(
    "/research/items/",
    payload,
  );
}

export async function updateResearchItem(
  id: number,
  payload: UpdateResearchItemPayload,
): Promise<ResearchItem> {
  return apiPatch<ResearchItem>(
    `/research/items/${id}/`,
    payload,
  );
}

export async function deleteResearchItem(
  id: number,
): Promise<void> {
  await apiDelete(
    `/research/items/${id}/`,
  );
}