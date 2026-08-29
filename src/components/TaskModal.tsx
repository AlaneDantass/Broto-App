import React, { useEffect, useState } from "react";
import { Code, Info, Plus, Minus } from "lucide-react";
import type { Task } from "../types/database";
import { Modal } from "./Modal";
import { useLanguage } from "../contexts/LanguageContext";
import { TextareaComImagens } from "./TextareaComImagens";
import { extractImagesFromText, buildTextWithImages } from "../utils/imagePaste";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, "id" | "usuario_id" | "criado_em" | "atualizado_em">) => Promise<void>;
  initialTask?: Partial<Task>;
  blocoId: string;
  loading?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  blocoId,
  loading = false,
}) => {
  const { t, language } = useLanguage();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [descricaoImagens, setDescricaoImagens] = useState<string[]>([]);
  const [isProgramming, setIsProgramming] = useState(false);
  const [tempoEstimado, setTempoEstimado] = useState("");
  const [prioridade, setPrioridade] = useState<"urgente" | "bloqueadora" | "importante" | null>(null);
  const [pomodorosEstimados, setPomodorosEstimados] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialTask) {
      setTitulo(initialTask.titulo || "");
      const { cleanText, images } = extractImagesFromText(initialTask.descricao);
      setDescricao(cleanText);
      setDescricaoImagens(images);
      setIsProgramming(initialTask.is_programming || false);
      setTempoEstimado(initialTask.tempo_estimado_minutos?.toString() || "");
      setPrioridade(initialTask.prioridade || null);
      setPomodorosEstimados(initialTask.pomodoros_estimados || null);
    } else {
      resetForm();
    }
  }, [initialTask, isOpen]);

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setDescricaoImagens([]);
    setIsProgramming(false);
    setTempoEstimado("");
    setPrioridade(null);
    setPomodorosEstimados(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!titulo.trim()) {
      setError(t("task.titleRequired"));
      return;
    }

    try {
      await onSubmit({
        bloco_id: blocoId,
        titulo: titulo.trim(),
        descricao: buildTextWithImages(descricao, descricaoImagens),
        is_programming: isProgramming,
        tempo_estimado_minutos: tempoEstimado ? parseInt(tempoEstimado) : undefined,
        prioridade: prioridade,
        pomodoros_estimados: pomodorosEstimados,
        status: initialTask?.status || "pendente",
        tempo_gasto_minutos: initialTask?.tempo_gasto_minutos || 0,
        foco_atual: initialTask?.foco_atual || false,
        ordem: initialTask?.ordem || 0,
        pomodoros_concluidos: initialTask?.pomodoros_concluidos || 0,
      } as any);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.savingTask"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md">
        <h2 className="text-headline-md font-playfair text-on-surface mb-6">
          {initialTask?.id ? t("task.edit") : t("task.create")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titulo */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">
              {t("task.title")}
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder-on-surface-variant focus:border-primary transition-colors"
              placeholder={language === "en" ? "E.g. Write chapter 3" : "Ex: Escrever capítulo 3"}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">
              {t("task.description")}
            </label>
            <TextareaComImagens
              value={descricao}
              onChange={setDescricao}
              images={descricaoImagens}
              onImagesChange={setDescricaoImagens}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder-on-surface-variant focus:border-primary transition-colors resize-none h-20"
              placeholder={language === "en" ? "Optional details..." : "Detalhes opcionais..."}
            />
          </div>

          {/* Tempo estimado */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">
              {t("task.estimatedTime")}
            </label>
            <input
              type="number"
              value={tempoEstimado}
              onChange={(e) => setTempoEstimado(e.target.value)}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder-on-surface-variant focus:border-primary transition-colors"
              placeholder="30"
              min="1"
            />
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">
              {language === "en" ? "Priority" : "Prioridade"}
            </label>
            <select
              value={prioridade || ""}
              onChange={(e) => setPrioridade((e.target.value as any) || null)}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:border-primary transition-colors"
            >
              <option value="">
                {language === "en" ? "No priority" : "Sem prioridade"}
              </option>
              <option value="urgente">
                {language === "en" ? "Urgent" : "Urgente"}
              </option>
              <option value="bloqueadora">
                {language === "en" ? "Blocking" : "Bloqueadora"}
              </option>
              <option value="importante">
                {language === "en" ? "Important" : "Importante"}
              </option>
            </select>
          </div>

          {/* Pomodoros estimados */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">
              🍅 {language === "en" ? "Estimated Pomodoros" : "Pomodoros Estimados"}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPomodorosEstimados(pomodorosEstimados ? Math.max(0, pomodorosEstimados - 1) : null)}
                className="p-2 hover:bg-surface-container-high rounded transition-colors"
              >
                <Minus size={18} className="text-on-surface-variant" />
              </button>
              <span className="px-3 py-2 bg-surface-container-low rounded border border-outline-variant text-on-surface text-center min-w-12">
                {pomodorosEstimados || "—"}
              </span>
              <button
                type="button"
                onClick={() => setPomodorosEstimados((pomodorosEstimados || 0) + 1)}
                className="p-2 hover:bg-surface-container-high rounded transition-colors"
              >
                <Plus size={18} className="text-on-surface-variant" />
              </button>
              <span className="text-label-sm text-on-surface-variant ml-2">
                {language === "en" ? "sessions" : "sessões"}
              </span>
            </div>
          </div>

          {/* Programming flag */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is-programming"
              checked={isProgramming}
              onChange={(e) => setIsProgramming(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="is-programming"
              className="text-body-md text-on-surface cursor-pointer flex items-center gap-2"
            >
              <Code size={18} className="text-primary flex-shrink-0" />
              {t("task.isProgramming")}
            </label>
          </div>

          {/* Checklist Info */}
          {initialTask?.id && (
            <div className="p-3 bg-primary-container border border-primary rounded-lg flex items-start gap-2">
              <Info size={16} className="text-on-primary-container mt-0.5 flex-shrink-0" />
              <p className="text-body-sm text-on-primary-container">
                {t("task.tip")}
              </p>
            </div>
          )}

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
              {loading ? t("task.saving") : t("task.save")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
