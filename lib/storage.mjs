export function serializeProjects(projects) {
  return JSON.stringify(projects);
}

export function parseProjects(value) {
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((project) => project?.schemaVersion !== 1 || !project?.room || !Array.isArray(project?.placements))) {
    throw new Error("Invalid Fursign project collection");
  }
  return parsed;
}
