import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { Task } from "../types/database";

interface DraggableTaskCardProps {
  task: Task;
  onToggle: (id: string, status: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onFocus?: (task: Task) => void;
}

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onFocus,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 group"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical size={18} className="text-on-surface-variant" />
      </div>
      <div className="flex-1">
        <TaskCard
          task={task}
          onToggle={() => onToggle(task.id, task.status)}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
          onFocus={() => onFocus?.(task)}
        />
      </div>
    </div>
  );
};
