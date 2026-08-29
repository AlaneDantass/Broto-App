import React, { useState } from "react";
import { useDesvios } from "../hooks/useDesvios";
import { DesvioCard, Card, SkeletonLoader, GridContainer } from "../components";
import { useLanguage } from "../contexts/LanguageContext";

export const DesviosPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { desvios, loading, error, toggleDesvio, updateDesvio, deleteDesvio } =
    useDesvios();
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const filteredDesvios = desvios.filter((d) => {
    if (!showCompleted && d.concluido) return false;
    if (filterTag && d.tag !== filterTag) return false;
    return true;
  });

  // Group by origem_task_id
  const grouped = filteredDesvios.reduce(
    (acc, desvio) => {
      const key = desvio.origem_task_id || "sem-origem";
      if (!acc[key]) acc[key] = [];
      acc[key].push(desvio);
      return acc;
    },
    {} as Record<string, typeof desvios>
  );

  // Get unique tags
  const tags = Array.from(new Set(desvios.map((d) => d.tag).filter(Boolean)));

  if (loading) {
    return (
      <div className="space-y-8 pb-16">
        <div className="space-y-2">
          <div className="h-8 bg-surface-variant rounded w-48 animate-pulse" />
          <div className="h-5 bg-surface-variant rounded w-96 animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonLoader key={i} variant="task" />
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
          {t("deviations.title")}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {t("deviations.subtitle")}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card>
          <p className="text-body-md text-error">{error}</p>
        </Card>
      )}

      <GridContainer className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Show completed toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-body-sm text-on-surface">
              {language === "en" ? "Show resolved" : "Mostrar resolvidos"}
            </span>
          </label>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag || ""}
                onClick={() => setFilterTag(filterTag === tag ? null : tag || null)}
                className={`px-3 py-1 rounded-full text-label-sm transition-colors ${
                  filterTag === tag
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-variant hover:bg-surface-variant-high text-on-surface-variant"
                }`}
              >
                {tag || (language === "en" ? "No tag" : "Sem tag")}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {desvios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-headline-sm text-on-surface mb-4 font-playfair">
              {t("deviations.noDeviations")}
            </p>
            <p className="text-body-md text-on-surface-variant">
              {t("deviations.emptyMessage")}
            </p>
          </div>
        ) : filteredDesvios.length === 0 ? (
          <p className="text-body-md text-on-surface-variant text-center py-8">
            {t("deviations.noFiltered")}
          </p>
        ) : (
          <div className="space-y-8">
          {Object.entries(grouped).map(([origem, desvios_group]) => (
            <div key={origem}>
              <h2 className="text-headline-sm text-on-surface mb-4 font-playfair">
                {origem === "sem-origem" ? (language === "en" ? "No Origin" : "Sem Origem") : `${t("deviations.origin")} ${origem}`}
              </h2>
              <div className="space-y-3">
                {desvios_group.map((desvio) => (
                  <DesvioCard
                    key={desvio.id}
                    desvio={desvio}
                    onToggle={() => toggleDesvio(desvio.id)}
                    onDelete={() => deleteDesvio(desvio.id)}
                    onTag={(tag) =>
                      updateDesvio(desvio.id, { tag })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
          </div>
        )}
      </GridContainer>

      {/* Stats */}
      {desvios.length > 0 && (
        <Card>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-headline-md text-primary font-bold">
                {desvios.filter((d) => !d.concluido).length}
              </p>
              <p className="text-label-sm text-on-surface-variant">{t("block.pending")}</p>
            </div>
            <div>
              <p className="text-headline-md text-secondary font-bold">
                {desvios.filter((d) => d.concluido).length}
              </p>
              <p className="text-label-sm text-on-surface-variant">{language === "en" ? "Resolved" : "Resolvidos"}</p>
            </div>
            <div>
              <p className="text-headline-md text-tertiary font-bold">
                {tags.length}
              </p>
              <p className="text-label-sm text-on-surface-variant">{language === "en" ? "Tags" : "Categorias"}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

