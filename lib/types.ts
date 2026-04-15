export interface SheetMeta {
  title: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  level: "beginner" | "intermediate" | "advanced";
}

export const CATEGORY_LABELS: Record<string, string> = {
  cloud: "Cloud",
  containers: "Contenedores",
  orchestration: "Orquestación",
  iac: "Infrastructure as Code",
  tools: "Herramientas",
  system: "Sistema",
};

export const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-green-900 text-green-300",
  intermediate: "bg-yellow-900 text-yellow-300",
  advanced: "bg-red-900 text-red-300",
};
