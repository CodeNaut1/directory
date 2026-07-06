/** Build a public project URL — always prefer slug over CUID id */
export function getProjectUrl(project: { slug?: string | null; id: string }): string {
  return `/project/${project.slug || project.id}`;
}
