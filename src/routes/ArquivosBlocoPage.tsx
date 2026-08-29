import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Trash2, ArrowLeft } from "lucide-react";
import { useBlocosArquivados } from "../hooks/useBlocosArquivados";
import { BlocoCard, Card, ConfirmModal, SkeletonLoader, GridContainer } from "../components";
import { useLanguage } from "../contexts/LanguageContext";
import type { Bloco } from "../types/database";

export const ArquivosBlocoPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { blocos, loading, error, restaurarBloco, deletarPermanentemente } =
    useBlocosArquivados();
  const [blocoToDelete, setBlocoToDelete] = useState<Bloco | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleRestore = async (id: string) => {
    try {
      await restaurarBloco(id);
    } catch (err) {
      console.error("Erro ao restaurar bloco:", err);
    }
  };

  const handleDeleteClick = (bloco: Bloco) => {
    setBlocoToDelete(bloco);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!blocoToDelete) return;
    try {
      await deletarPermanentemente(blocoToDelete.id);
      setBlocoToDelete(null);
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      console.error("Erro ao excluir bloco:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-16">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-surface-variant rounded-lg animate-pulse flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-8 bg-surface-variant rounded w-48 animate-pulse" />
            <div className="h-5 bg-surface-variant rounded w-96 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} variant="block" className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/galeria")}
          className="p-2 hover:bg-surface-variant rounded-lg transition-colors"
          title={t("archive.backToGallery")}
        >
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <div>
          <h1 className="text-headline-lg text-on-surface font-playfair">
            {t("archive.title")}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {t("archive.subtitle")}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card>
          <p className="text-body-md text-error">{error}</p>
        </Card>
      )}

      <GridContainer>
        {/* Empty state */}
        {blocos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-headline-sm text-on-surface mb-4 font-playfair">
              {t("archive.empty")}
            </p>
            <p className="text-body-md text-on-surface-variant">
              {t("archive.emptyDesc")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {blocos.map((bloco) => (
              <div key={bloco.id} className="relative h-64">
              <BlocoCard bloco={bloco} />
              {/* Action buttons overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent rounded-b-lg flex gap-2">
                <button
                  onClick={() => handleRestore(bloco.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors text-xs font-medium"
                  title={t("archive.restore")}
                >
                  <RotateCcw size={14} />
                  {t("common.restore")}
                </button>
                <button
                  onClick={() => handleDeleteClick(bloco)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-error text-on-error rounded-lg hover:bg-error-container transition-colors text-xs font-medium"
                  title={t("archive.deletePermanent")}
                >
                  <Trash2 size={14} />
                  {t("common.delete")}
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
      </GridContainer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setBlocoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t("archive.deleteTitle")}
        message={t("archive.deleteMessage").replace("{blocName}", blocoToDelete?.nome || "")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
};
