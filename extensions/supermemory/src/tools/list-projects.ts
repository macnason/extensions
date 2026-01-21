import { listProjectsForTool } from "../api";

export default async function tool() {
  const projects = await listProjectsForTool();

  if (!projects || projects.length === 0) {
    return {
      message:
        "No projects found. You can create one using the create-project tool.",
      projects: [],
    };
  }

  const formattedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    containerTag: project.containerTag,
    description: project.description,
  }));

  return {
    message: `Found ${projects.length} project(s).`,
    projects: formattedProjects,
  };
}
