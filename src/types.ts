export interface LogMessage {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "query" | "system";
  message: string;
}

export type SimulatorTab = "farms" | "splitmate" | "notifyflow";
export type ResumeTab = "about" | "experience" | "skills" | "projects" | "contact";

export interface ExperienceItem {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface SkillGroup {
  category: string;
  skills: { name: string; level: number; info?: string }[];
}

export interface ProjectItem {
  id: string;
  name: string;
  badge?: string;
  badgeType?: "progress" | "stable";
  stack: string[];
  description: string;
  highlight: string;
  simulatorId: SimulatorTab;
}
