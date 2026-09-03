import React, { useState } from "react";
import { Plus, Calendar, Trash2 } from "lucide-react";
import { useDatasImportantes } from "../hooks/useDatasImportantes";
import { Modal } from "./Modal";
import { useLanguage } from "../contexts/LanguageContext";

interface DatasImportantesSectionProps {
  blocoId: string;
}

export const DatasImportantesSection: React.FC<DatasImportantesSectionProps> = ({
  blocoId,
}) => {
  const { t, language } = useLanguage();
  const { datas, addData, deleteData, loading } = useDatasImportantes(blocoId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataVal, setDataVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !dataVal) return;

    setIsSubmitting(true);
    try {
      await addData({
        bloco_id: blocoId,
        titulo,
        descricao,
        data: dataVal,
      });
      setIsModalOpen(false);
      setTitulo("");
      setDescricao("");
      setDataVal("");
    } catch (err) {
      console.error("Erro ao adicionar data:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between border-b border-outline-variant pb-2 mb-4">
        <h2 className="text-headline-sm text-on-surface font-playfair flex items-center gap-2">
          <Calendar size={20} className="text-primary" />
          {t("dates.title")}
        </h2>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-1 hover:bg-surface-container-high rounded transition-colors text-primary"
          title={t("dates.add")}
        >
          <Plus size={20} />
        </button>
      </div>

      {loading ? (
        <div className="h-20 bg-surface-variant rounded animate-pulse" />
      ) : datas.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant italic py-2">
          {t("dates.noDates")}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {datas.map((d) => (
            <div
              key={d.id}
              className={`p-4 bg-surface-container rounded-lg border border-outline-variant relative group ${d.lida ? 'opacity-70' : ''}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-medium text-on-surface truncate">
                    {d.titulo}
                  </p>
                  <p className="text-label-sm text-primary font-medium mt-1">
                    {new Date(d.data + 'T00:00:00').toLocaleDateString(
                      language === "en" ? "en-US" : "pt-BR"
                    )}
                  </p>
                  {d.descricao && (
                    <p className="text-body-sm text-on-surface-variant mt-2 line-clamp-2">
                      {d.descricao}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteData(d.id)}
                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-container-high rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={t("dates.add")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md text-on-surface font-medium mb-1">
              {t("dates.titleLabel")}
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-md text-on-surface focus:outline-none focus:border-primary transition-colors"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-label-md text-on-surface font-medium mb-1">
              {t("dates.dateLabel")}
            </label>
            <input
              type="date"
              value={dataVal}
              onChange={(e) => setDataVal(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-md text-on-surface focus:outline-none focus:border-primary transition-colors"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-label-md text-on-surface font-medium mb-1">
              {t("dates.descLabel")}
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-md text-on-surface focus:outline-none focus:border-primary transition-colors resize-none h-24"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-surface-container text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
            >
              {language === "en" ? "Cancel" : "Cancelar"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !titulo || !dataVal}
              className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "..." : t("dates.add")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
