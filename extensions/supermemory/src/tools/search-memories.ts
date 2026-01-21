import { searchMemoriesForTool } from "../api";

type Input = {
  /**
   * The search query to find relevant memories. Use natural language - the search is semantic.
   */
  query: string;
  /**
   * Optional project/container tag to filter results. Use list-projects to see available projects.
   */
  project?: string;
  /**
   * Maximum number of results to return. Defaults to 10.
   */
  limit?: number;
};

export default async function tool(input: Input) {
  if (!input.query || input.query.trim() === "") {
    return {
      message: "Please provide a search query. What would you like to find?",
      results: [],
      total: 0,
    };
  }

  const response = await searchMemoriesForTool({
    q: input.query.trim(),
    containerTags: input.project ? [input.project] : undefined,
    limit: input.limit ?? 10,
  });

  if (!response.results || response.results.length === 0) {
    return {
      message: "No memories found matching your query.",
      results: [],
      total: 0,
    };
  }

  const formattedResults = response.results.map((result) => {
    // Extract content from chunks
    let content = "";
    if (result.chunks && result.chunks.length > 0) {
      content = result.chunks
        .map((chunk: unknown) => {
          if (typeof chunk === "string") return chunk;
          if (
            chunk &&
            typeof chunk === "object" &&
            "content" in chunk &&
            typeof chunk.content === "string"
          )
            return chunk.content;
          if (
            chunk &&
            typeof chunk === "object" &&
            "text" in chunk &&
            typeof chunk.text === "string"
          )
            return chunk.text;
          return "";
        })
        .filter(Boolean)
        .join(" ");
    }

    // Extract URL from metadata
    const url =
      result.metadata?.url && typeof result.metadata.url === "string"
        ? result.metadata.url
        : undefined;

    return {
      id: result.documentId,
      title: result.title || "Untitled Memory",
      content: content || "No content available",
      url,
      score: result.score ? Math.round(result.score * 100) : undefined,
      createdAt: result.createdAt,
      type: result.type,
    };
  });

  return {
    message: `Found ${response.total} memories matching your query.`,
    results: formattedResults,
    total: response.total,
    timing: response.timing,
  };
}
