import React, { useState } from "react";
import { useFutureIdeas } from "../hooks/useFutureIdeas";
import { IdeiaCard, Card, ConfirmModal, SkeletonLoader, GridContainer } from "../components";
import { IdeiaModal } from "../components/IdeiaModal";
import type { IdeiaFutura } from "../types/database";
import { useLanguage } from "../contexts/LanguageContext";

export const IdeiasPage: React.FC = () => {
  const { t } = useLanguage();
  const { ideias, loading, error, createIdeia, updateIdeia, deleteIdeia } =
    useFutureIdeas();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIdeia, setSelectedIdeia] = useState<IdeiaFutura | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ideiaToDelete, setIdeiaToDelete] = useState<string | null>(null);

  const handleOpenModal = (ideia?: IdeiaFutura) => {
    setSelectedIdeia(ideia);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIdeia(undefined);
  };

  const handleSubmit = async (
    data: Omit<IdeiaFutura, "id" | "usuario_id" | "criado_em">
  ) => {
    setIsSubmitting(true);
    try {
      if (selectedIdeia) {
        await updateIdeia(selectedIdeia.id, data);
      } else {
        await createIdeia(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setIdeiaToDelete(id);
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-16">
        <div className="space-y-2">
          <div className="h-8 bg-surface-variant rounded w-48 animate-pulse" />
          <div className="h-5 bg-surface-variant rounded w-96 animate-pulse" />
        </div>
        <div className="h-10 bg-surface-variant rounded w-32 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} variant="card" className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg text-on-surface mb-2 font-playfair">
          {t("ideas.title")}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {t("ideas.subtitle")}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card>
          <p className="text-body-md text-error">{error}</p>
        </Card>
      )}

      <GridContainer className="space-y-6">
        {/* Create Button */}
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-tertiary text-on-tertiary rounded-lg text-label-lg font-medium hover:bg-tertiary-container transition-colors"
        >
          + {t("ideas.newIdea")}
        </button>

        {/* Grid de Ideias */}
        {ideias.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-headline-sm text-on-surface mb-4 font-playfair">
              {t("ideas.noIdeas")}
            </p>
            <p className="text-body-md text-on-surface-variant">
              {t("ideas.noIdeasDesc")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideias.map((ideia) => (
              <IdeiaCard
                key={ideia.id}
                ideia={ideia}
                onEdit={() => handleOpenModal(ideia)}
                onDelete={() => handleDelete(ideia.id)}
              />
            ))}
          </div>
        )}
      </GridContainer>

      {/* Modal */}
      <IdeiaModal
        isOpen={isModalOpen}
        ideia={selectedIdeia}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        loading={isSubmitting}
      />

      <ConfirmModal
        isOpen={!!ideiaToDelete}
        onClose={() => setIdeiaToDelete(null)}
        onConfirm={async () => {
          if (ideiaToDelete) {
            try {
              await deleteIdeia(ideiaToDelete);
            } catch (err) {
              console.error("Erro ao remover ideia:", err);
            }
          }
        }}
        title={t("ideas.deleteConfirm")}
        message={t("ideas.deleteConfirm")}
      />
    </div>
  );
};

