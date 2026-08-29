import React, { useEffect, useState } from "react";
import type { Bloco } from "../types/database";
import { Modal } from "./Modal";
import { useLanguage } from "../contexts/LanguageContext";
import { ColorWheelPicker } from "./ColorWheelPicker";
import { TextareaComImagens } from "./TextareaComImagens";
import { extractImagesFromText, buildTextWithImages } from "../utils/imagePaste";

interface BlocoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bloco: Omit<Bloco, "id" | "usuario_id" | "criado_em" | "atualizado_em">) => Promise<void>;
  initialBloco?: Partial<Bloco>;
  loading?: boolean;
}

const CATEGORIES = ["Learning", "Career", "Personal", "Leisure"];

export const BlocoModal: React.FC<BlocoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialBloco,
  loading = false,
}) => {
  const { t } = useLanguage();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [descricaoImagens, setDescricaoImagens] = useState<string[]>([]);
  const [categoria, setCategoria] = useState<string>("Learning");
  const [barColor, setBarColor] = useState<string>("#D8ABDC");
  const [metaLabel, setMetaLabel] = useState("");
  const [metaTotal, setMetaTotal] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialBloco) {
      setNome(initialBloco.nome || "");
      const { cleanText, images } = extractImagesFromText(initialBloco.descricao);
      setDescricao(cleanText);
      setDescricaoImagens(images);
      setCategoria(initialBloco.categoria || "Learning");
      setBarColor((initialBloco.icone as string) || "#D8ABDC");
      setMetaLabel(initialBloco.meta_label || "");
      setMetaTotal(initialBloco.meta_total?.toString() || "");
    } else {
      resetForm();
    }
  }, [initialBloco, isOpen]);

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setDescricaoImagens([]);
    setCategoria("Learning");
    setBarColor("#D8ABDC");
    setMetaLabel("");
    setMetaTotal("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nome.trim()) {
      setError("Nome do bloco é obrigatório");
      return;
    }

    try {
      await onSubmit({
        nome: nome.trim(),
        descricao: buildTextWithImages(descricao, descricaoImagens),
        categoria,
        icone: barColor,
        meta_label: metaLabel.trim() || "",
        meta_total: metaTotal ? parseInt(metaTotal) : 0,
        meta_atual: initialBloco?.meta_atual || 0,
        ativo: initialBloco ? initialBloco.ativo : true,
        ordem: initialBloco?.ordem || 0,
      } as any);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.savingBloco"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md">
        <h2 className="text-headline-md font-playfair text-on-surface mb-6">
          {initialBloco?.id ? t("block.editTitle") : t("block.createTitle")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Color wheel picker */}
          <ColorWheelPicker
            selectedColor={barColor}
            onColorChange={setBarColor}
            label={t("block.icon")}
          />

          {/* Nome */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">
              {t("block.name")}
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder-on-surface-variant focus:border-primary transition-colors"
              placeholder={t("block.namePlaceholder")}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">
              {t("block.desc")}
            </label>
            <TextareaComImagens
              value={descricao}
              onChange={setDescricao}
              images={descricaoImagens}
              onImagesChange={setDescricaoImagens}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder-on-surface-variant focus:border-primary transition-colors resize-none h-20"
              placeholder={t("block.descPlaceholder")}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">
              {t("block.category")}
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:border-primary transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`block.cat${cat}`) || cat}
                </option>
              ))}
            </select>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">
                {t("block.metaLabel")}
              </label>
              <input
                type="text"
                value={metaLabel}
                onChange={(e) => setMetaLabel(e.target.value)}
                className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder-on-surface-variant focus:border-primary transition-colors"
                placeholder={t("block.metaLabelPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">
                {t("block.metaTotal")}
              </label>
              <input
                type="number"
                value={metaTotal}
                onChange={(e) => setMetaTotal(e.target.value)}
                className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder-on-surface-variant focus:border-primary transition-colors"
                placeholder="0"
                min="0"
              />
            </div>
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
              {t("inbox.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors font-medium disabled:opacity-50"
            >
              {loading ? t("block.saving") : t("block.save")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
