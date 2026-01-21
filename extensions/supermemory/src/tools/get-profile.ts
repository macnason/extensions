import { getProfile } from "../api";

type Input = {
  /**
   * Optional query to get contextually relevant profile information.
   */
  query?: string;
};

export default async function tool(input: Input) {
  const response = await getProfile(input.query);

  return {
    profile: response.profile,
    relatedMemories: response.memories?.map((memory) => ({
      id: memory.documentId,
      title: memory.title || "Untitled Memory",
      score: memory.score ? Math.round(memory.score * 100) : undefined,
    })),
  };
}
