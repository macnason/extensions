import { Tool } from "@raycast/api";
import { createProjectForTool } from "../api";

type Input = {
  /**
   * The name for the new project. Projects help organize related memories together.
   */
  name: string;
};

export const confirmation: Tool.Confirmation<Input> = (input) => {
  return {
    message: "Create this project in Supermemory?",
    info: [{ name: "Project Name", value: input.name }],
  };
};

export default async function tool(input: Input) {
  const project = await createProjectForTool(input.name);

  return {
    success: true,
    message: `Project "${project.name}" created successfully.`,
    project: {
      id: project.id,
      name: project.name,
      containerTag: project.containerTag,
      description: project.description,
    },
  };
}
