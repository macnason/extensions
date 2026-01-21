import { Tool } from "@raycast/api";
import { deleteMemoryForTool, getMemoryById } from "../api";

type Input = {
  /**
   * The ID of the memory to delete. Get this from search-memories results.
   */
  id: string;
};

export const confirmation: Tool.Confirmation<Input> = async (input) => {
  // Try to get memory details to show what will be deleted
  let memoryTitle = "Memory";
  try {
    const memory = await getMemoryById(input.id);
    memoryTitle = memory.title || "Untitled Memory";
  } catch {
    // If we can't fetch details, just show the ID
  }

  return {
    message:
      "Are you sure you want to delete this memory? This action cannot be undone.",
    info: [
      { name: "Memory", value: memoryTitle },
      { name: "ID", value: input.id },
    ],
    style: "destructive",
  };
};

export default async function tool(input: Input) {
  await deleteMemoryForTool(input.id);

  return {
    success: true,
    message: "Memory deleted successfully.",
    deletedId: input.id,
  };
}
