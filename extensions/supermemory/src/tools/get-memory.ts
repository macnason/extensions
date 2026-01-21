import { getMemoryById } from "../api";

type Input = {
  /**
   * The ID of the memory to retrieve. Get this from search-memories results.
   */
  id: string;
};

export default async function tool(input: Input) {
  const memory = await getMemoryById(input.id);

  // Extract content from chunks if available
  let content = memory.content || "";
  if (!content && memory.chunks && memory.chunks.length > 0) {
    content = memory.chunks.map((chunk) => chunk.content).join("\n\n");
  }

  return {
    id: memory.id,
    title: memory.title || "Untitled Memory",
    content: content || "No content available",
    url: memory.url,
    type: memory.type,
    project: memory.containerTag,
    metadata: memory.metadata,
    createdAt: memory.createdAt,
    updatedAt: memory.updatedAt,
  };
}
