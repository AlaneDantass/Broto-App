import React, { useState } from "react";
import { usePensamentos } from "../hooks/usePensamentos";
import { useBlocos } from "../hooks/useBlocos";
import { useTasks } from "../hooks/useTasks";
import { Trash2, Plus, Archive } from "lucide-react";
import { Card, Modal, ConfirmModal, SkeletonLoader, DescricaoTexto } from "../components";
import { useLanguage } from "../contexts/LanguageContext";

export const TriagemPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { pensamentos, loading, error, triagePensamento, deletePensamento } =
    usePensamentos();
  const { blocos } = useBlocos();
  const { createTask } = useTasks();
  const [selectedBlocoId, setSelectedBlocoId] = useState<string>("");
  const [pensamentoToDelete, setPensamentoToDelete] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTaskFromPensamento = async (pensamentoId: string) => {
    if (!selectedBlocoId) {
      alert(language === "en" ? "Select a block to create the task" : "Selecione um bloco para criar a tarefa");
      return;
    }

    setIsSubmitting(true);
    try {
      const pensamento = pensamentos.find((p) => p.id === pensamentoId);
      if (!pensamento) return;

      await createTask({
        bloco_id: selectedBlocoId,
        titulo: pensamento.titulo,
        descricao: pensamento.detalhes || "",
        status: "pendente",
        is_programming: false,
        tempo_gasto_minutos: 0,
        foco_atual: false,
      } as any);

      await triagePensamento(pensamentoId, { triado: true });
      setIsCreatingTask(null);
      setSelectedBlocoId("");
    } catch (err) {
      console.error("Erro ao criar task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await triagePensamento(id, { triado: true });
    } catch (err) {
      console.error("Erro ao arquivar pensamento:", err);
    }
  };

  const handleDelete = (id: string) => {
    setPensamentoToDelete(id);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString(language === "en" ? "en-US" : "pt-BR", { hour: "2-digit", minute: "2-digit" });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return language === "en" ? "Yesterday" : "Ontem";
    } else {
      return date.toLocaleDateString(language === "en" ? "en-US" : "pt-BR");
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg text-on-surface font-playfair">
          {t("inbox.title")}
        </h1>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} variant="task" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <Card>
          <p className="text-body-md text-error">{error}</p>
        </Card>
      )}

      <div>
        {/* Empty State */}
        {pensamentos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-headline-sm text-on-surface mb-2 font-playfair">
              {t("inbox.noThoughts")}
            </p>
            <p className="text-body-md text-on-surface-variant">
              {t("inbox.thoughtsDesc")}
            </p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-4">
            {[...pensamentos]
              .sort(
                (a, b) =>
                  new Date(b.criado_em).getTime() -
                  new Date(a.criado_em).getTime()
              )
              .map((pensamento) => (
              <div
                key={pensamento.id}
                className="bg-surface-container rounded-lg p-4 space-y-3 border-l-4 border-l-primary border-t border-r border-b border-outline-variant shadow-sm break-inside-avoid mb-4"
              >
                {/* Header com título e data */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-body-md font-medium text-on-surface">
                      {pensamento.titulo}
                    </h3>
                    <p className="text-label-xs text-on-surface-variant mt-1">
                      {formatDate(pensamento.criado_em)}
                    </p>
                  </div>
                </div>

                {/* Detalhes se houver */}
                {pensamento.detalhes && (
                  <DescricaoTexto
                    texto={pensamento.detalhes}
                    className="text-body-sm text-on-surface-variant bg-surface p-3 rounded"
                  />
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsCreatingTask(pensamento.id)}
                    className="flex-1 px-3 py-2 flex items-center justify-center gap-2 bg-primary text-on-primary rounded text-label-sm font-medium hover:bg-primary-container transition-colors"
                  >
                    <Plus size={16} />
                    {t("inbox.triageAsTask")}
                  </button>
                  <button
                    onClick={() => handleArchive(pensamento.id)}
                    className="px-3 py-2 text-[#A5A58D] hover:text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors"
                    title={language === "en" ? "Archive" : "Arquivar"}
                  >
                    <Archive size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(pensamento.id)}
                    className="px-3 py-2 text-[#A5A58D] hover:text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors"
                    title={t("inbox.discard")}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Modal para escolher bloco */}
                {isCreatingTask === pensamento.id && (
                  <Modal
                    isOpen={isCreatingTask === pensamento.id}
                    onClose={() => setIsCreatingTask(null)}
                    title={t("inbox.triageAsTask")}
                  >
                    <div className="space-y-4">
                      <p className="text-body-sm text-on-surface-variant">
                        {t("inbox.selectBlock")}
                      </p>

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {blocos.map((bloco) => (
                          <button
                            key={bloco.id}
                            onClick={() => setSelectedBlocoId(bloco.id)}
                            className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                              selectedBlocoId === bloco.id
                                ? "border-primary bg-primary-container text-on-primary-container"
                                : "border-outline-variant bg-surface text-on-surface hover:bg-surface-container"
                            }`}
                          >
                            <p className="font-medium">{bloco.nome}</p>
                            <p className="text-label-xs mt-1">
                              {bloco.descricao}
                            </p>
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setIsCreatingTask(null)}
                          className="flex-1 px-4 py-2 bg-surface-container text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
                        >
                          {t("inbox.cancel")}
                        </button>
                        <button
                          onClick={() =>
                            handleCreateTaskFromPensamento(pensamento.id)
                          }
                          disabled={!selectedBlocoId || isSubmitting}
                          className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? t("inbox.creating") : t("inbox.create")}
                        </button>
                      </div>
                    </div>
                  </Modal>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!pensamentoToDelete}
        onClose={() => setPensamentoToDelete(null)}
        onConfirm={async () => {
          if (pensamentoToDelete) {
            try {
              await deletePensamento(pensamentoToDelete);
            } catch (err) {
              console.error("Erro ao remover pensamento:", err);
            }
          }
        }}
        title={language === "en" ? "Delete Thought" : "Remover Pensamento"}
        message={language === "en" ? "Are you sure you want to delete this permanently?" : "Deseja remover permanentemente este pensamento?"}
      />
    </div>
  );
};

