import React from "react";
import { Trash2, Target } from "lucide-react";
import { TaskStatusIcon } from "./TaskStatusIcon";
import { DescricaoTexto } from "./DescricaoTexto";
import type { Desvio } from "../types/database";
import { useLanguage } from "../contexts/LanguageContext";

interface DesvioCardProps {
  desvio: Desvio;
  onToggle?: () => void;
  onDelete?: () => void;
  onTag?: (tag: string) => void;
}

export const DesvioCard: React.FC<DesvioCardProps> = ({
  desvio,
  onToggle,
  onDelete,
  onTag,
}) => {
  const { language, t } = useLanguage();
  const isCompleted = desvio.concluido;

  return (
    <div
      className={`p-4 bg-surface-container border border-outline-variant rounded-lg transition-all ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Status toggle */}
        <button
          onClick={onToggle}
          className="flex-shrink-0 hover:opacity-80 transition-opacity p-1 mt-1"
        >
          <TaskStatusIcon status={isCompleted ? "concluida" : "pendente"} size={20} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <DescricaoTexto
            texto={desvio.texto}
            className={`text-body-md mb-2 ${
              isCompleted
                ? "line-through text-on-surface-variant"
                : "text-on-surface font-medium"
            }`}
          />

          {/* Origem (task de onde veio) */}
          {desvio.origem_texto && (
            <p className="text-label-sm text-on-surface-variant mb-3">
              <span className="inline-flex items-center gap-1">
                <Target size={14} className="text-primary flex-shrink-0" />
                {t("deviations.origin")} <span className="font-medium">{desvio.origem_texto}</span>
              </span>
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {desvio.tag && (
              <span className="inline-block px-2 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-label-sm">
                {desvio.tag}
              </span>
            )}

            {!desvio.tag && !isCompleted && (
              <div className="flex gap-2">
                <button
                  onClick={() => onTag?.("UNRELATED")}
                  className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm hover:opacity-80 transition-opacity"
                >
                  {language === "en" ? "Mark Unrelated" : "Fora do Escopo"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title={language === "en" ? "Delete" : "Deletar"}
            className="p-2 text-[#A5A58D] hover:text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors flex-shrink-0"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
