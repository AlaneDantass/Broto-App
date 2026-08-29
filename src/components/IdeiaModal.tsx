import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import type { IdeiaFutura } from "../types/database";
import { useLanguage } from "../contexts/LanguageContext";
import { TextareaComImagens } from "./TextareaComImagens";
import { extractImagesFromText, buildTextWithImages } from "../utils/imagePaste";

interface IdeiaModalProps {
  isOpen: boolean;
  ideia?: IdeiaFutura;
  onClose: () => void;
  onSubmit: (data: Omit<IdeiaFutura, "id" | "usuario_id" | "criado_em">) => Promise<void>;
  loading?: boolean;
}

export const IdeiaModal: React.FC<IdeiaModalProps> = ({
  isOpen,
  ideia,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { t, language } = useLanguage();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [descricaoImagens, setDescricaoImagens] = useState<string[]>([]);
  const [imagemUrl, setImagemUrl] = useState("");
  const [tag, setTag] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ideia) {
      setTitulo(ideia.titulo);
      const { cleanText, images } = extractImagesFromText(ideia.descricao);
      setDescricao(cleanText);
      setDescricaoImagens(images);
      setImagemUrl(ideia.imagem_url || "");
      setTag(ideia.tag || "");
    } else {
      setTitulo("");
      setDescricao("");
      setDescricaoImagens([]);
      setImagemUrl("");
      setTag("");
    }
  }, [ideia, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        titulo: titulo.trim(),
        descricao: buildTextWithImages(descricao, descricaoImagens),
        imagem_url: imagemUrl.trim() || null,
        tag: tag.trim() || null,
      } as any);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ideia ? t("idea.editTitle") : t("idea.createTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-label-md text-on-surface mb-2">
            {t("idea.titleLabel")}
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder={t("idea.titlePlaceholder")}
            className="w-full px-4 py-2 bg-surface border border-outline rounded-lg text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            disabled={submitting}
            autoFocus
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-label-md text-on-surface mb-2">
            {language === "en" ? "Description (optional)" : "Descrição (opcional)"}
          </label>
          <TextareaComImagens
            value={descricao}
            onChange={setDescricao}
            images={descricaoImagens}
            onImagesChange={setDescricaoImagens}
            placeholder={t("idea.descPlaceholder")}
            rows={3}
            className="w-full px-4 py-2 bg-surface border border-outline rounded-lg text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary resize-none"
            disabled={submitting}
          />
        </div>

        {/* URL da Imagem */}
        <div>
          <label className="block text-label-md text-on-surface mb-2">
            {language === "en" ? "Image URL (optional)" : "URL da Imagem (opcional)"}
          </label>
          <input
            type="url"
            value={imagemUrl}
            onChange={(e) => setImagemUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 bg-surface border border-outline rounded-lg text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            disabled={submitting}
          />
        </div>

        {/* Tag */}
        <div>
          <label className="block text-label-md text-on-surface mb-2">
            {language === "en" ? "Tag (optional)" : "Tag (opcional)"}
          </label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder={language === "en" ? "e.g. Someday, Inspiration..." : "ex: Algum dia, Inspiração..."}
            className="w-full px-4 py-2 bg-surface border border-outline rounded-lg text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            disabled={submitting}
          />
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
            className="flex-1 px-4 py-2 bg-tertiary text-on-tertiary rounded-lg text-label-md font-medium hover:bg-tertiary-container transition-colors disabled:opacity-50"
          >
            {submitting ? t("idea.saving") : ideia ? (language === "en" ? "Update" : "Atualizar") : t("inbox.create")}
          </button>
        </div>
      </form>
    </Modal>
  );
};
