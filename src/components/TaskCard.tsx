import React, { useState } from "react";
import { Zap, Edit2, Trash2, ChevronDown, ChevronUp, Code, Target, Clock, Check, Plus, Minus, Play } from "lucide-react";
import { ChecklistItems } from "./ChecklistItems";
import { DescricaoTexto } from "./DescricaoTexto";
import type { Task } from "../types/database";
import { useLanguage } from "../contexts/LanguageContext";

interface TaskCardProps {
  task: Task;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFocus?: () => void;
  onStartPomodoro?: () => void;
  expandable?: boolean;
}

interface TaskCardPropsWithPomodoroUpdate extends TaskCardProps {
  onPomodoroUpdate?: (pomodoros_estimados: number | null) => void;
}

export const TaskCard: React.FC<TaskCardPropsWithPomodoroUpdate> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onFocus,
  onStartPomodoro,
  onPomodoroUpdate,
  expandable = true,
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showPomodoroEditor, setShowPomodoroEditor] = React.useState(false);

  const isCompleted = task.status === "concluida";

  return (
    <div
      className={`p-4 bg-surface-container border border-outline-variant rounded-lg transition-all hover:bg-surface-container-high ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Status toggle - Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          className={`flex-shrink-0 flex items-center justify-center w-6 h-6 border-2 rounded transition-all cursor-pointer ${
            isCompleted
              ? "border-[#6B705C] bg-[#6B705C] hover:bg-[#525647] hover:border-[#525647]"
              : "border-[#A5A58D] bg-transparent hover:border-[#6B705C]"
          } mt-0.5`}
          title={isCompleted ? t("common.unmark") : t("common.markComplete")}
        >
          {isCompleted && <Check size={14} className="text-white stroke-[3]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-body-md font-medium mb-2 ${
              isCompleted
                ? "line-through text-on-surface-variant"
                : "text-on-surface"
            }`}
          >
            {task.titulo}
          </h3>

          {task.descricao && (
            <DescricaoTexto
              texto={task.descricao}
              className="text-body-sm text-on-surface-variant mb-3 line-clamp-2"
            />
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-2 mb-3">
            {task.is_programming && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm">
                <Code size={14} className="flex-shrink-0" />
                {t("task.programming")}
              </span>
            )}

            {task.foco_atual && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-container text-on-primary-container rounded-full text-label-sm">
                <Target size={14} className="flex-shrink-0" />
                {t("task.currentFocus")}
              </span>
            )}

            {task.tempo_estimado_minutos && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-label-sm">
                <Clock size={14} className="flex-shrink-0" />
                {task.tempo_estimado_minutos}min
              </span>
            )}

            {task.pomodoros_estimados && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPomodoroEditor(!showPomodoroEditor);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-label-sm hover:bg-amber-200 transition-colors cursor-pointer"
              >
                🍅 {task.pomodoros_concluidos}/{task.pomodoros_estimados}
              </button>
            )}
          </div>

          {/* Progress */}
          {task.status === "em_andamento" && task.tempo_estimado_minutos && (
            <div className="mb-3">
              <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(
                      (task.tempo_gasto_minutos / task.tempo_estimado_minutos) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="text-label-sm text-on-surface-variant mt-1">
                {task.tempo_gasto_minutos} / {task.tempo_estimado_minutos} min
              </div>
            </div>
          )}

          {/* Expand button for checklist */}
          {expandable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-on-surface transition-colors mt-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} />
                  {t("task.ocultarChecklist")}
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  {t("task.verChecklist")}
                </>
              )}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          {task.status !== "concluida" && onStartPomodoro && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartPomodoro();
              }}
              title="Iniciar Pomodoro"
              className="p-2 text-amber-600 hover:bg-amber-50 rounded transition-colors"
            >
              <Play size={18} />
            </button>
          )}

          {task.status !== "concluida" && onFocus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFocus();
              }}
              title={t("common.focusMode")}
              className="p-2 text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors"
            >
              <Zap size={18} />
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title={t("common.edit")}
              className="p-2 text-[#A5A58D] hover:text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors"
            >
              <Edit2 size={18} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title={t("common.delete")}
              className="p-2 text-[#A5A58D] hover:text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Pomodoro Editor (expandable) */}
      {showPomodoroEditor && (
        <div
          className="mt-4 pt-4 border-t border-outline-variant flex items-center gap-4 bg-amber-50 p-3 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-label-sm text-on-surface-variant">
            {t("task.pomodoroEstimated") || "Pomodoros estimados:"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newValue = Math.max(0, (task.pomodoros_estimados || 0) - 1) || null;
                onPomodoroUpdate?.(newValue);
                if (newValue === null) setShowPomodoroEditor(false);
              }}
              className="p-1.5 hover:bg-amber-200 rounded transition-colors"
            >
              <Minus size={16} className="text-amber-900" />
            </button>
            <span className="px-3 py-1 bg-white rounded border border-amber-200 text-body-sm font-medium min-w-12 text-center">
              {task.pomodoros_estimados || 0}
            </span>
            <button
              onClick={() => {
                const newValue = (task.pomodoros_estimados || 0) + 1;
                onPomodoroUpdate?.(newValue);
              }}
              className="p-1.5 hover:bg-amber-200 rounded transition-colors"
            >
              <Plus size={16} className="text-amber-900" />
            </button>
          </div>
        </div>
      )}

      {/* Checklist (expandable) */}
      {expandable && isExpanded && (
        <div className="mt-4 pt-4 border-t border-outline-variant">
          <ChecklistItems taskId={task.id} showAddForm={!isCompleted} />
        </div>
      )}
    </div>
  );
};
