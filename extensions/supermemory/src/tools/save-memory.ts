import { Tool } from "@raycast/api";
import { addMemoryForTool } from "../api";

type Input = {
  /**
   * The content to save as a memory. Can be text, notes, URLs, or any information you want to remember.
   */
  content: string;
  /**
   * Optional title for the memory. If not provided, one may be auto-generated.
   */
  title?: string;
  /**
   * Optional project/container tag to organize this memory. Use list-projects to see available projects.
   */
  project?: string;
  /**
   * Optional URL associated with this memory.
   */
  url?: string;
};

export const confirmation: Tool.Confirmation<Input> = (input) => {
  const info: { name: string; value: string }[] = [
    {
      name: "Content",
      value:
        input.content.length > 100
          ? input.content.substring(0, 100) + "..."
          : input.content,
    },
  ];

  if (input.title) {
    info.push({ name: "Title", value: input.title });
  }

  if (input.project) {
    info.push({ name: "Project", value: input.project });
  }

  if (input.url) {
    info.push({ name: "URL", value: input.url });
  }

  return {
    message: "Save this memory to Supermemory?",
    info,
  };
};

export default async function tool(input: Input) {
  const memory = await addMemoryForTool({
    content: input.content,
    title: input.title,
    containerTag: input.project,
    url: input.url,
  });

  return {
    success: true,
    message: "Memory saved successfully.",
    memory: {
      id: memory.id,
      title: memory.title || input.title || "Untitled Memory",
      project: memory.containerTag || input.project,
      createdAt: memory.createdAt,
    },
  };
}
