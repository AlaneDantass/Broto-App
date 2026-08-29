import React, { useState } from "react";
import { BrainCircuit } from "lucide-react";
import type { Task } from "../types/database";
import { Modal } from "./Modal";
import { useLanguage } from "../contexts/LanguageContext";
import { TextareaComImagens } from "./TextareaComImagens";
import { buildTextWithImages } from "../utils/imagePaste";

interface CaptureDesvioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (texto: string, originTaskId?: string) => Promise<void>;
  focusTask?: Task;
  loading?: boolean;
}

export const CaptureDesvioModal: React.FC<CaptureDesvioModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  focusTask,
  loading = false,
}) => {
  const { t } = useLanguage();
  const [texto, setTexto] = useState("");
  const [textoImagens, setTextoImagens] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!texto.trim() && textoImagens.length === 0) {
      setError(t("deviation.errorEmpty"));
      return;
    }

    try {
      await onSubmit(buildTextWithImages(texto, textoImagens), focusTask?.id);
      setTexto("");
      setTextoImagens([]);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("deviation.errorCapture")
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md">
        <h2 className="text-headline-md font-playfair text-on-surface mb-2">
          <span className="flex items-center gap-2">
            <BrainCircuit size={24} className="text-primary" />
            {t("deviation.captured")}
          </span>
        </h2>
        <p className="text-body-sm text-on-surface-variant mb-6">
          {t("deviation.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task origem (se houver) */}
          {focusTask && (
            <div className="p-3 bg-surface-container-high rounded-lg border border-outline-variant">
              <p className="text-label-sm text-on-surface-variant">{t("deviations.origin")}</p>
              <p className="text-body-sm text-on-surface font-medium">
                {focusTask.titulo}
              </p>
            </div>
          )}

          {/* Texto */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">
              {t("deviation.placeholder")}
            </label>
            <TextareaComImagens
              value={texto}
              onChange={setTexto}
              images={textoImagens}
              onImagesChange={setTextoImagens}
              autoFocus
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder-on-surface-variant focus:border-primary transition-colors resize-none h-20"
              placeholder={t("deviation.placeholderText")}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-error-container border border-error rounded-lg">
              <p className="text-body-sm text-on-error-container">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surface-container text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
            >
              {t("deviation.back")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors font-medium disabled:opacity-50"
            >
              {loading ? t("deviation.saving") : t("deviation.save")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
