import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { getPriorityColor, getPriorityLabel } from "../utils/taskOrder";
import { useLanguage } from "../contexts/LanguageContext";
import type { Bloco, BlocoDoDia } from "../types/database";

interface DayPlanBlocoCardProps {
  blocoDoDia: BlocoDoDia;
  bloco: Bloco | undefined;
  onRemove: (id: string) => void;
  onClick?: (blocoId: string) => void;
}

export const DayPlanBlocoCard: React.FC<DayPlanBlocoCardProps> = ({
  blocoDoDia,
  bloco,
  onRemove,
  onClick,
}) => {
  const { language, t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: blocoDoDia.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = getPriorityColor(blocoDoDia.prioridade);
  const priorityLabel = getPriorityLabel(blocoDoDia.prioridade, language);

  if (!bloco) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical size={16} className="text-on-surface-variant" />
      </div>

      {/* Card body */}
      <div
        onClick={() => onClick?.(bloco.id)}
        className="flex-1 flex items-center gap-3 p-3 bg-surface hover:bg-surface-container-high rounded-lg cursor-pointer transition-colors border border-outline-variant"
      >
        {/* Block color indicator */}
        <div
          className="w-3 h-8 rounded-sm flex-shrink-0"
          style={{ backgroundColor: (bloco.icone as string) || "#D8ABDC" }}
        />

        {/* Block info */}
        <div className="flex-1 min-w-0">
          <p className="text-body-sm text-on-surface font-medium truncate">
            {bloco.nome}
          </p>
          {bloco.categoria && (
            <p className="text-label-xs text-on-surface-variant">
              {bloco.categoria}
            </p>
          )}
        </div>

        {/* Priority badge */}
        {blocoDoDia.prioridade && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
            style={{
              backgroundColor: priorityColors.bg,
              color: priorityColors.text,
            }}
          >
            {priorityLabel}
          </span>
        )}

        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(blocoDoDia.id);
          }}
          className="p-1 opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all flex-shrink-0 rounded hover:bg-surface-container"
          title={t("dashboard.removeFromDay")}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
