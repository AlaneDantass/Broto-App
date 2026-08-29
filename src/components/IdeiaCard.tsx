import React from "react";
import type { IdeiaFutura } from "../types/database";
import { DescricaoTexto } from "./DescricaoTexto";

interface IdeiaCardProps {
  ideia: IdeiaFutura;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const IdeiaCard: React.FC<IdeiaCardProps> = ({ ideia, onEdit, onDelete }) => {
  return (
    <div className="bg-surface-container rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-outline-variant">
      {/* Imagem */}
      {ideia.imagem_url && (
        <div className="h-40 bg-surface-variant overflow-hidden">
          <img
            src={ideia.imagem_url}
            alt={ideia.titulo}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        <h3 className="text-label-lg font-medium text-on-surface">
          {ideia.titulo}
        </h3>

        {ideia.descricao && (
          <DescricaoTexto
            texto={ideia.descricao}
            className="text-body-sm text-on-surface-variant line-clamp-3"
          />
        )}

        {/* Tags */}
        {ideia.tag && (
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded text-label-xs font-medium">
              {ideia.tag}
            </span>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 px-3 py-2 bg-primary-container text-on-primary-container rounded text-label-sm font-medium hover:bg-primary transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 px-3 py-2 bg-surface hover:bg-error-container text-on-surface hover:text-error rounded text-label-sm font-medium transition-colors"
            >
              Remover
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
