import React, { useState, useMemo } from "react";
import { Modal } from "./Modal";
import { useLanguage } from "../contexts/LanguageContext";
import { getPriorityColor, getPriorityLabel } from "../utils/taskOrder";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import type { Bloco, BlocoDoDia } from "../types/database";

interface DayPlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocos: Bloco[];
  existingBlocoIds: string[];
  onConfirm: (
    selections: { blocoId: string; prioridade: BlocoDoDia["prioridade"] }[]
  ) => void;
}

type PrioridadeOption = "urgente" | "bloqueadora" | "importante" | null;

const PRIORITY_OPTIONS: PrioridadeOption[] = [
  "urgente",
  "bloqueadora",
  "importante",
  null,
];

export const DayPlanSelectionModal: React.FC<DayPlanSelectionModalProps> = ({
  isOpen,
  onClose,
  blocos,
  existingBlocoIds,
  onConfirm,
}) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<"select" | "classify">("select");
  const [selectedBlocoIds, setSelectedBlocoIds] = useState<Set<string>>(
    new Set()
  );
  const [priorities, setPriorities] = useState<
    Record<string, PrioridadeOption>
  >({});

  // Filter out blocks already in today's plan
  const availableBlocos = useMemo(
    () => blocos.filter((b) => !existingBlocoIds.includes(b.id)),
    [blocos, existingBlocoIds]
  );

  const handleToggleBloco = (blocoId: string) => {
    setSelectedBlocoIds((prev) => {
      const next = new Set(prev);
      if (next.has(blocoId)) {
        next.delete(blocoId);
      } else {
        next.add(blocoId);
      }
      return next;
    });
  };

  const handleSetPriority = (blocoId: string, priority: PrioridadeOption) => {
    setPriorities((prev) => ({ ...prev, [blocoId]: priority }));
  };

  const handleConfirm = () => {
    const selections = Array.from(selectedBlocoIds).map((blocoId) => ({
      blocoId,
      prioridade: priorities[blocoId] ?? null,
    }));
    onConfirm(selections);
    // Reset state
    setStep("select");
    setSelectedBlocoIds(new Set());
    setPriorities({});
    onClose();
  };

  const handleClose = () => {
    setStep("select");
    setSelectedBlocoIds(new Set());
    setPriorities({});
    onClose();
  };

  const selectedBlocos = useMemo(
    () => blocos.filter((b) => selectedBlocoIds.has(b.id)),
    [blocos, selectedBlocoIds]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === "select"
          ? t("dashboard.selectBlocksTitle")
          : t("dashboard.classifyBlocks")
      }
    >
      <div className="space-y-4">
        {step === "select" ? (
          <>
            {/* Step 1: Select blocks */}
            <p className="text-body-sm text-on-surface-variant">
              {t("dashboard.selectStep")}
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {availableBlocos.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant italic py-4 text-center">
                  {language === "en"
                    ? "All blocks are already in today's plan."
                    : "Todos os blocos já estão no plano de hoje."}
                </p>
              ) : (
                availableBlocos.map((bloco) => {
                  const isSelected = selectedBlocoIds.has(bloco.id);
                  return (
                    <button
                      key={bloco.id}
                      type="button"
                      onClick={() => handleToggleBloco(bloco.id)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-colors flex items-center gap-3 ${
                        isSelected
                          ? "border-primary bg-primary-container text-on-primary-container"
                          : "border-outline-variant bg-surface text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-[#A5A58D]"
                        }`}
                      >
                        {isSelected && (
                          <Check size={12} className="text-on-primary" />
                        )}
                      </div>

                      {/* Block color */}
                      <div
                        className="w-3 h-6 rounded-sm flex-shrink-0"
                        style={{
                          backgroundColor:
                            (bloco.icone as string) || "#D8ABDC",
                        }}
                      />

                      {/* Block info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {bloco.nome}
                        </p>
                        {bloco.descricao && (
                          <p className="text-label-xs mt-0.5 opacity-70 truncate">
                            {bloco.descricao}
                          </p>
                        )}
                      </div>

                      {/* Category badge */}
                      {bloco.categoria && (
                        <span className="text-label-xs px-1.5 py-0.5 rounded bg-surface-container-high flex-shrink-0">
                          {bloco.categoria}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-surface-container text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
              >
                {language === "en" ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => setStep("classify")}
                disabled={selectedBlocoIds.size === 0}
                className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {t("dashboard.next")}
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: Classify blocks */}
            <p className="text-body-sm text-on-surface-variant">
              {t("dashboard.classifyStep")}
            </p>

            <div className="space-y-4 max-h-72 overflow-y-auto">
              {selectedBlocos.map((bloco) => {
                const currentPriority = priorities[bloco.id] ?? null;
                return (
                  <div
                    key={bloco.id}
                    className="p-3 bg-surface rounded-lg border border-outline-variant space-y-2"
                  >
                    {/* Block header */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-5 rounded-sm flex-shrink-0"
                        style={{
                          backgroundColor:
                            (bloco.icone as string) || "#D8ABDC",
                        }}
                      />
                      <p className="text-body-sm text-on-surface font-medium truncate">
                        {bloco.nome}
                      </p>
                    </div>

                    {/* Priority options */}
                    <div className="flex flex-wrap gap-2">
                      {PRIORITY_OPTIONS.map((priority) => {
                        const colors = getPriorityColor(priority);
                        const label = getPriorityLabel(priority, language);
                        const isActive = currentPriority === priority;

                        return (
                          <button
                            key={priority || "none"}
                            type="button"
                            onClick={() =>
                              handleSetPriority(bloco.id, priority)
                            }
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              isActive
                                ? "ring-2 ring-offset-1 ring-primary scale-105"
                                : "opacity-70 hover:opacity-100"
                            }`}
                            style={
                              priority
                                ? {
                                    backgroundColor: colors.bg,
                                    color: colors.text,
                                  }
                                : {
                                    backgroundColor: isActive
                                      ? "#e5e4cb"
                                      : "#f1efd6",
                                    color: "#434842",
                                  }
                            }
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="flex-1 px-4 py-2 bg-surface-container text-on-surface rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} />
                {t("dashboard.back")}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
              >
                <Check size={16} />
                {t("dashboard.confirm")}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
