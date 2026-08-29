import React, { useState } from "react";
import { Lightbulb, CheckCircle, FileText } from "lucide-react";
import { Modal } from "./Modal";
import { useLanguage } from "../contexts/LanguageContext";
import { TextareaComImagens } from "./TextareaComImagens";
import { buildTextWithImages } from "../utils/imagePaste";

interface CaptureThoughtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titulo: string;
    detalhes?: string;
    categoria: "ideia" | "tarefa" | "nota";
  }) => Promise<void>;
  loading?: boolean;
}

export const CaptureThoughtModal: React.FC<CaptureThoughtModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { t, language } = useLanguage();
  const [titulo, setTitulo] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [detalhesImagens, setDetalhesImagens] = useState<string[]>([]);
  const [categoria, setCategoria] = useState<"ideia" | "tarefa" | "nota">("ideia");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setSubmitting(true);
    try {
      const detalhesFinal = buildTextWithImages(detalhes, detalhesImagens);
      await onSubmit({
        titulo: titulo.trim(),
        detalhes: detalhesFinal || undefined,
        categoria,
      });
      setTitulo("");
      setDetalhes("");
      setDetalhesImagens([]);
      setCategoria("ideia");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("thought.capture")}
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pensamento rápido */}
          <div>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={t("thought.placeholder")}
              className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
              disabled={submitting}
              autoFocus
            />
          </div>

          {/* Detalhes opcionais */}
          <div>
            <TextareaComImagens
              value={detalhes}
              onChange={setDetalhes}
              images={detalhesImagens}
              onImagesChange={setDetalhesImagens}
              placeholder={t("thought.detailsPlaceholder")}
              rows={2}
              className="w-full px-4 py-2 bg-surface border border-outline rounded-lg text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary resize-none"
              disabled={submitting}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-label-md text-on-surface mb-2">
              {t("thought.category")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "ideia" as const, icon: Lightbulb, label: t("thought.catIdea") },
                { value: "tarefa" as const, icon: CheckCircle, label: t("thought.catTask") },
                { value: "nota" as const, icon: FileText, label: t("thought.catNote") },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCategoria(option.value)}
                    disabled={submitting}
                    className={`px-3 py-2 rounded-lg text-label-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                      categoria === option.value
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <Icon size={16} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-label-md font-medium transition-colors disabled:opacity-50"
            >
              {t("inbox.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting || !titulo.trim() || loading}
              className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {submitting ? t("thought.saving") : t("thought.save")}
            </button>
          </div>
        </form>

        <p className="text-body-sm text-on-surface-variant text-center mt-4">
          {language === "en" ? "You will review and organize later." : "Você vai revisar e organizar depois."}
        </p>
      </div>
    </Modal>
  );
};
