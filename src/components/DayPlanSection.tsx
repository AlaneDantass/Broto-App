import React, { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Card } from "./Card";
import { DayPlanBlocoCard } from "./DayPlanBlocoCard";
import { DayPlanSelectionModal } from "./DayPlanSelectionModal";
import { getPriorityColor, getPriorityLabel } from "../utils/taskOrder";
import { useLanguage } from "../contexts/LanguageContext";
import type { Bloco, BlocoDoDia } from "../types/database";

interface DayPlanSectionProps {
  blocos: Bloco[];
  blocosDoDia: BlocoDoDia[];
  onAddBlocos: (
    selections: { blocoId: string; prioridade: BlocoDoDia["prioridade"] }[]
  ) => Promise<void>;
  onRemoveBloco: (id: string) => Promise<void>;
  onReorder: (items: { id: string; ordem: number }[]) => Promise<void>;
  onNavigateToBloco?: (blocoId: string) => void;
}

type PrioridadeKey = "urgente" | "bloqueadora" | "importante" | "none";

const PRIORITY_ORDER: PrioridadeKey[] = [
  "urgente",
  "bloqueadora",
  "importante",
  "none",
];

export const DayPlanSection: React.FC<DayPlanSectionProps> = ({
  blocos,
  blocosDoDia,
  onAddBlocos,
  onRemoveBloco,
  onReorder,
  onNavigateToBloco,
}) => {
  const { t, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group blocos do dia by priority
  const groupedBlocos = useMemo(() => {
    const groups: Record<PrioridadeKey, BlocoDoDia[]> = {
      urgente: [],
      bloqueadora: [],
      importante: [],
      none: [],
    };

    blocosDoDia.forEach((b) => {
      const key = (b.prioridade || "none") as PrioridadeKey;
      groups[key].push(b);
    });

    // Sort each group by ordem
    for (const key of PRIORITY_ORDER) {
      groups[key].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    }

    return groups;
  }, [blocosDoDia]);

  // Get bloco details by id
  const getBlocoById = useCallback(
    (blocoId: string) => blocos.find((b) => b.id === blocoId),
    [blocos]
  );

  // Existing bloco ids for filtering in the modal
  const existingBlocoIds = useMemo(
    () => blocosDoDia.map((b) => b.bloco_id),
    [blocosDoDia]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      // Find the item being dragged and the target
      const activeItem = blocosDoDia.find((b) => b.id === active.id);
      const overItem = blocosDoDia.find((b) => b.id === over.id);

      if (!activeItem || !overItem) return;

      // Only allow reorder within same priority
      if (activeItem.prioridade !== overItem.prioridade) return;

      const priorityKey = (activeItem.prioridade || "none") as PrioridadeKey;
      const group = [...groupedBlocos[priorityKey]];

      const oldIndex = group.findIndex((b) => b.id === active.id);
      const newIndex = group.findIndex((b) => b.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Reorder
      const [moved] = group.splice(oldIndex, 1);
      group.splice(newIndex, 0, moved);

      // Update orders
      const reorderedItems = group.map((item, index) => ({
        id: item.id,
        ordem: index,
      }));

      onReorder(reorderedItems);
    },
    [blocosDoDia, groupedBlocos, onReorder]
  );

  const handleConfirmSelection = async (
    selections: { blocoId: string; prioridade: BlocoDoDia["prioridade"] }[]
  ) => {
    await onAddBlocos(selections);
  };

  const hasAnyBlocos = blocosDoDia.length > 0;

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-2">
          <h2 className="text-headline-sm text-on-surface font-playfair">
            {t("dashboard.dayPlan")}
          </h2>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="p-1 hover:bg-surface-container-high rounded transition-colors text-primary"
            title={t("dashboard.addBlocks")}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Content */}
        {!hasAnyBlocos ? (
          <div className="text-center py-6">
            <p className="text-body-sm text-on-surface-variant mb-3">
              {t("dashboard.noDayPlan")}
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-sm font-medium hover:bg-primary-container transition-colors"
            >
              {t("dashboard.selectBlocks")}
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-4">
              {PRIORITY_ORDER.map((priorityKey) => {
                const group = groupedBlocos[priorityKey];
                if (group.length === 0) return null;

                const prioridadeValue =
                  priorityKey === "none" ? null : priorityKey;
                const colors = getPriorityColor(prioridadeValue);
                const label = getPriorityLabel(prioridadeValue, language);

                return (
                  <div key={priorityKey}>
                    {/* Priority group header */}
                    <div
                      className="px-2 py-1.5 rounded-md mb-2 flex items-center gap-2"
                      style={{
                        backgroundColor: colors.bg,
                        borderLeft: prioridadeValue
                          ? `3px solid ${colors.border}`
                          : "3px solid transparent",
                      }}
                    >
                      <span
                        className="text-label-sm font-medium"
                        style={{ color: colors.text }}
                      >
                        {label} ({group.length})
                      </span>
                    </div>

                    {/* Sortable list within this priority group */}
                    <SortableContext
                      items={group.map((b) => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 ml-1">
                        {group.map((blocoDoDia) => (
                          <DayPlanBlocoCard
                            key={blocoDoDia.id}
                            blocoDoDia={blocoDoDia}
                            bloco={getBlocoById(blocoDoDia.bloco_id)}
                            onRemove={onRemoveBloco}
                            onClick={onNavigateToBloco}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </div>
                );
              })}
            </div>
          </DndContext>
        )}
      </div>

      {/* Selection Modal */}
      <DayPlanSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        blocos={blocos}
        existingBlocoIds={existingBlocoIds}
        onConfirm={handleConfirmSelection}
      />
    </Card>
  );
};
