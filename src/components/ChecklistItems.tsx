import React, { useState } from "react";
import { Trash2, Check, X } from "lucide-react";
import { useChecklistItems } from "../hooks/useChecklistItems";
import { useLanguage } from "../contexts/LanguageContext";

interface ChecklistItemsProps {
  taskId: string;
  showAddForm?: boolean;
}

export const ChecklistItems: React.FC<ChecklistItemsProps> = ({
  taskId,
  showAddForm = true,
}) => {
  const { t, language } = useLanguage();
  const { items, addItem, toggleItem, deleteItem, getProgress } =
    useChecklistItems(taskId);
  const [newItemText, setNewItemText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    try {
      await addItem(newItemText);
      setNewItemText("");
      setIsAdding(false);
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleItem(id);
    } catch (err) {
      console.error("Erro ao toggle item:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error("Erro ao deletar item:", err);
    }
  };

  if (items.length === 0 && !showAddForm) {
    return null;
  }

  const progress = getProgress();
  const completed = items.filter(i => i.concluido).length;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      {items.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-label-sm text-on-surface-variant">
              {t("task.checklist")}
            </span>
            <span className="text-label-xs text-on-surface-variant">
              {completed}/{items.length}
            </span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <button
              onClick={() => handleToggle(item.id)}
              className="flex-shrink-0 flex items-center justify-center w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity"
              title={item.concluido ? (language === "en" ? "Unmark" : "Desmarcar") : (language === "en" ? "Mark complete" : "Marcar concluído")}
            >
              {item.concluido ? (
                <div className="w-5 h-5 rounded border-2 border-[#6B705C] bg-[#6B705C]" />
              ) : (
                <div className="w-5 h-5 rounded border-2 border-[#A5A58D]" />
              )}
            </button>
            <span
              className={`flex-1 text-body-sm transition-all ${
                item.concluido
                  ? "line-through text-on-surface-variant"
                  : "text-on-surface"
              }`}
            >
              {item.texto}
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#A5A58D] hover:text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded"
              title={language === "en" ? "Delete item" : "Deletar item"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div>
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full px-3 py-2 text-label-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors text-left"
            >
              {t("task.addChecklist")}
            </button>
          ) : (
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder={t("task.newChecklistItem")}
                autoFocus
                className="flex-1 px-3 py-2 bg-surface border border-outline rounded text-body-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!newItemText.trim()}
                className="p-2 text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors disabled:opacity-50"
              >
                <Check size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewItemText("");
                }}
                className="p-2 text-[#A5A58D] hover:text-[#6B705C] hover:bg-[#A5A58D] hover:bg-opacity-20 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
