import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive } from "lucide-react";
import { useBlocos } from "../hooks/useBlocos";
import { BlocoCard, BlocoModal, Card, ConfirmModal, SkeletonLoader, GridContainer } from "../components";
import { useLanguage } from "../contexts/LanguageContext";

export const GaleriaPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { blocos, loading, error, createBloco, updateBloco, deleteBloco } =
    useBlocos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBloco, setSelectedBloco] = useState<typeof blocos[0] | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blocoToArchive, setBlocoToArchive] = useState<typeof blocos[0] | null>(
    null
  );
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [blocoToDelete, setBlocoToDelete] = useState<typeof blocos[0] | null>(
    null
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleCreateBloco = async (
    data: Parameters<typeof createBloco>[0]
  ) => {
    setIsSubmitting(true);
    try {
      await createBloco(data);
      setIsModalOpen(false);
      setSelectedBloco(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBloco = async (
    data: Parameters<typeof updateBloco>[1]
  ) => {
    if (!selectedBloco) return;
    setIsSubmitting(true);
    try {
      await updateBloco(selectedBloco.id, data);
      setIsModalOpen(false);
      setSelectedBloco(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveBloco = (bloco: typeof blocos[0]) => {
    setBlocoToArchive(bloco);
    setIsArchiveConfirmOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!blocoToArchive) return;
    try {
      await deleteBloco(blocoToArchive.id);
      setBlocoToArchive(null);
      setIsArchiveConfirmOpen(false);
    } catch (err) {
      console.error("Erro ao arquivar bloco:", err);
    }
  };

  const handlePermanentDelete = (bloco: typeof blocos[0]) => {
    setBlocoToDelete(bloco);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!blocoToDelete) return;
    try {
      // Hard delete from database
      await deleteBloco(blocoToDelete.id);
      setBlocoToDelete(null);
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      console.error("Erro ao deletar bloco:", err);
    }
  };

  const handleEditBloco = (bloco: (typeof blocos)[0]) => {
    setSelectedBloco(bloco);
    setIsModalOpen(true);
  };

  const handleViewBloco = (bloco: (typeof blocos)[0]) => {
    if (!isSubmitting) {
      navigate(`/bloco/${bloco.id}`);
    }
  };

  const handleOpenModal = () => {
    setSelectedBloco(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-16">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-surface-variant rounded w-48 animate-pulse" />
            <div className="h-5 bg-surface-variant rounded w-96 animate-pulse" />
          </div>
          <div className="h-10 bg-surface-variant rounded w-32 animate-pulse" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface mb-2 font-playfair">
            {t("gallery.title")}
          </h1>
          <p className="text-body-md text-on-surface-variant mb-6">
            {t("gallery.subtitle")}
          </p>
        </div>
        <button
          onClick={() => navigate("/arquivo-blocos")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface"
          title="Ver blocos arquivados"
        >
          <Archive size={24} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <Card>
          <p className="text-body-md text-error">{error}</p>
        </Card>
      )}

      <GridContainer className="space-y-6">
        {/* Create button */}
        <div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-primary text-on-primary rounded-full font-medium hover:bg-primary-container transition-colors"
          >
            + {t("gallery.newBlock")}
          </button>
        </div>

        {/* Grid */}
        {blocos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-headline-sm text-on-surface mb-4 font-playfair">
              {t("gallery.noBlocks") ? t("gallery.noBlocks").split(".")[0] : "Sem blocos ainda"}
            </p>
            <p className="text-body-md text-on-surface-variant mb-6">
              {t("gallery.noBlocks")}
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-primary text-on-primary rounded-full font-medium hover:bg-primary-container transition-colors"
            >
              {t("gallery.newBlock")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {blocos.map((bloco) => (
              <div key={bloco.id} className="h-64">
                <BlocoCard
                  bloco={bloco}
                  onClick={() => handleViewBloco(bloco)}
                  onEdit={() => handleEditBloco(bloco)}
                  onArchive={() => handleArchiveBloco(bloco)}
                  onDelete={() => handlePermanentDelete(bloco)}
                />
              </div>
            ))}
          </div>
        )}
      </GridContainer>

      {/* Archive Confirmation Modal */}
      <ConfirmModal
        isOpen={isArchiveConfirmOpen}
        onClose={() => {
          setIsArchiveConfirmOpen(false);
          setBlocoToArchive(null);
        }}
        onConfirm={handleConfirmArchive}
        title={`${t("common.archive")} ${blocoToArchive?.nome || t("gallery.newBlock")}`}
        message={t("gallery.archiveConfirmMessage")}
        confirmLabel={t("common.archive")}
        cancelLabel={t("common.cancel")}
      />

      {/* Delete Permanent Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setBlocoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`${t("common.delete")} ${blocoToDelete?.nome || t("gallery.newBlock")}`}
        message={t("gallery.deleteConfirmMessage").replace("{blocName}", blocoToDelete?.nome || "")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />

      {/* Modal */}
      <BlocoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBloco(null);
        }}
        initialBloco={selectedBloco || undefined}
        onSubmit={selectedBloco ? handleUpdateBloco : handleCreateBloco}
        loading={isSubmitting}
      />
    </div>
  );
};
