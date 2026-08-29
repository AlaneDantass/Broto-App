import React from "react";
import { Edit2, Trash2, Archive } from "lucide-react";
import type { Bloco } from "../types/database";
import { ColorBar } from "./ColorBar";
import { useLanguage } from "../contexts/LanguageContext";

interface BlocoCardProps {
  bloco: Bloco;
  onClick?: () => void;
  onEdit?: (bloco: Bloco) => void;
  onArchive?: (bloco: Bloco) => void;
  onDelete?: (bloco: Bloco) => void;
}

export const BlocoCard: React.FC<BlocoCardProps> = ({
  bloco,
  onClick,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const { t } = useLanguage();
  const progressPercent = bloco.meta_total
    ? Math.round((bloco.meta_atual / bloco.meta_total) * 100)
    : 0;

  const statusColor = {
    Learning: "bg-secondary",
    Career: "bg-primary",
    Personal: "bg-tertiary",
    Leisure: "bg-secondary-container",
  } as Record<string, string>;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg border border-outline-variant bg-surface-container transition-all hover:shadow-lg flex flex-col h-full ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Color bar at the top */}
      <ColorBar color={(bloco.icone as string) || "#D8ABDC"} className="rounded-t-lg" />

      {/* Main content - grows to fill available space */}
      <div className="p-4 flex flex-col flex-1">
        {/* Header with badges - fixed height */}
        <div className="h-6 mb-2 flex items-center gap-2 flex-wrap">
          {bloco.ativo && (
            <span className="inline-block px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-xs font-medium">
              {t("common.active")}
            </span>
          )}
          {bloco.categoria && (
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium text-on-primary ${
                statusColor[bloco.categoria] || "bg-surface-variant"
              }`}
            >
              {bloco.categoria}
            </span>
          )}
        </div>

        {/* Title - fixed height */}
        <h3 className="text-base font-playfair text-on-surface mb-1.5 line-clamp-2 min-h-7">
          {bloco.nome}
        </h3>

        {/* Description - fixed height (2 lines = ~28px) */}
        <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 min-h-7">
          {bloco.descricao || ""}
        </p>

        {/* Progress bar - only shown if meta exists */}
        {bloco.meta_total > 0 && (
          <div className="mt-auto">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-on-surface-variant">
                {bloco.meta_label || "Progress"}
              </span>
              <span className="text-xs font-medium text-on-surface">
                {bloco.meta_atual} / {bloco.meta_total}
              </span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-0.5">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-on-surface-variant">
              {progressPercent}%
            </div>
          </div>
        )}
      </div>

      {/* Footer actions - fixed height at bottom */}
      <div className="px-4 py-3 border-t border-outline-variant flex gap-3 flex-shrink-0 justify-start">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(bloco);
          }}
          className="p-2 text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors"
          title={t("common.edit")}
        >
          <Edit2 size={18} />
        </button>
        {onArchive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive(bloco);
            }}
            className="p-2 text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors"
            title={t("common.archive")}
          >
            <Archive size={18} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bloco);
            }}
            className="p-2 text-[#A5A58D] hover:text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors"
            title={t("common.delete")}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
