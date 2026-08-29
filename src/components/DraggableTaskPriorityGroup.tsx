import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { getPriorityColor, getPriorityLabel } from "../utils/taskOrder";
import { useLanguage } from "../contexts/LanguageContext";
import { DraggableTaskCard } from "./DraggableTaskCard";
import type { Task } from "../types/database";

interface DraggableTaskPriorityGroupProps {
  tasks: Task[];
  prioridade: "urgente" | "bloqueadora" | "importante" | null;
  onToggle: (id: string, status: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onFocus?: (task: Task) => void;
}

export const DraggableTaskPriorityGroup: React.FC<
  DraggableTaskPriorityGroupProps
> = ({
  tasks,
  prioridade,
  onToggle,
  onEdit,
  onDelete,
  onFocus,
}) => {
  const { language } = useLanguage();

  if (tasks.length === 0) {
    return null;
  }

  const colors = getPriorityColor(prioridade);
  const label = getPriorityLabel(prioridade, language);

  return (
    <div>
      <div
        className="px-3 py-2 rounded-lg mb-3 flex items-center gap-2"
        style={{
          backgroundColor: colors.bg,
          borderLeft: `4px solid ${colors.border}`,
        }}
      >
        <span
          className="text-label-md font-medium"
          style={{ color: colors.text }}
        >
          {label} ({tasks.length})
        </span>
      </div>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 ml-2">
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onFocus={onFocus}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
