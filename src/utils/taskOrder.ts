import type { Task } from "../types/database";

export const getNextOrderForPriority = (
  tasks: Task[],
  prioridade: string | null | undefined
): number => {
  // Filter tasks with the same priority
  const samePriorityTasks = tasks.filter((t) => t.prioridade === prioridade);

  // If no tasks with this priority exist, start with 1
  if (samePriorityTasks.length === 0) {
    return 1;
  }

  // Get the maximum order and add 1
  const maxOrder = Math.max(...samePriorityTasks.map((t) => t.ordem || 0));
  return maxOrder + 1;
};

export const getPriorityColor = (
  prioridade: string | null | undefined
): { bg: string; border: string; text: string } => {
  switch (prioridade) {
    case "urgente":
      return {
        bg: "#CB997E",
        border: "#9d6e5a",
        text: "#ffffff",
      };
    case "bloqueadora":
      return {
        bg: "#B7B7A4",
        border: "#8a8a75",
        text: "#ffffff",
      };
    case "importante":
      return {
        bg: "#A5A58D",
        border: "#7a7a62",
        text: "#ffffff",
      };
    default:
      return {
        bg: "transparent",
        border: "transparent",
        text: "inherit",
      };
  }
};

export const getPriorityLabel = (
  prioridade: string | null | undefined,
  language: string
): string => {
  switch (prioridade) {
    case "urgente":
      return language === "en" ? "Urgent" : "Urgente";
    case "bloqueadora":
      return language === "en" ? "Blocking" : "Bloqueadora";
    case "importante":
      return language === "en" ? "Important" : "Importante";
    default:
      return language === "en" ? "No priority" : "Sem prioridade";
  }
};
