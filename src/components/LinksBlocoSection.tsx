import React, { useState } from "react";
import { Link as LinkIcon, Plus, X } from "lucide-react";
import { useLinksBloco } from "../hooks/useLinksBloco";
import { useLanguage } from "../contexts/LanguageContext";
import { normalizeUrl } from "../utils/url";
import { getErrorMessage } from "../utils/errors";

interface LinksBlocoSectionProps {
  blocoId: string;
}

export const LinksBlocoSection: React.FC<LinksBlocoSectionProps> = ({ blocoId }) => {
  const { t } = useLanguage();
  const { links, addLink, deleteLink } = useLinksBloco(blocoId);
  const [isAdding, setIsAdding] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaUrl, setNovaUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const closeForm = () => {
    setIsAdding(false);
    setNovoTitulo("");
    setNovaUrl("");
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novaUrl.trim()) {
      setError(t("block.linkFieldsRequired"));
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await addLink(novoTitulo.trim(), normalizeUrl(novaUrl));
      closeForm();
    } catch (err) {
      console.error("Erro ao salvar link:", err);
      setError(getErrorMessage(err) || t("block.linkSaveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLink(id);
    } catch (err) {
      console.error("Erro ao remover link:", err);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-surface-container rounded-full text-label-sm text-on-surface hover:bg-surface-container-high transition-colors max-w-full"
            title={link.url}
          >
            <LinkIcon size={14} className="text-primary flex-shrink-0" />
            <span className="truncate">{link.titulo}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete(link.id);
              }}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-error transition-opacity rounded-full p-0.5"
              title={t("common.delete")}
            >
              <X size={12} />
            </button>
          </a>
        ))}

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-outline-variant rounded-full text-label-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
          >
            <Plus size={14} />
            <LinkIcon size={14} />
            {t("block.addLink")}
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSave}
          className="mt-3 p-4 bg-surface-container-low border border-outline-variant rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <input
            type="text"
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            placeholder={t("block.linkTitlePlaceholder")}
            className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            autoFocus
          />
          <input
            type="text"
            value={novaUrl}
            onChange={(e) => setNovaUrl(e.target.value)}
            placeholder={t("block.linkUrlPlaceholder")}
            className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
          />

          {error && (
            <p className="sm:col-span-2 text-body-sm text-error">{error}</p>
          )}

          <div className="sm:col-span-2 flex gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 bg-surface-container text-on-surface rounded-lg text-label-sm hover:bg-surface-container-high transition-colors"
            >
              {t("inbox.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {isSaving ? t("block.saving") : t("common.save")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
